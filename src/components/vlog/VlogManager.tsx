"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LIMITS, cleanVideo, moveVideo, nextTopOrder, parseYouTubeId, sortVideos, thumbUrl, watchUrl } from "@/site/vlog";

export type AdminVideo = {
  id: number; youtube_id: string; title_en: string | null; title_ms: string | null; title_zh: string | null;
  desc_en: string | null; desc_ms: string | null; desc_zh: string | null; property_id: number | null; sort_order: number; is_public: boolean;
};
export type ListingOption = { id: number; title: string | null };

const field = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900";
const label = "block text-sm font-semibold text-slate-800";
const hint = "mt-1 text-xs text-slate-500";
const box = "mt-5 rounded-xl border bg-white p-5 shadow-sm";
const btn = "min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 disabled:opacity-50";

const blank = { url: "", title_en: "", title_ms: "", title_zh: "", desc_en: "", desc_ms: "", desc_zh: "", property_id: "", is_public: true };

export default function VlogManager({ initial, listings, setupNeeded }: { initial: AdminVideo[]; listings: ListingOption[]; setupNeeded: boolean }) {
  const [videos, setVideos] = useState(() => sortVideos(initial));
  const [form, setForm] = useState({ ...blank });
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const titleOf = (v: AdminVideo) => v.title_en || v.title_ms || v.title_zh || v.youtube_id;
  const listingName = (id: number | null) => (id ? listings.find((l) => l.id === id)?.title || `Listing ${id}` : "");
  const previewId = parseYouTubeId(form.url);
  const say = (ok: boolean, text: string) => setMessage({ ok, text });

  function startEdit(v: AdminVideo) {
    setEditing(v.id);
    setForm({ url: watchUrl(v.youtube_id), title_en: v.title_en ?? "", title_ms: v.title_ms ?? "", title_zh: v.title_zh ?? "", desc_en: v.desc_en ?? "", desc_ms: v.desc_ms ?? "", desc_zh: v.desc_zh ?? "", property_id: v.property_id ? String(v.property_id) : "", is_public: v.is_public });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const cancel = () => { setEditing(null); setForm({ ...blank }); };

  async function save() {
    setMessage(null);
    const c = cleanVideo(form);
    if (!c.ok) return say(false, c.error);
    setBusy(true);
    try {
      if (editing === null) {
        const row = { ...c.row, sort_order: nextTopOrder(videos) };
        const { data, error } = await supabase.from("vlog_videos").insert(row).select("*").single();
        if (error) throw error;
        setVideos((cur) => sortVideos([data as AdminVideo, ...cur]));
        setForm({ ...blank });
        say(true, "Added. It appears on the website within about 5 minutes.");
      } else {
        const { data, error } = await supabase.from("vlog_videos").update(c.row).eq("id", editing).select("*").single();
        if (error) throw error;
        setVideos((cur) => sortVideos(cur.map((v) => (v.id === editing ? (data as AdminVideo) : v))));
        cancel();
        say(true, "Saved.");
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : (e as { message?: string })?.message ?? "";
      say(false, /duplicate|unique/i.test(m) ? "That video is already in the list." : `Could not save. ${m}`);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(v: AdminVideo) {
    setBusy(true);
    const { error } = await supabase.from("vlog_videos").update({ is_public: !v.is_public }).eq("id", v.id);
    if (error) say(false, "Could not change it. Try again.");
    else setVideos((cur) => cur.map((x) => (x.id === v.id ? { ...x, is_public: !v.is_public } : x)));
    setBusy(false);
  }

  async function move(v: AdminVideo, dir: -1 | 1) {
    const changes = moveVideo(videos, v.id, dir);
    if (!changes) return;
    setBusy(true);
    const results = await Promise.all(changes.map((c) => supabase.from("vlog_videos").update({ sort_order: c.sort_order }).eq("id", c.id)));
    if (results.some((r) => r.error)) say(false, "Could not change the order. Refresh and try again.");
    else setVideos((cur) => sortVideos(cur.map((x) => ({ ...x, sort_order: changes.find((c) => c.id === x.id)?.sort_order ?? x.sort_order }))));
    setBusy(false);
  }

  async function remove(v: AdminVideo) {
    if (!window.confirm(`Remove "${titleOf(v)}" from the Vlog?\n\nThe video itself stays on YouTube.`)) return;
    setBusy(true);
    const { error } = await supabase.from("vlog_videos").delete().eq("id", v.id);
    if (error) say(false, "Could not remove it. Try again.");
    else { setVideos((cur) => cur.filter((x) => x.id !== v.id)); if (editing === v.id) cancel(); }
    setBusy(false);
  }

  const lang = (code: "en" | "ms" | "zh", name: string) => (
    <div className="mt-4 rounded-lg border border-slate-200 p-3">
      <p className="text-sm font-bold text-slate-900">{name}</p>
      <label className={`${label} mt-2`} htmlFor={`t_${code}`}>Title</label>
      <input id={`t_${code}`} className={`${field} min-h-12`} value={form[`title_${code}` as const]} maxLength={LIMITS.title} onChange={set(`title_${code}` as const)} />
      <label className={`${label} mt-2`} htmlFor={`d_${code}`}>Description (optional)</label>
      <textarea id={`d_${code}`} className={`${field} py-2`} rows={4} value={form[`desc_${code}` as const]} maxLength={LIMITS.desc} onChange={set(`desc_${code}` as const)} />
    </div>
  );

  return (
    <div data-testid="vlog-manager">
      {setupNeeded && (
        <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          The Vlog table is not set up yet. Run <code className="rounded bg-white px-1">supabase/audit/09_vlog.sql</code> once in the Supabase SQL editor, then refresh this page.
        </div>
      )}

      <section className={box}>
        <h2 className="text-lg font-bold text-slate-900">{editing === null ? "Add a video" : "Edit video"}</h2>
        <label className={`${label} mt-3`} htmlFor="url">YouTube link</label>
        <input id="url" className={`${field} min-h-12`} value={form.url} onChange={set("url")} placeholder="https://www.youtube.com/watch?v=…  or  https://youtu.be/…" inputMode="url" autoComplete="off" />
        {form.url.trim() !== "" && !previewId && <p className="mt-1 text-xs font-semibold text-red-700">That does not look like a YouTube video link.</p>}
        {previewId && (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbUrl(previewId)} alt="Video thumbnail" className="aspect-video w-40 rounded-lg border object-cover" data-testid="preview" />
            <p className="text-xs text-slate-600">Thumbnail from YouTube. If it is grey, check that the video is Public or Unlisted on YouTube.</p>
          </div>
        )}
        {lang("en", "English")}
        {lang("ms", "Bahasa Melayu")}
        {lang("zh", "中文")}
        <p className={hint}>Fill at least one title. Empty languages show the English text.</p>

        <label className={`${label} mt-4`} htmlFor="property">About a listing (optional)</label>
        <select id="property" className={`${field} min-h-12`} value={form.property_id} onChange={set("property_id")}>
          <option value="">Not about one listing</option>
          {listings.map((l) => (<option key={l.id} value={l.id}>{l.title || `Listing ${l.id}`}</option>))}
        </select>
        <p className={hint}>The video then also plays on that listing&apos;s page (when the listing is public).</p>

        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 text-sm font-bold text-slate-900">
          <input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))} className="h-5 w-5 accent-[var(--copper)]" />
          Show on the website
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={busy || setupNeeded} className="min-h-12 rounded-lg bg-[var(--copper)] px-6 text-sm font-bold text-white disabled:opacity-50" data-testid="save-video">
            {busy ? "Saving…" : editing === null ? "Add video" : "Save changes"}
          </button>
          {editing !== null && <button type="button" onClick={cancel} className={btn}>Cancel</button>}
        </div>
        {message && <p role="status" className={`mt-3 text-sm font-semibold ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>}
      </section>

      <section className="mt-6" data-testid="video-list">
        <h2 className="text-lg font-bold text-slate-900">Your videos ({videos.length})</h2>
        <p className="text-sm text-slate-600">The first video is shown first on the website.</p>
        {videos.length === 0 && <p className="mt-3 rounded-xl border bg-white p-5 text-sm text-slate-700">No videos yet.</p>}
        <div className="mt-3 flex flex-col gap-3">
          {videos.map((v, i) => (
            <article key={v.id} className="flex flex-wrap items-start gap-3 rounded-xl border bg-white p-4" data-testid="video-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbUrl(v.youtube_id)} alt="" className="aspect-video w-36 flex-none rounded-lg border object-cover" />
              <div className="min-w-0 flex-1 basis-48">
                <h3 className="text-base font-bold text-slate-900">{titleOf(v)}</h3>
                <p className="text-xs text-slate-600">
                  {v.is_public ? "Shown on the website" : "Hidden"}{v.property_id ? ` · About: ${listingName(v.property_id)}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={btn} onClick={() => move(v, -1)} disabled={busy || i === 0} aria-label="Move up">↑</button>
                  <button type="button" className={btn} onClick={() => move(v, 1)} disabled={busy || i === videos.length - 1} aria-label="Move down">↓</button>
                  <button type="button" className={btn} onClick={() => toggle(v)} disabled={busy}>{v.is_public ? "Hide" : "Show"}</button>
                  <button type="button" className={btn} onClick={() => startEdit(v)} disabled={busy}>Edit</button>
                  <button type="button" className={`${btn} text-red-700`} onClick={() => remove(v)} disabled={busy}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
