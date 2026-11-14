import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp, { type Sharp } from "sharp";
import { renderSheet, type Slice } from "./overlays";
import {
  ENCODER_ARGS, HEIGHT, LAYOUT, WIDTH,
  buildFilterGraph, buildTimeline, endCopy, factsCopy, hasFacts, openingCopy, totalSeconds,
  type Length, type SceneInput, type VideoLang,
} from "./plan";
import type { ShareListing } from "../shareKit";

/*
| Makes the video. Photos are shown whole on a blurred copy of themselves, with a slow zoom or drift;
| the words are baked into each scene's background (they fade in with the scene's cross-fade), and
| every scene is joined in ONE FFmpeg pass. Vertical 1080 x 1920, 24 fps, H.264.
|
| Speed matters: the server has one slow core and 60 seconds. Pictures are decoded once and repeated,
| words are drawn in one pass, and a 9-photo video takes about 15 seconds instead of over a minute.
*/

export type RenderInput = {
  listing: ShareListing & { headline?: string | null };
  /** Photo files, in the order they should appear. */
  photos: Buffer[];
  /** One label per photo (the first one is ignored: it gets the title card). */
  labels: string[];
  lang: VideoLang;
  length: Length;
  showPrice: boolean;
  showFacts: boolean;
  /** Give up (and say so) when FFmpeg runs past this many milliseconds. */
  ffmpegBudgetMs?: number;
};

export type RenderResult = { video: Buffer; seconds: number; scenes: number; ms: Record<string, number> };

export class RenderTimeoutError extends Error {
  constructor() {
    super("The video took too long to make. Try fewer photos, or choose the Shorter length.");
  }
}

function runFfmpeg(args: string[], budgetMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error("FFmpeg is not available on this server."));
    const p = spawn(ffmpegPath, ["-y", "-loglevel", "error", ...args], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      p.kill("SIGKILL");
    }, Math.max(1000, budgetMs));
    p.stderr.on("data", (d) => (err = (err + d.toString()).slice(-1500)));
    p.on("error", (e) => { clearTimeout(timer); reject(e); });
    p.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) return reject(new RenderTimeoutError());
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg failed (${code}): ${err.trim()}`));
    });
  });
}

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

/** Darkening at the top (brand) and bottom (words) so text is always easy to read. */
const SHADE = Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg"><defs>` +
    `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="0.16" stop-color="#000" stop-opacity="0"/>` +
    `<stop offset="0.56" stop-color="#000" stop-opacity="0"/><stop offset="0.8" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/>` +
    `</linearGradient></defs><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/></svg>`
);

const END_BG = Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg"><defs>` +
    `<radialGradient id="r" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#1d1a10"/><stop offset="1" stop-color="#0A0A0B"/></radialGradient>` +
    `</defs><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#r)"/></svg>`
);

/** A blurred, darkened copy of the photo that fills the whole screen behind it. */
async function blurredBackground(base: Buffer, brightness: number): Promise<Buffer> {
  const small = await sharp(base).resize(108, 192, { fit: "cover" }).blur(2).modulate({ brightness, saturation: 1.1 }).toBuffer();
  return sharp(small).resize(WIDTH, HEIGHT, { kernel: "cubic" }).toBuffer();
}

type Part = { input: Buffer; left: number; top: number };

/** Gentle automatic touch-up: lift dark photos and add a little contrast. Never extreme. */
async function touchUp(buf: Buffer): Promise<Buffer> {
  try {
    const st = await sharp(buf).stats();
    const [r, g, b] = st.channels;
    const mean = 0.299 * r.mean + 0.587 * g.mean + 0.114 * b.mean;
    const spread = st.channels[0].max - st.channels[0].min;
    let img = sharp(buf);
    if (mean < 118) {
      // brighten dark rooms by up to ~18%
      img = img.modulate({ brightness: Math.min(1.18, 1 + (118 - mean) / 200) });
    } else if (mean > 190) {
      img = img.modulate({ brightness: 0.95 });
    }
    // flat photos get a mild contrast lift around mid-grey
    if (spread < 230) img = img.linear(1.08, -10);
    return await img.toBuffer();
  } catch {
    return buf; // never fail a video because of a touch-up
  }
}

