"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cleanLabel, defaultLabel, MAX_LABEL, MAX_PHOTOS, type Pace, type VideoLang } from "@/lib/quickVideo/plan";

/*
| QUICK VIDEO. Makes a vertical video from the listing's own photos: slow pans,
| the title / price / place, room labels and a Max Property closing card.
| Nothing is invented by AI, so the video always shows the property as it is.
*/

type Photo = { id: number; photo_type: string | null; image_url: string | null };
type Listing = { id: number; category?: string | null; property_photos?: Photo[] };
type Project = { id: string; final_video_url: string | null; completed_at: string | null };

/** Photo order: cover first, then the order MIB lists the photo types in. */
const ORDER: Record<string, string[]> = {
  Residential: ["Front House", "Living Room", "Kitchen", "Master Bedroom", "Bedroom 2", "Bedroom 3", "Bathroom", "Car Porch", "Backyard"],
  Commercial: ["Shop Front", "Interior", "Office Area", "Toilet", "Parking", "Road Frontage"],
  Industrial: ["Factory Front", "Main Gate", "Office", "Warehouse", "Production Area", "Loading Bay", "Electrical Room", "Compound", "Road Access"],
  Land: ["Front View", "Road Frontage", "Left Boundary", "Right Boundary", "Surrounding Area", "Drone View"],
};

function sortPhotos(category: string | null | undefined, photos: Photo[]): Photo[] {
  const order = ORDER[category ?? ""] ?? [];
  const rank = (p: Photo) => {
    const i = order.indexOf(p.photo_type ?? "");
    return i === -1 ? 999 : i;
  };
  return photos.filter((p) => p.image_url).sort((a, b) => rank(a) - rank(b) || a.id - b.id);
}

