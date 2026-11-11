import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import { endCard, openingOverlay, roomOverlay } from "./overlays";
import { END_SECONDS, FPS, FADE, buildScenes, endCopy, joinFilter, openingCopy, sceneFilter, type Pace, type VideoLang } from "./plan";
import type { ShareListing } from "../shareKit";

/*
| Makes the video: photos are panned with FFmpeg, the words are laid on top and
| the scenes are joined with soft cross-fades. Vertical 720x1280, 30 fps, H.264.
*/

export type RenderInput = {
  listing: ShareListing & { headline?: string | null };
  /** Photo files, in the order they should appear. */
  photos: Buffer[];
  /** One label per photo (the first one is ignored: it gets the title card). */
  labels: string[];
  lang: VideoLang;
  pace: Pace;
  showPrice: boolean;
};

function run(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error("FFmpeg is not available on this server."));
    const p = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-threads", "2", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err = (err + d.toString()).slice(-2000)));
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg failed (${code}): ${err.trim()}`))));
  });
}

/** Run jobs a few at a time (the server has few CPU cores). */
async function pool<T>(items: T[], size: number, fn: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i], i);
      }
    })
  );
}

export async function renderQuickVideo(input: RenderInput): Promise<Buffer> {
  const scenes = buildScenes(input.photos.length, input.labels, input.pace);
  const dir = await mkdtemp(path.join(tmpdir(), "quick-video-"));
  try {
    const opening = openingCopy(input.listing, input.lang, input.showPrice);

    // 1. Photos -> upright JPEGs (phone photos carry a rotation tag), overlays -> PNGs
    await pool(scenes, 3, async (s) => {
      const jpg = await sharp(input.photos[s.index], { failOn: "none" })
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 92 })
        .toBuffer();
      await writeFile(path.join(dir, `p${s.index}.jpg`), jpg);
      const ov = s.kind === "opening" ? await openingOverlay(opening) : await roomOverlay(s.label);
      await writeFile(path.join(dir, `o${s.index}.png`), ov);
    });
    await writeFile(path.join(dir, "end.png"), await endCard(endCopy(input.lang)));

    // 2. One clip per scene, two at a time
    await pool(scenes, 2, async (s) => {
      await run([
        "-loop", "1", "-t", String(s.seconds), "-i", path.join(dir, `p${s.index}.jpg`),
        "-loop", "1", "-t", String(s.seconds), "-i", path.join(dir, `o${s.index}.png`),
        "-filter_complex", sceneFilter(s.dir, s.seconds),
        "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS),
        path.join(dir, `c${s.index}.mp4`),
      ]);
    });
    await run([
      "-loop", "1", "-t", String(END_SECONDS), "-i", path.join(dir, "end.png"),
      "-vf", `fps=${FPS},format=yuv420p,fade=t=in:st=0:d=0.4`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-r", String(FPS),
      path.join(dir, "cend.mp4"),
    ]);

    // 3. Join with soft cross-fades
    const clips = [...scenes.map((s) => path.join(dir, `c${s.index}.mp4`)), path.join(dir, "cend.mp4")];
    const durations = [...scenes.map((s) => s.seconds), END_SECONDS];
    const out = path.join(dir, "video.mp4");
    await run([
      ...clips.flatMap((c) => ["-i", c]),
      "-filter_complex", joinFilter(durations, FADE),
      "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      out,
    ]);
    return await readFile(out);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
