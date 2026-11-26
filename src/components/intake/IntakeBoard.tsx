"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  INTAKE_WORKER_READY, STATUS_LABEL, isNoteGood, canRemove, canSend, cleanAgentName, cleanIntakeUrl, shortUrl,
  type IntakeRow, type IntakeStatus,
} from "@/lib/listingIntake";

const COLUMNS = "id, source_url, cobroke_agent, status, error, property_id, job_id, created_at, sent_at, finished_at";
const REFRESH_MS = 10_000;

const BADGE: Record<IntakeStatus, string> = {
  saved: "bg-slate-200 text-slate-800",
  queued: "bg-amber-100 text-amber-900",
  running: "bg-sky-100 text-sky-900",
  done: "bg-emerald-100 text-emerald-900",
  failed: "bg-red-100 text-red-900",
};

const TIME = new Intl.DateTimeFormat("en-MY", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" });

export default function IntakeBoard() {
  const [rows, setRows] = useState<IntakeRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [link, setLink] = useState("");
  const [agent, setAgent] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  // Test mode: Becky only says "received". Nothing is opened or created. Turn it off for the real thing.
  const [dryRun, setDryRun] = useState(true);

  const load = useCallback(async () => {
    const { data, error: e } = await supabase.from("listing_intake").select(COLUMNS).order("created_at", { ascending: false }).limit(200);
    if (e) {
      setTableMissing(/does not exist|relation|schema cache/i.test(e.message));
      setLoaded(true);
      return;
    }
    setTableMissing(false);
    setRows((data as IntakeRow[]) ?? []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = window.setInterval(load, REFRESH_MS);
    return () => window.clearInterval(t);
  }, [load]);

  async function add(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setNote("");
    const url = cleanIntakeUrl(link);
    if (!url.ok) return setError(url.error);
    const name = cleanAgentName(agent);
    if (!name) return setError("Type the co-broke agent's name.");
    if (rows.some((r) => r.source_url === url.url)) return setError("That link is already in the table.");
    setBusy(true);
    const { error: e } = await supabase.from("listing_intake").insert({ source_url: url.url, cobroke_agent: name });
    setBusy(false);
    if (e) {
      if (e.code === "23505") return setError("That link is already in the table.");
      if (/does not exist|schema cache/i.test(e.message)) return setError("The table is not set up yet. Run supabase/audit/10_listing_intake.sql in Supabase first.");
      return setError("Could not save the link. Please try again.");
    }
    setLink(""); // the agent name stays, so the next link from the same agent is quick
    setNote("Added.");
    await load();
  }

  async function remove(row: IntakeRow) {
    if (!window.confirm("Remove this link from the table?")) return;
    const { error: e } = await supabase.from("listing_intake").delete().eq("id", row.id);
    if (e) return setError("Could not remove it.");
    await load();
  }

  async function send(ids?: number[]) {
    setError("");
    setNote("");
    setBusy(true);
    try {
      const res = await fetch("/api/intake/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, dryRun }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send to the worker.");
      setNote(`${data.dryRun ? "Test: sent" : "Sent"} ${data.sent} link${data.sent === 1 ? "" : "s"} to Becky. She does them one at a time.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send to the worker.");
    } finally {
      setBusy(false);
    }
  }

  const sendable = rows.filter((r) => canSend(r.status));
  const input = "min-h-12 w-full rounded-lg border border-stone-300 px-3 text-base";

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={add} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-bold">Add a link</h2>
        <div>
          <label htmlFor="intake-link" className="mb-1 block text-sm font-semibold text-stone-700">Facebook post link</label>
          <input id="intake-link" type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.facebook.com/groups/…/posts/…" className={input} autoComplete="off" />
        </div>
        <div>
          <label htmlFor="intake-agent" className="mb-1 block text-sm font-semibold text-stone-700">Co-broke agent name</label>
          <input id="intake-agent" type="text" value={agent} onChange={(e) => setAgent(e.target.value)} maxLength={80} placeholder="Name of the agent who posted it" className={input} autoComplete="off" />
        </div>
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-lg bg-stone-900 px-5 text-base font-bold text-white disabled:opacity-50 sm:w-auto">Add</button>
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        {note && !error && <p role="status" className="text-sm font-semibold text-emerald-700">{note}</p>}
      </form>

      {tableMissing && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          The table is not set up yet. Run <b>supabase/audit/10_listing_intake.sql</b> in the Supabase SQL editor, then reload this page.
        </p>
      )}

      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Saved links ({rows.length})</h2>
          <button
            type="button"
            onClick={() => send()}
            disabled={busy || !INTAKE_WORKER_READY || sendable.length === 0}
            className="min-h-12 rounded-lg border border-stone-900 bg-white px-4 text-sm font-bold text-stone-900 disabled:opacity-40"
          >
            {dryRun ? "Test" : "Send"} {sendable.length} {dryRun ? "with Becky" : "to Becky"}
          </button>
        </div>
        <label className="mt-3 flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="mt-0.5 h-5 w-5" />
          <span>
            <b>Test only</b>: Becky just says she received the link. She does not open Facebook or make a listing. Untick it to make real draft listings.
          </span>
        </label>
        <p className="mt-1 text-xs text-stone-500">The worker takes one link at a time. You can follow the jobs on the <Link href="/queue" className="underline">Worker queue</Link> page.</p>

        {!loaded ? (
          <p className="mt-4 text-sm text-stone-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">No links yet. Add the first one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-200">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  <span className="text-sm font-bold text-stone-900">{r.cobroke_agent}</span>
                  <span className="text-xs text-stone-500">{TIME.format(new Date(r.created_at))}</span>
                </div>
                <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-sky-800 underline">{shortUrl(r.source_url, 70)}</a>
                {r.error && <p className={`text-sm ${isNoteGood(r.status, r.error) ? "text-emerald-800" : "text-red-700"}`}>{r.error}</p>}
                {r.status === "done" && r.property_id && (
                  <Link href={`/listings/${r.property_id}`} className="text-sm font-bold text-emerald-800 underline">Open the draft listing (private, Inactive)</Link>
                )}
                <div className="flex flex-wrap gap-2">
                  {canSend(r.status) && (
                    <button type="button" onClick={() => send([r.id])} disabled={busy || !INTAKE_WORKER_READY} className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm font-semibold disabled:opacity-40">
                      {r.status === "failed" ? "Try again" : "Send"}
                    </button>
                  )}
                  {canRemove(r.status) && (
                    <button type="button" onClick={() => remove(r)} disabled={busy} className="min-h-11 rounded-lg border border-stone-300 px-3 text-sm font-semibold text-red-800 disabled:opacity-40">Remove</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
