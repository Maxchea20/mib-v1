"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { shrinkImage } from "@/lib/imageResize";
import { BUCKET, CACHE_SECONDS } from "@/lib/photoSize";
import { LIMITS, cleanProfile } from "@/site/profile";

/*
| The owner's profile form. Text is cleaned before it is saved (no HTML, limited
| length). The photo is shrunk in the browser, then stored in the public photo
| bucket under agent/. Nothing appears on the website until "Show on the
| website" is ticked and the profile has a name and at least one introduction.
*/

export type ProfileRow = {
  display_name: string | null;
  headline_en: string | null;
  headline_ms: string | null;
  headline_zh: string | null;
  bio_en: string | null;
  bio_ms: string | null;
  bio_zh: string | null;
  photo_url: string | null;
  specialisations: string[] | null;
  areas: string[] | null;
  languages: string[] | null;
  since_year: number | null;
  is_public: boolean | null;
};

const PHOTO_PATH = "agent/photo.jpg";
const SITE = "https://maxproperty.my/about";

const field = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900";
const label = "block text-sm font-semibold text-slate-800";
const hint = "mt-1 text-xs text-slate-500";
const box = "mt-6 rounded-xl border bg-white p-5 shadow-sm";

export default function ProfileForm({ initial, setupNeeded }: { initial: ProfileRow | null; setupNeeded: boolean }) {
  const [v, setV] = useState({
    display_name: initial?.display_name ?? "",
    headline_en: initial?.headline_en ?? "",
    headline_ms: initial?.headline_ms ?? "",
    headline_zh: initial?.headline_zh ?? "",
    bio_en: initial?.bio_en ?? "",
    bio_ms: initial?.bio_ms ?? "",
    bio_zh: initial?.bio_zh ?? "",
    photo_url: initial?.photo_url ?? "",
    specialisations: (initial?.specialisations ?? []).join(", "),
    areas: (initial?.areas ?? []).join(", "),
    languages: (initial?.languages ?? []).join(", "),
    since_year: initial?.since_year ? String(initial.since_year) : "",
    is_public: initial?.is_public === true,
  });
  const [busy, setBusy] = useState<"" | "save" | "photo">("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saved, setSaved] = useState(initial !== null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((cur) => ({ ...cur, [k]: e.target.value }));

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("photo");
    setMessage(null);
    try {
      const small = await shrinkImage(file, 1000, 0.86);
      const body = small ?? file;
      const { error } = await supabase.storage.from(BUCKET).upload(PHOTO_PATH, body, {
        upsert: true,
        cacheControl: CACHE_SECONDS,
        contentType: small ? "image/jpeg" : file.type || undefined,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(PHOTO_PATH);
      setV((cur) => ({ ...cur, photo_url: `${data.publicUrl}?t=${Date.now()}` }));
      setMessage({ ok: true, text: "Photo uploaded. Press Save to keep it on your profile." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? `Could not upload the photo: ${err.message}` : "Could not upload the photo." });
    } finally {
      setBusy("");
    }
  }

  async function save() {
    setMessage(null);
    const clean = cleanProfile(v);
    if (clean.is_public && (!clean.display_name || !(clean.bio_en || clean.bio_ms || clean.bio_zh))) {
      setMessage({ ok: false, text: "To show the profile on the website, add your name and at least one introduction first." });
      return;
    }
    if (v.photo_url && !clean.photo_url) {
      setMessage({ ok: false, text: "The photo address is not secure (https), so it cannot be saved. Upload the photo again." });
      return;
    }
    setBusy("save");
    try {
      const { error } = await supabase.from("agent_profile").upsert({ id: 1, ...clean, updated_at: new Date().toISOString() });
      if (error) throw error;
      // show what was actually saved (cleaned)
      setV({
        display_name: clean.display_name ?? "",
        headline_en: clean.headline_en ?? "",
        headline_ms: clean.headline_ms ?? "",
        headline_zh: clean.headline_zh ?? "",
        bio_en: clean.bio_en ?? "",
        bio_ms: clean.bio_ms ?? "",
        bio_zh: clean.bio_zh ?? "",
        photo_url: clean.photo_url ?? "",
        specialisations: clean.specialisations.join(", "),
        areas: clean.areas.join(", "),
        languages: clean.languages.join(", "),
        since_year: clean.since_year ? String(clean.since_year) : "",
        is_public: clean.is_public,
      });
      setSaved(true);
      setMessage({
        ok: true,
        text: clean.is_public
          ? "Saved. Your profile is live on the website (it can take up to 5 minutes to update)."
          : "Saved. It is not shown on the website yet.",
      });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? `Could not save: ${err.message}` : "Could not save." });
    } finally {
      setBusy("");
    }
  }

  const bioBox = (lang: "en" | "ms" | "zh", title: string) => (
    <div className={box}>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <label className={`${label} mt-3`} htmlFor={`headline_${lang}`}>Headline (one line)</label>
      <input id={`headline_${lang}`} className={`${field} min-h-12`} value={v[`headline_${lang}` as const]} maxLength={LIMITS.headline} onChange={set(`headline_${lang}` as const)} />
      <label className={`${label} mt-3`} htmlFor={`bio_${lang}`}>Introduction</label>
      <textarea id={`bio_${lang}`} className={`${field} py-2`} rows={8} value={v[`bio_${lang}` as const]} maxLength={LIMITS.bio} onChange={set(`bio_${lang}` as const)} />
      <p className={hint}>Leave a line blank between paragraphs. If a language is empty, visitors see English.</p>
    </div>
  );

  return (
    <div data-testid="profile-form">
      {setupNeeded && (
        <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          The profile table is not set up yet. Run <code className="rounded bg-white px-1">supabase/audit/08_agent_profile.sql</code> once in the
          Supabase SQL editor, then refresh this page.
        </div>
      )}

      <div className={box}>
        <h2 className="text-lg font-bold text-slate-900">Photo and name</h2>
        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="w-32 flex-none">
            {v.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.photo_url} alt="Your profile photo" className="aspect-[4/5] w-32 rounded-xl border object-cover object-top" data-testid="photo" />
            ) : (
              <div className="flex aspect-[4/5] w-32 items-center justify-center rounded-xl border border-dashed text-center text-xs text-slate-500">No photo yet</div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 basis-60 flex-col gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pickPhoto} data-testid="photo-input" aria-label="Choose a photo" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={busy !== ""} className="min-h-12 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold disabled:opacity-50">
                {busy === "photo" ? "Uploading…" : v.photo_url ? "Change photo" : "Upload photo"}
              </button>
              {v.photo_url && (
                <button type="button" onClick={() => setV((c) => ({ ...c, photo_url: "" }))} disabled={busy !== ""} className="min-h-12 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">
                  Remove
                </button>
              )}
            </div>
            <p className={hint}>A clear photo of your face, portrait works best. It is shrunk automatically.</p>
          </div>
        </div>
        <label className={`${label} mt-4`} htmlFor="display_name">Your name</label>
        <input id="display_name" className={`${field} min-h-12`} value={v.display_name} maxLength={LIMITS.name} onChange={set("display_name")} />
        <label className={`${label} mt-3`} htmlFor="since_year">In property since (year, optional)</label>
        <input id="since_year" inputMode="numeric" className={`${field} min-h-12 max-w-40`} value={v.since_year} maxLength={4} onChange={set("since_year")} />
        <p className={hint}>Only state what is true. Shown as &quot;In property since …&quot; on the website.</p>
      </div>

      {bioBox("en", "English")}
      {bioBox("ms", "Bahasa Melayu")}
      {bioBox("zh", "中文")}

      <div className={box}>
        <h2 className="text-lg font-bold text-slate-900">What you do</h2>
        <label className={`${label} mt-3`} htmlFor="specialisations">Specialises in</label>
        <input id="specialisations" className={`${field} min-h-12`} value={v.specialisations} onChange={set("specialisations")} placeholder="Factories, Industrial land, Warehouses" />
        <label className={`${label} mt-3`} htmlFor="areas">Areas</label>
        <input id="areas" className={`${field} min-h-12`} value={v.areas} onChange={set("areas")} placeholder="Ipoh, Kinta, Perak" />
        <label className={`${label} mt-3`} htmlFor="languages">Languages</label>
        <input id="languages" className={`${field} min-h-12`} value={v.languages} onChange={set("languages")} placeholder="English, Bahasa Melayu, Chinese" />
        <p className={hint}>Separate items with commas. Up to {LIMITS.items} each.</p>
      </div>

      <div className={box}>
        <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-bold text-slate-900">
          <input type="checkbox" checked={v.is_public} onChange={(e) => setV((c) => ({ ...c, is_public: e.target.checked }))} className="h-5 w-5 accent-[var(--copper)]" data-testid="is-public" />
          Show on the website (maxproperty.my/about)
        </label>
        <p className={hint}>Your REN number and WhatsApp are added automatically from the website settings. Untick to hide the page again.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={busy !== "" || setupNeeded} className="min-h-12 rounded-lg bg-[var(--copper)] px-6 text-sm font-bold text-white disabled:opacity-50" data-testid="save">
            {busy === "save" ? "Saving…" : "Save profile"}
          </button>
          {saved && v.is_public && (
            <a href={SITE} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold underline">View on the website</a>
          )}
        </div>
        {message && (
          <p role="status" className={`mt-3 text-sm font-semibold ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
        )}
      </div>
    </div>
  );
}