export default function QuickVideoTab({ listing }: { listing: Listing }) {
  const photos = useMemo(() => sortPhotos(listing.category, listing.property_photos ?? []), [listing]);

  const [lang, setLang] = useState<VideoLang>("en");
  const [pace, setPace] = useState<Pace>("standard");
  const [showPrice, setShowPrice] = useState(true);
  const [chosen, setChosen] = useState<number[]>(() => photos.slice(0, 8).map((p) => p.id));
  const [labels, setLabels] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [past, setPast] = useState<Project[]>([]);
  const timer = useRef<number | null>(null);

  const byId = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);
  const labelOf = (p: Photo) => labels[p.id] ?? defaultLabel(p.photo_type, lang);

  async function loadPast() {
    const { data } = await supabase
      .from("ai_video_projects")
      .select("id, final_video_url, completed_at")
      .eq("property_id", listing.id)
      .eq("status", "completed")
      .not("final_video_url", "is", null)
      .order("completed_at", { ascending: false })
      .limit(12);
    setPast((data as Project[]) ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPast();
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id]);

  const toggle = (id: number) =>
    setChosen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_PHOTOS ? cur : [...cur, id]));

  const move = (id: number, delta: number) =>
    setChosen((cur) => {
      const i = cur.indexOf(id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function make() {
    setError("");
    setResult(null);
    setBusy(true);
    setSeconds(0);
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    try {
      const res = await fetch("/api/video/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: listing.id,
          photoIds: chosen,
          labels: chosen.map((id) => cleanLabel(labelOf(byId.get(id)!))),
          lang,
          pace,
          showPrice,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The video could not be made.");
      setResult(data.url as string);
      await loadPast();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The video could not be made.");
    } finally {
      if (timer.current) window.clearInterval(timer.current);
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this video? This cannot be undone.")) return;
    const res = await fetch(`/api/video/quick?projectId=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete the video.");
      return;
    }
    setPast((p) => p.filter((x) => x.id !== id));
  }

  const box = "bg-white border rounded-xl shadow-sm p-4 sm:p-5";
  const cap = "mb-2 text-xs font-bold uppercase tracking-wide text-[var(--copper)]";
  const seg = (on: boolean) =>
    `min-h-12 rounded-lg border text-sm font-bold ${on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-800"}`;

  return (
    <div className="space-y-4" data-testid="quick-video">
      <div className={box}>
        <h2 className="text-xl font-bold text-stone-900">Make a video</h2>
        <p className="mt-1 text-sm text-stone-600">
          A vertical video (TikTok, Instagram, Xiaohongshu) made from this listing&apos;s real photos, with the title, price,
          place and your contact. Nothing is made up by AI, so it shows the property exactly as it is.
        </p>
      </div>

      <div className={box}>
        <p className={cap}>Photos ({chosen.length} chosen, in this order)</p>
        {photos.length === 0 ? (
          <p className="text-sm text-stone-600">No photos yet. Add them in the Photos tab first.</p>
        ) : (
          <ul className="space-y-2">
            {chosen.map((id, i) => {
              const p = byId.get(id);
              if (!p) return null;
              return (
                <li key={id} className="flex items-center gap-3 rounded-lg border border-stone-200 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url!} alt="" className="h-14 w-20 shrink-0 rounded object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-stone-500">{i === 0 ? "Opening photo (title card)" : p.photo_type || "Photo"}</p>
                    {i === 0 ? (
                      <p className="text-sm font-semibold text-stone-800">Shows the title, price and place</p>
                    ) : (
                      <input
                        value={labelOf(p)}
                        onChange={(e) => setLabels((l) => ({ ...l, [id]: e.target.value }))}
                        maxLength={MAX_LABEL}
                        placeholder="Label on screen (optional)"
                        aria-label="Label on screen"
                        className="h-10 w-full rounded-lg border border-stone-300 px-2 text-sm"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => move(id, -1)} disabled={i === 0} aria-label="Move up" className="h-9 w-9 rounded border border-stone-300 text-sm disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => move(id, 1)} disabled={i === chosen.length - 1} aria-label="Move down" className="h-9 w-9 rounded border border-stone-300 text-sm disabled:opacity-30">↓</button>
                  </div>
                  <button type="button" onClick={() => toggle(id)} aria-label="Remove photo" className="h-11 w-11 shrink-0 rounded border border-stone-300 text-lg">✕</button>
                </li>
              );
            })}
          </ul>
        )}

        {photos.some((p) => !chosen.includes(p.id)) && (
          <>
            <p className={`${cap} mt-4`}>More photos (tap to add)</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos
                .filter((p) => !chosen.includes(p.id))
                .map((p) => (
                  <button key={p.id} type="button" onClick={() => toggle(p.id)} aria-label={`Add ${p.photo_type || "photo"}`} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url!} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-xs text-white">+</span>
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      <div className={box}>
        <p className={cap}>Text on the video</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Video language">
          <button type="button" onClick={() => { setLang("en"); setLabels({}); }} aria-pressed={lang === "en"} className={seg(lang === "en")}>English</button>
          <button type="button" onClick={() => { setLang("ms"); setLabels({}); }} aria-pressed={lang === "ms"} className={seg(lang === "ms")}>Bahasa Malaysia</button>
        </div>
        <p className={`${cap} mt-4`}>Speed</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Speed">
          <button type="button" onClick={() => setPace("standard")} aria-pressed={pace === "standard"} className={seg(pace === "standard")}>Standard</button>
          <button type="button" onClick={() => setPace("fast")} aria-pressed={pace === "fast"} className={seg(pace === "fast")}>Fast (shorter)</button>
        </div>
        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 text-sm font-bold">
          <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="h-5 w-5 accent-[var(--copper)]" />
          Show the price on the video
        </label>
        <p className="mt-1 text-xs text-stone-500">Chinese text on the video is not available yet. Chinese captions are in the Share tab.</p>
      </div>

      <button
        type="button"
        onClick={make}
        disabled={busy || chosen.length === 0}
        data-testid="make-video"
        className="min-h-14 w-full rounded-xl bg-[var(--copper)] px-4 text-base font-bold text-white disabled:opacity-60"
      >
        {busy ? `Making your video… ${seconds}s` : "Make video"}
      </button>
      {busy && <p className="text-center text-sm text-stone-600">This takes about 15 to 40 seconds. Please keep this page open.</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800 ring-1 ring-inset ring-red-200" data-testid="video-error">{error}</p>}

      {result && (
        <div className={box} data-testid="video-result">
          <p className={cap}>Your video is ready</p>
          <video src={result} controls playsInline className="mx-auto max-h-[70vh] rounded-lg bg-black" />
          <p className="mt-2 text-sm text-stone-600">Open the <b>Share</b> tab to post it on TikTok, Instagram or Xiaohongshu.</p>
        </div>
      )}

      {past.length > 0 && (
        <div className={box}>
          <p className={cap}>Earlier videos</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {past.map((v) => (
              <li key={v.id} className="space-y-1">
                <video src={v.final_video_url!} controls playsInline preload="metadata" className="aspect-[9/16] w-full rounded-lg bg-black object-cover" />
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{v.completed_at ? new Date(v.completed_at).toLocaleDateString("en-MY") : ""}</span>
                  <button type="button" onClick={() => remove(v.id)} className="min-h-9 px-2 font-semibold text-red-700 underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
