"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildPlatformCaption, isLiveOnWebsite, type Platform, type ShareListing } from "@/lib/shareKit";
import type { Lang } from "@/site/i18n";

/*
| SHARE. Post the listing's video on TikTok, Instagram or Xiaohongshu with a
| caption written for that app. Nothing is posted automatically: the phone's own
| share menu opens with the video attached and you tap send yourself.
*/

type Project = { id: string; final_video_url: string | null; completed_at: string | null };

const PLATFORMS: { id: Platform; label: string; defaultLang: Lang }[] = [
  { id: "tiktok", label: "TikTok", defaultLang: "en" },
  { id: "instagram", label: "Instagram", defaultLang: "en" },
  { id: "xiaohongshu", label: "小红书", defaultLang: "zh" },
];
const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ms", label: "BM" },
  { id: "zh", label: "中文" },
];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function ShareKit({ listing }: { listing: ShareListing }) {
  const [videos, setVideos] = useState<Project[] | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [lang, setLang] = useState<Lang>("en");
  const [contact, setContact] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("ai_video_projects")
      .select("id, final_video_url, completed_at")
      .eq("property_id", listing.id)
      .eq("status", "completed")
      .not("final_video_url", "is", null)
      .order("completed_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (!cancelled) setVideos((data as Project[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  const video = videos?.[videoIndex] ?? null;
  const key = `${platform}-${lang}-${contact}`;
  const built = useMemo(() => buildPlatformCaption(listing, lang, platform, { includeContact: contact }), [listing, lang, platform, contact]);
  const text = edited[key] ?? built.full;
  const live = isLiveOnWebsite(listing);

  const say = (m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(""), 4500);
  };

  function pickPlatform(p: Platform) {
    setPlatform(p);
    setLang(PLATFORMS.find((x) => x.id === p)!.defaultLang);
  }

  async function loadFile(): Promise<File> {
    const res = await fetch(video!.final_video_url!, { mode: "cors" });
    if (!res.ok) throw new Error("Could not load the video.");
    return new File([await res.blob()], `${listing.id}-video.mp4`, { type: "video/mp4" });
  }

  async function copyCaption() {
    const ok = await copyText(text);
    say(ok ? "Caption copied. Paste it in the app." : "Could not copy. Select the caption and copy it by hand.");
  }

  async function share() {
    if (!video) return;
    setBusy(true);
    await copyText(text); // the apps often ignore shared text, so it is on the clipboard too
    try {
      const file = await loadFile();
      if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function" || !navigator.canShare({ files: [file] })) {
        say("This browser cannot share videos. Use Save video, then post it from your gallery. The caption is copied.");
        return;
      }
      await navigator.share({ files: [file], text });
      say("Caption copied. Paste it in the app before you post.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") say("Sharing failed. Use Save video, then post it from your gallery. The caption is copied.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!video) return;
    setBusy(true);
    try {
      const file = await loadFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      await copyText(text);
      say("Video saved to your phone. Caption copied.");
    } catch {
      say("Could not save the video.");
    } finally {
      setBusy(false);
    }
  }

  const box = "bg-white border rounded-xl shadow-sm p-4 sm:p-5";
  const cap = "mb-2 text-xs font-bold uppercase tracking-wide text-[var(--copper)]";
  const seg = (on: boolean) => `min-h-12 rounded-lg border text-sm font-bold ${on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800"}`;

  if (videos === null) return <p className="text-sm text-stone-600">Loading…</p>;

  if (!video) {
    return (
      <div className={`${box} text-center`} data-testid="no-video">
        <div className="text-4xl">🎬</div>
        <h2 className="mt-2 text-lg font-bold text-stone-900">No video for this listing yet</h2>
        <p className="mt-1 text-sm text-stone-600">
          Open the <b>Video</b> tab and tap <b>Make video</b>. It is made from the listing&apos;s photos and takes under a minute.
          It will appear here when it is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="share-kit">
      <div className={box}>
        <p className={cap}>Your video</p>
        <div className="flex gap-3">
          <video src={video.final_video_url!} controls playsInline preload="metadata" className="h-48 w-[108px] shrink-0 rounded-lg bg-black object-cover" />
          <div className="min-w-0 text-sm text-stone-700">
            <p className="font-bold text-stone-900">{listing.title || "Listing"}</p>
            <p>Vertical 9:16, ready to post</p>
            {videos.length > 1 && (
              <label className="mt-2 block text-xs text-stone-600">
                Video
                <select value={videoIndex} onChange={(e) => setVideoIndex(Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-stone-300 bg-white px-2 text-sm" aria-label="Choose video">
                  {videos.map((v, i) => (
                    <option key={v.id} value={i}>
                      {i === 0 ? "Latest" : `Earlier`} · {v.completed_at ? new Date(v.completed_at).toLocaleDateString("en-MY") : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className={box}>
        <p className={cap}>Post to</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="App">
          {PLATFORMS.map((p) => (
            <button key={p.id} type="button" onClick={() => pickPlatform(p.id)} aria-pressed={platform === p.id} className={seg(platform === p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <p className={`${cap} mt-4`}>Caption language</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Caption language">
          {LANGS.map((l) => (
            <button key={l.id} type="button" onClick={() => setLang(l.id)} aria-pressed={lang === l.id} className={seg(lang === l.id)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className={box}>
        <label htmlFor="share-caption" className={`${cap} block`}>
          {platform === "xiaohongshu" ? "Title + caption (you can edit)" : `Caption for ${PLATFORMS.find((p) => p.id === platform)!.label} (you can edit)`}
        </label>
        <textarea
          id="share-caption"
          value={text}
          onChange={(e) => setEdited((c) => ({ ...c, [key]: e.target.value }))}
          rows={platform === "tiktok" ? 9 : 12}
          className="w-full rounded-lg border border-stone-300 bg-white p-3 text-[15px] leading-6 text-stone-900"
        />
        {edited[key] !== undefined && (
          <button type="button" onClick={() => setEdited((c) => { const n = { ...c }; delete n[key]; return n; })} className="mt-1 text-xs font-semibold text-stone-600 underline">
            Reset caption
          </button>
        )}
        {platform === "xiaohongshu" && (
          <>
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 ring-1 ring-inset ring-amber-200">
              Xiaohongshu may remove phone numbers and links, so this caption asks people to message you instead. Paste the first
              line into the title box.
            </p>
            <label className="mt-2 flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} className="h-5 w-5 accent-[var(--copper)]" />
              Add my WhatsApp number and REN
            </label>
          </>
        )}
        {platform !== "xiaohongshu" && !live && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 ring-1 ring-inset ring-amber-200" data-testid="not-live">
            This listing is not on the website yet, so the address in the caption will not open. Switch &quot;Public website&quot; ON and set the status to Available or Booked.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <button type="button" onClick={share} disabled={busy} data-testid="share-main" className="min-h-14 w-full rounded-xl bg-[var(--copper)] px-4 text-base font-bold text-white disabled:opacity-60">
          {busy ? "Preparing…" : `Share video to ${PLATFORMS.find((p) => p.id === platform)!.label}…`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={save} disabled={busy} className="min-h-12 rounded-xl border border-stone-300 bg-white text-sm font-bold disabled:opacity-60">Save video to phone</button>
          <button type="button" onClick={copyCaption} className="min-h-12 rounded-xl border border-stone-300 bg-white text-sm font-bold">Copy caption</button>
        </div>
        <p className="text-xs text-stone-600">
          Your phone&apos;s share menu opens with the video attached and the caption is copied, so paste it before you post. Nothing is
          posted automatically. On Instagram you can skip adding music: the video is ready, or pick a trending sound in the app.
        </p>
      </div>

      {notice && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-50 rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-lg md:left-auto md:max-w-sm" data-testid="notice">
          {notice}
        </div>
      )}
    </div>
  );
}