export async function renderQuickVideo(input: RenderInput): Promise<RenderResult> {
  const ms: Record<string, number> = {};
  const t0 = Date.now();
  const lap = (k: string) => { ms[k] = Date.now() - t0 - Object.values(ms).reduce((a, b) => a + b, 0); };

  const facts = input.showFacts ? factsCopy(input.listing, input.lang, input.showPrice) : null;
  const useFacts = facts !== null && hasFacts(facts);
  const scenes = buildTimeline(input.photos.length, input.labels, { length: input.length, facts: useFacts });

  // words: one drawing pass for the whole video
  const labelScenes = scenes.filter((s) => s.kind === "photo" && s.label !== "");
  const sheet = await renderSheet({
    lang: input.lang,
    opening: openingCopy(input.listing, input.lang, input.showPrice),
    labels: labelScenes.map((s) => s.label),
    facts: useFacts ? facts : null,
    end: endCopy(input.lang),
  });
  const cut = (s: Slice) => sharp(sheet.png).extract({ left: 0, top: s.top, width: WIDTH, height: s.height }).png().toBuffer();
  const header = await cut(sheet.layout.header);
  const openingText = await cut(sheet.layout.opening);
  const labelText = new Map<number, Buffer>();
  for (let i = 0; i < labelScenes.length; i++) labelText.set(labelScenes[i].index, await cut(sheet.layout.labels[i]));
  lap("words");

  const dir = await mkdtemp(path.join(tmpdir(), "quick-video-"));
  try {
    // pictures: one background and one moving photo per photo scene, plus the card backgrounds
    const files: string[] = [];
    const inputs: SceneInput[] = [];
    const bases: Buffer[] = new Array(input.photos.length);

    await pool(input.photos, 3, async (buf, i) => {
      const resized = await sharp(buf, { failOn: "none" }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).toBuffer();
      bases[i] = await touchUp(resized);
    });

    const fgInfo = new Map<number, { file: string; baseW: number }>();
    await pool(input.photos, 3, async (_b, i) => {
      const file = path.join(dir, `fg${i}.jpg`);
      const info = await sharp(bases[i])
        .resize({ width: Math.round(LAYOUT.boxW * LAYOUT.headroom), height: Math.round(LAYOUT.boxH * LAYOUT.headroom), fit: "inside" })
        .jpeg({ quality: 90 })
        .toFile(file);
      fgInfo.set(i, { file, baseW: 2 * Math.round(info.width / LAYOUT.headroom / 2) });
    });

    const bgFile = (n: number) => path.join(dir, `bg${n}.jpg`);
    await pool(scenes, 3, async (s) => {
      let img: Sharp;
      const parts: Part[] = [];
      if (s.kind === "end") {
        img = sharp(END_BG);
        parts.push({ input: await cut(sheet.layout.end), left: 0, top: Math.round((HEIGHT - sheet.layout.end.height) / 2) });
      } else if (s.kind === "facts") {
        img = sharp(await blurredBackground(bases[0], 0.3));
        parts.push({ input: header, left: 0, top: LAYOUT.headerTop });
        parts.push({ input: await cut(sheet.layout.facts!), left: 0, top: Math.round((HEIGHT - sheet.layout.facts!.height) / 2) });
      } else {
        const photo = s.photo ?? 0;
        img = sharp(await blurredBackground(bases[photo], 0.5));
        parts.push({ input: SHADE, left: 0, top: 0 });
        parts.push({ input: header, left: 0, top: LAYOUT.headerTop });
        const text = s.kind === "opening" ? openingText : labelText.get(s.index);
        if (text) parts.push({ input: text, left: 0, top: s.kind === "opening" ? LAYOUT.textTop - 5 : LAYOUT.textTop + 15 });
      }
      await img.composite(parts).jpeg({ quality: 86 }).toFile(bgFile(s.index));
    });

    for (const s of scenes) {
      const bg = files.push(bgFile(s.index)) - 1;
      const fg = s.photo !== null && s.motion ? fgInfo.get(s.photo) : undefined;
      inputs.push({ bg, fg: fg ? files.push(fg.file) - 1 : null, baseW: fg?.baseW ?? 0 });
    }
    lap("pictures");

    const out = path.join(dir, "video.mp4");
    const graph = buildFilterGraph(scenes, inputs);
    const budget = input.ffmpegBudgetMs ?? 40_000;
    await runFfmpeg(
      [...files.flatMap((f) => ["-i", f]), "-filter_complex", graph, "-map", "[v]", ...ENCODER_ARGS, out],
      budget - (Date.now() - t0)
    );
    lap("encode");

    const video = await readFile(out);
    lap("read");
    return { video, seconds: totalSeconds(scenes), scenes: scenes.length, ms };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
