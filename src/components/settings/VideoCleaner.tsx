"use client";

import { useRef, useState } from "react";
import { DEFAULT_CUTOFF } from "@/lib/videoCleanup";

/*
| One-time clean-up of old videos. "Check" only counts them. "Delete old videos"
| removes videos made before the cut-off date (the old AI video tool) from storage,
| together with their entries in the video lists. Newer videos are not touched.
*/

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

type Scan = { old: number; oldBytes: number; kept: number; keptBytes: number; unknown: number; complete: boolean };

export default function VideoCleaner() {
  const [date, setDate] = useState(DEFAULT_CUTOFF.slice(0, 10));
  const [busy, setBusy] = useState<"" | "scan" | "delete">("");
  const [scan, setScan] = useState<Scan | null>(null);
  const [done, setDone] = useState<{ deleted: number; freed: number; rows: number } | null>(null);
  const [message, setMessage] = useState("");
  const stop = useRef(false);

  // the day's start, so "before 11 Nov" means before that day begins; the default keeps its exact time
  const cutoff = date === DEFAULT_CUTOFF.slice(0, 10) ? DEFAULT_CUTOFF : `${date}T00:00:00.000Z`;

  async function call(body: object) {
    const res = await fetch("/api/videos/cleanup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, cutoff }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  async function check() {
    setBusy("scan"); setMessage(""); setDone(null);
    try {
      setScan(await call({ mode: "scan" }));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Check failed.");
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!scan || scan.old === 0) return;
    if (!window.confirm(
      `Delete ${scan.old} old video(s) (${mb(scan.oldBytes)})?\n\n` +
      `Videos made before ${date} are PERMANENTLY removed from storage and from the video lists. ` +
      `This cannot be undone. Newer videos, photos and brochures are not touched.\n\nContinue?`
    )) return;
    setBusy("delete"); setMessage("");
    stop.current = false;
    const total = { deleted: 0, freed: 0, rows: 0 };
    setDone({ ...total });
    try {
      for (;;) {
        const d = await call({ mode: "delete" });
        total.deleted += d.deleted ?? 0; total.freed += d.freedBytes ?? 0; total.rows += d.rows ?? 0;
        setDone({ ...total });
        if (!d.deleted || d.remaining === 0) { setMessage("Finished."); break; }
        if (stop.current) { setMessage("Stopped. You can run it again to continue."); break; }
      }
      setScan(null);
    } catch (e) {
      setMessage(e instanceof Error ? `${e.message} You can run it again to continue.` : "Stopped by an error. You can run it again.");
    } finally {
      setBusy("");
    }
  }

  const btn = "min-h-12 rounded-lg px-4 text-sm font-bold disabled:opacity-50";

  return (
    <section className="mt-8 max-w-2xl rounded-xl border bg-white p-5 shadow-sm" data-testid="video-cleaner">
      <h2 className="text-xl font-bold text-slate-900">Old videos</h2>
      <p className="mt-1 text-sm text-slate-600">
        Videos made by the old AI video tool take up storage and data allowance. This removes every video made before the date below. Videos
        made with the new video maker after that date are kept. Check first, then delete.
      </p>

      <label className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-800">
        Delete videos made before
        <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setScan(null); }}
          className="min-h-11 rounded-lg border border-slate-300 px-3" data-testid="cutoff" />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={check} disabled={busy !== "" || !date} className={`${btn} border border-slate-300 bg-white`} data-testid="check-videos">
          {busy === "scan" ? "Checking…" : "1. Check old videos"}
        </button>
        <button type="button" onClick={remove} disabled={busy !== "" || !scan || scan.old === 0} className={`${btn} bg-red-700 text-white`} data-testid="delete-videos">
          {busy === "delete" ? "Deleting…" : "2. Delete old videos"}
        </button>
        {busy === "delete" && (
          <button type="button" onClick={() => { stop.current = true; }} className={`${btn} border border-slate-300`}>Stop</button>
        )}
      </div>

      {scan && (
        <p className="mt-4 text-sm text-slate-800" data-testid="video-scan-result">
          {scan.old} old video(s) use {mb(scan.oldBytes)} and would be deleted. {scan.kept} newer video(s) ({mb(scan.keptBytes)}) stay.
          {scan.unknown > 0 ? ` ${scan.unknown} video(s) have no date and are never deleted.` : ""}
          {!scan.complete ? " The list was too long to read in one go, so this is partial. Delete, then check again." : ""}
        </p>
      )}
      {done && (
        <p className="mt-3 text-sm text-slate-800" data-testid="video-delete-result">
          {done.deleted} video(s) deleted, {mb(done.freed)} freed, {done.rows} list entr{done.rows === 1 ? "y" : "ies"} removed.
        </p>
      )}
      {message && <p className="mt-2 text-sm font-semibold text-slate-700" role="status">{message}</p>}
    </section>
  );
}
