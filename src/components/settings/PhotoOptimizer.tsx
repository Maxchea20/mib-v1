"use client";

import { useRef, useState } from "react";

/*
| One-time clean-up of photos stored at full phone size. "Check" only measures.
| "Shrink photos" replaces heavy photo files with a 1600 px version and adds the
| small 480 px version used on cards and the photo strip.
*/

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

type Scan = { photos: number; bytes: number; heavy: number; heavyBytes: number; noThumb: number; unknown: number };
type Run = { processed: number; shrunk: number; kept: number; skipped: number; thumbs: number; savedBytes: number; errors: { id: number; note?: string }[] };

export default function PhotoOptimizer() {
  const [busy, setBusy] = useState<"" | "scan" | "run">("");
  const [scan, setScan] = useState<Scan | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [message, setMessage] = useState("");
  const stop = useRef(false);

  async function call(body: object) {
    const res = await fetch("/api/photos/optimize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  async function check() {
    setBusy("scan"); setMessage(""); setRun(null);
    stop.current = false;
    const total: Scan = { photos: 0, bytes: 0, heavy: 0, heavyBytes: 0, noThumb: 0, unknown: 0 };
    try {
      let after = 0;
      for (;;) {
        const d = await call({ mode: "scan", after });
        (Object.keys(total) as (keyof Scan)[]).forEach((k) => (total[k] += d[k] ?? 0));
        setScan({ ...total });
        if (d.done || stop.current) break;
        after = d.nextAfter;
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Check failed.");
    } finally {
      setBusy("");
    }
  }

  async function shrink() {
    if (!window.confirm(
      "Shrink photos?\n\nHeavy photo files in MIB storage are REPLACED by a smaller version (1600 px). " +
      "The originals are not kept in MIB (your phone still has them). Photos that are already small are not touched.\n\nContinue?"
    )) return;
    setBusy("run"); setMessage("");
    stop.current = false;
    const total: Run = { processed: 0, shrunk: 0, kept: 0, skipped: 0, thumbs: 0, savedBytes: 0, errors: [] };
    setRun({ ...total });
    try {
      let after = 0;
      for (;;) {
        const d = await call({ mode: "run", after, limit: 4 });
        total.processed += d.processed; total.shrunk += d.shrunk; total.kept += d.kept; total.skipped += d.skipped;
        total.thumbs += d.thumbs; total.savedBytes += d.savedBytes; total.errors.push(...(d.errors ?? []));
        setRun({ ...total, errors: [...total.errors] });
        if (d.done) { setMessage("Finished."); break; }
        if (stop.current) { setMessage("Stopped. You can run it again to continue."); break; }
        after = d.nextAfter;
      }
    } catch (e) {
      setMessage(e instanceof Error ? `${e.message} You can run it again to continue.` : "Stopped by an error. You can run it again.");
    } finally {
      setBusy("");
    }
  }

  const btn = "min-h-12 rounded-lg px-4 text-sm font-bold disabled:opacity-50";

  return (
    <section className="mt-8 max-w-2xl rounded-xl border bg-white p-5 shadow-sm" data-testid="photo-optimizer">
      <h2 className="text-xl font-bold text-slate-900">Photo storage</h2>
      <p className="mt-1 text-sm text-slate-600">
        Photos uploaded before were stored at full phone size (3 to 8 MB). That uses up the Supabase data allowance when visitors open
        your listings. New photos are now shrunk automatically. Use this once to shrink the older ones.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={check} disabled={busy !== ""} className={`${btn} border border-slate-300 bg-white`} data-testid="check">
          {busy === "scan" ? "Checking…" : "1. Check how much can be saved"}
        </button>
        <button type="button" onClick={shrink} disabled={busy !== ""} className={`${btn} bg-slate-900 text-white`} data-testid="shrink">
          {busy === "run" ? "Shrinking…" : "2. Shrink photos"}
        </button>
        {busy !== "" && (
          <button type="button" onClick={() => { stop.current = true; }} className={`${btn} border border-red-300 text-red-700`}>Stop</button>
        )}
      </div>

      {scan && (
        <p className="mt-4 text-sm text-slate-800" data-testid="scan-result">
          {scan.photos} photos use {mb(scan.bytes)} now. {scan.heavy} are heavier than 450 KB ({mb(scan.heavyBytes)}), and {scan.noThumb} have no small version yet.
          Shrinking should save roughly {mb(Math.round(scan.heavyBytes * 0.85))}.
        </p>
      )}
      {run && (
        <p className="mt-3 text-sm text-slate-800" data-testid="run-result">
          {run.processed} photos checked, {run.shrunk} shrunk (saved {mb(run.savedBytes)}), {run.kept} already small, {run.thumbs} small versions ready
          {run.skipped ? `, ${run.skipped} skipped` : ""}.
        </p>
      )}
      {run && run.errors.length > 0 && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {run.errors.length} photo(s) could not be processed: {run.errors.slice(0, 3).map((e) => `#${e.id} ${e.note ?? ""}`).join("; ")}
        </p>
      )}
      {message && <p className="mt-2 text-sm font-semibold text-slate-700" role="status">{message}</p>}
    </section>
  );
}
