"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  buildCaption,
  isLiveOnWebsite,
  orderedPhotoUrls,
  trackedUrl,
  withLink,
  type ShareChannel,
  type ShareListing,
  type SharePhoto,
} from "@/lib/shareKit";
import type { Lang } from "@/site/i18n";

/*
| SHARE KIT. One place to post a listing on Facebook, Instagram, Xiaohongshu
| and WhatsApp: a ready caption (English / BM / Chinese), the best photos, the
| listing video, and a tagged link. Nothing is posted automatically: the phone's
| own share menu opens and you tap send yourself.
*/

type Listing = ShareListing & { property_photos?: SharePhoto[] };

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

async function toFile(url: string, name: string): Promise<File> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Could not load ${name}`);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

export default function ShareKit({ listing }: { listing: Listing }) {
  const photos = useMemo(() => orderedPhotoUrls(listing.category, listing.property_photos), [listing]);
  const live = isLiveOnWebsite(listing);

  const [lang, setLang] = useState<Lang>("en");
  const [captionByLang, setCaptionByLang] = useState<Partial<Record<Lang, string>>>({});
  // The caption shows the real (tagged) link; the tag is swapped per channel when sharing.
  const shareLink = trackedUrl(listing.id, lang, "share");
  const caption = captionByLang[lang] ?? withLink(buildCaption(listing, lang), listing.id, lang, "share");

  const [selected, setSelected] = useState<string[]>(() => photos.slice(0, 3));
  const [video, setVideo] = useState<string | null>(null);
  const [useVideo, setUseVideo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // The newest finished video for this listing, if one has been made.
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("ai_video_projects")
      .select("final_video_url, status, completed_at")
      .eq("property_id", listing.id)
      .eq("status", "completed")
      .not("final_video_url", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data?.[0]?.final_video_url) setVideo(data[0].final_video_url as string);
      });
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  const say = (m: string) => {
    setNotice(m);
    window.setTimeout(() => setNotice(""), 4000);
  };

  const captionFor = (channel: ShareChannel) =>
    caption.split(shareLink).join(trackedUrl(listing.id, lang, channel));

  const toggle = (url: string) =>
    setSelected((cur) => (cur.includes(url) ? cur.filter((u) => u !== url) : [...cur, url]));

  async function copyCaption(channel: ShareChannel = "copy") {
    const ok = await copyText(captionFor(channel));
    say(ok ? "Caption copied. Paste it in the app." : "Could not copy. Select the caption and copy it by hand.");
    return ok;
  }

  async function copyLink() {
    const ok = await copyText(trackedUrl(listing.id, lang, "copy"));
    say(ok ? "Link copied." : "Could not copy the link.");
  }

  async function shareToApps() {
    setBusy(true);
    const text = captionFor("share");
    await copyText(text); // many apps drop the shared text, so it is on the clipboard too
    try {
      const files: File[] = [];
      try {
        for (const [i, url] of selected.entries()) files.push(await toFile(url, `photo-${i + 1}.jpg`));
        if (useVideo && video) {
          const res = await fetch(video, { mode: "cors" });
          if (res.ok) files.push(new File([await res.blob()], "video.mp4", { type: "video/mp4" }));
        }
      } catch {
        say("Could not load the photos for sharing. Sharing the link only.");
        files.length = 0;
      }

      const withFiles = files.length > 0 && typeof navigator.canShare === "function" && navigator.canShare({ files });
      if (typeof navigator.share !== "function") {
        say("This browser has no share menu. Caption copied, use the buttons below.");
        return;
      }
      await navigator.share(withFiles ? { files, text } : { text });
      say(withFiles ? "Caption copied. Paste it in the app." : "Shared.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") say("Sharing failed. The caption is copied, try WhatsApp or Facebook below.");
    } finally {
      setBusy(false);
    }
  }

  async function openWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(captionFor("whatsapp"))}`, "_blank", "noopener");
  }

  async function openFacebook() {
    await copyCaption("facebook");
    const u = encodeURIComponent(trackedUrl(listing.id, lang, "facebook"));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank", "noopener");
  }

  const place = [listing.area, listing.city, listing.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-4" data-testid="share-kit">
      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5">
        <h2 className="text-xl font-bold text-stone-900">Share kit</h2>
        <p className="text-sm text-stone-600 mt-1">
          {listing.title || "Listing"}{place ? ` · ${place}` : ""}
        </p>
        {live ? (
          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Public on website
          </span>
        ) : (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-300" data-testid="not-live">
            This listing is not on the website yet (switch &quot;Public website&quot; ON and set the status to Available or
            Booked). The link in the caption will not open until then.
          </p>
        )}
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--copper)]">Language</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Caption language">
          {LANGS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              aria-pressed={lang === l.id}
              className={`min-h-12 rounded-lg border text-sm font-bold ${
                lang === l.id ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5">
        <label htmlFor="share-caption" className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--copper)]">
          Caption (you can edit)
        </label>
        <textarea
          id="share-caption"
          value={caption}
          onChange={(e) => setCaptionByLang((c) => ({ ...c, [lang]: e.target.value }))}
          rows={11}
          className="w-full rounded-lg border border-stone-300 bg-white p-3 text-[15px] leading-6 text-stone-900"
        />
        <p className="mt-2 text-xs text-stone-600">
          The link carries a hidden tag, so you can see in the visitor counter which channel it came from.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => copyCaption()} className="min-h-12 rounded-lg border border-stone-300 bg-white text-sm font-bold">
            Copy caption
          </button>
          <button type="button" onClick={copyLink} className="min-h-12 rounded-lg border border-stone-300 bg-white text-sm font-bold">
            Copy link
          </button>
        </div>
        {captionByLang[lang] !== undefined && (
          <button
            type="button"
            onClick={() => setCaptionByLang((c) => ({ ...c, [lang]: undefined }))}
            className="mt-2 text-xs font-semibold text-stone-600 underline"
          >
            Reset caption
          </button>
        )}
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--copper)]">Photos and video (tap to choose)</p>
        {photos.length === 0 && video === null ? (
          <p className="text-sm text-stone-600">No photos yet. Add them in the Photos tab.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((url) => {
              const on = selected.includes(url);
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => toggle(url)}
                  aria-pressed={on}
                  aria-label={on ? "Photo selected" : "Photo not selected"}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${on ? "border-[var(--copper)]" : "border-stone-200"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  {on && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--copper)] text-xs text-white">✓</span>
                  )}
                </button>
              );
            })}
            {video && (
              <button
                type="button"
                onClick={() => setUseVideo((v) => !v)}
                aria-pressed={useVideo}
                data-testid="video-chip"
                className={`flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border-2 bg-stone-900 text-xs font-bold text-white ${
                  useVideo ? "border-[var(--copper)]" : "border-stone-200"
                }`}
              >
                {useVideo ? "✓ " : ""}▶ Video
              </button>
            )}
          </div>
        )}
        <p className="mt-2 text-xs text-stone-600">
          {selected.length} photo{selected.length === 1 ? "" : "s"} selected{video ? (useVideo ? " + video" : "") : ""}
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={shareToApps}
          disabled={busy}
          data-testid="share-main"
          className="min-h-14 w-full rounded-xl bg-[var(--copper)] px-4 text-base font-bold text-white disabled:opacity-60"
        >
          {busy ? "Preparing…" : "Share to Facebook, Instagram, Xiaohongshu…"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={openWhatsApp} className="min-h-12 rounded-xl bg-[#1fa855] text-sm font-bold text-white">
            WhatsApp
          </button>
          <button type="button" onClick={openFacebook} className="min-h-12 rounded-xl border border-stone-300 bg-white text-sm font-bold">
            Facebook link
          </button>
        </div>
        <p className="text-xs text-stone-600">
          Nothing is posted automatically. Your phone&apos;s share menu opens and you tap send yourself. The caption is copied
          first, so paste it in the app. On Instagram, put the link in your bio or a Story link sticker.
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
