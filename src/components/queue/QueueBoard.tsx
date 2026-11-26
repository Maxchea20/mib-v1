"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FAILED_STATUSES, WAITING_STATUSES, agoText, canRemoveJob, countJobs, describeJob, listingIdOf, panelText, removeLabel, sortJobs, workerPanels,
  type JobRow, type StatusKind, type WorkerRow,
} from "@/lib/workerQueue";

/*
| The worker queue. Shows whether Woody and Becky are online (from their 30-second
| heartbeat) and the latest 100 jobs. A job that is waiting can be cancelled and a finished
| or failed one deleted; a job the worker is running right now cannot. It never starts or
| retries a job. It refreshes every 10 seconds.
*/

export type ListingTitle = { id: number; title: string | null };
export type GroupRow = { group_url: string | null; name: string | null };

const JOB_COLUMNS = "id, worker_id, job_type, status, payload, created_at, scheduled_at, completed_at, error";
const REFRESH_MS = 10_000;

const FILTERS: { id: "all" | StatusKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "waiting", label: "Waiting" },
  { id: "running", label: "Running" },
  { id: "done", label: "Done" },
  { id: "failed", label: "Failed" },
];

const BADGE: Record<StatusKind, { text: string; cls: string }> = {
  waiting: { text: "Waiting", cls: "bg-amber-100 text-amber-900" },
  running: { text: "Running", cls: "bg-sky-100 text-sky-900" },
  done: { text: "Done", cls: "bg-emerald-100 text-emerald-900" },
  failed: { text: "Failed", cls: "bg-red-100 text-red-900" },
  other: { text: "Other", cls: "bg-slate-200 text-slate-800" },
};

const TIME = new Intl.DateTimeFormat("en-MY", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" });
const when = (v: string | null | undefined) => {
  const t = v ? Date.parse(v) : NaN;
  return Number.isFinite(t) ? TIME.format(t) : "";
};

export default function QueueBoard({
  initialWorkers, initialJobs, initialTitles, groups, serverNow, loadError,
}: {
  initialWorkers: WorkerRow[];
  initialJobs: JobRow[];
  initialTitles: ListingTitle[];
  groups: GroupRow[];
  serverNow: number;
  loadError: boolean;
}) {
  const [workers, setWorkers] = useState(initialWorkers);
  const [jobs, setJobs] = useState(initialJobs);
  const [titles, setTitles] = useState<Record<number, string>>(() => Object.fromEntries(initialTitles.map((t) => [t.id, t.title ?? ""])));
  const [now, setNow] = useState(serverNow);
  const [filter, setFilter] = useState<"all" | StatusKind>("all");
  const [problem, setProblem] = useState(loadError);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const groupName = useMemo(() => new Map(groups.map((g) => [g.group_url ?? "", g.name ?? ""])), [groups]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const [w, j] = await Promise.all([
      supabase.from("desktop_workers").select("id, worker_name, status, last_seen").order("last_seen", { ascending: false }).limit(5),
      supabase.from("desktop_jobs").select(JOB_COLUMNS).order("created_at", { ascending: false }).limit(100),
    ]);
    if (w.error || j.error) {
      setProblem(true);
    } else {
      setProblem(false);
      setWorkers((w.data ?? []) as WorkerRow[]);
      const rows = (j.data ?? []) as JobRow[];
      setJobs(rows);
      const missing = [...new Set(rows.map((r) => listingIdOf(r.payload)).filter((n): n is number => n !== null))].filter((id) => titles[id] === undefined);
      if (missing.length > 0) {
        const { data } = await supabase.from("properties").select("id, title").in("id", missing);
        if (data) setTitles((cur) => ({ ...cur, ...Object.fromEntries((data as ListingTitle[]).map((t) => [t.id, t.title ?? ""])) }));
      }
    }
    setNow(Date.now());
    setRefreshing(false);
  }, [titles]);

  useEffect(() => {
    const t = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(t);
  }, [refresh]);

  const panels = workerPanels(workers, jobs, now);
  const counts = countJobs(jobs);
  const shown = sortJobs(jobs).filter((j) => filter === "all" || describeJob(j, now).kind === filter);

  /** Takes a job out of the queue. A listing intake job also puts its link back to "Saved" so it can be sent again. */
  async function removeJob(j: JobRow, kind: StatusKind) {
    const ask = kind === "waiting" ? "Cancel this job? It will not run." : "Delete this job from the list?";
    if (!window.confirm(ask)) return;
    setActionError("");
    setBusyId(String(j.id));
    let q = supabase.from("desktop_jobs").delete().eq("id", j.id);
    // a waiting job is only removed while it is still waiting, so one the worker has just taken is left alone
    if (kind === "waiting") q = q.in("status", WAITING_STATUSES);
    const { error } = await q;
    if (error) {
      setActionError("Could not remove the job. Please try again.");
    } else if (j.job_type === "listing_intake") {
      await supabase.from("listing_intake").update({ status: "saved", job_id: null, sent_at: null }).eq("job_id", String(j.id)).eq("status", "queued");
    }
    setBusyId(null);
    await refresh();
  }

  async function clearFailed() {
    const n = counts.failed;
    if (n === 0 || !window.confirm(`Delete all ${n} failed job${n === 1 ? "" : "s"} from the list?`)) return;
    setActionError("");
    setBusyId("failed");
    const { error } = await supabase.from("desktop_jobs").delete().in("status", FAILED_STATUSES);
    if (error) setActionError("Could not delete the failed jobs. Please try again.");
    setBusyId(null);
    await refresh();
  }

  return (
    <div data-testid="queue-board">
      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Workers</h2>
        <button type="button" onClick={() => void refresh()} disabled={refreshing} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 disabled:opacity-50" data-testid="refresh">
          {refreshing ? "Refreshing…" : "Refresh now"}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="worker-list">
        {panels.map((p) => {
          const tone = p.online ? "border-emerald-300 bg-emerald-50 text-emerald-900" : p.known ? "border-red-300 bg-red-50 text-red-900" : "border-amber-300 bg-amber-50 text-amber-900";
          return (
            <section key={p.name} className={`rounded-xl border p-4 ${tone}`} data-testid="worker-summary">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className={`h-3 w-3 rounded-full ${p.online ? "bg-emerald-600" : "bg-red-600"}`} />
                <p className="text-lg font-bold">{p.name}: {p.online ? "Online" : "Offline"}</p>
              </div>
              <p className="mt-1 text-xs">{p.role}</p>
              <p className="mt-2 text-sm">{panelText(p, now)}</p>
              {p.online && <p className="mt-1 text-xs">Last heartbeat {agoText(p.lastSeenMs, now)}.</p>}
            </section>
          );
        })}
      </div>

      {problem && (
        <p role="alert" className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Could not read the queue just now. The list below may be out of date. It will try again in a few seconds.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="counts">
        {([["waiting", "Waiting"], ["running", "Running"], ["done", "Done"], ["failed", "Failed"]] as const).map(([k, name]) => (
          <button key={k} type="button" onClick={() => setFilter(filter === k ? "all" : k)} aria-pressed={filter === k}
            className={`rounded-xl border bg-white p-3 text-left ${filter === k ? "border-slate-900" : "border-slate-200"}`}>
            <div className="text-2xl font-bold text-slate-900">{counts[k]}</div>
            <div className="text-xs text-slate-600">{name} (latest 100)</div>
          </button>
        ))}
      </div>

      {actionError && <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{actionError}</p>}

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter jobs">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
            className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${filter === f.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-900"}`}>
            {f.label}
          </button>
        ))}
      </div>
      {counts.failed > 0 && (
        <button type="button" onClick={() => void clearFailed()} disabled={busyId !== null} className="mt-3 min-h-11 rounded-lg border border-red-300 bg-white px-4 text-sm font-bold text-red-800 disabled:opacity-50" data-testid="clear-failed">
          Delete all {counts.failed} failed
        </button>
      )}

      <div className="mt-4 flex flex-col gap-3" data-testid="jobs">
        {shown.length === 0 && (
          <p className="rounded-xl border bg-white p-5 text-sm text-slate-700">
            {jobs.length === 0 ? "No jobs yet. A job appears here when you start a post from Marketing." : "No jobs match this filter."}
          </p>
        )}
        {shown.map((j) => {
          const v = describeJob(j, now);
          const badge = BADGE[v.kind];
          const payload = (j.payload ?? {}) as Record<string, unknown>;
          const url = typeof payload.group_url === "string" ? payload.group_url : "";
          const group = url ? groupName.get(url) : "";
          const title = v.listingId !== null ? titles[v.listingId] : "";
          return (
            <article key={String(j.id)} className="rounded-xl border bg-white p-4" data-testid="job">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900">{v.label}</h2>
                  {v.listingId !== null && (
                    <p className="text-sm text-slate-700">
                      <Link href={`/listings/${v.listingId}`} className="underline">{title || `Listing ${v.listingId}`}</Link>
                    </p>
                  )}
                  {group ? <p className="text-sm text-slate-700">Group: {group}</p> : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}>{badge.text}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {v.timing}
                {j.created_at ? ` · started from MIB ${when(j.created_at)}` : ""}
                {v.kind === "waiting" && j.scheduled_at && Date.parse(j.scheduled_at) > now ? ` · will run ${when(j.scheduled_at)}` : ""}
              </p>
              {v.stuck && (
                <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
                  This job has been running for a long time. The worker may have been closed in the middle of it. Check the MIB Desktop window on your PC.
                </p>
              )}
              {v.error && (
                <details className="mt-2" open={v.kind === "failed"}>
                  <summary className="cursor-pointer text-sm font-semibold text-red-800">What went wrong</summary>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-red-800">{v.error}</p>
                </details>
              )}
              {canRemoveJob(v.kind, v.stuck) && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => void removeJob(j, v.kind)}
                    disabled={busyId !== null}
                    className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-red-800 disabled:opacity-50"
                    data-testid="remove-job"
                  >
                    {busyId === String(j.id) ? "Working…" : v.stuck ? "Remove stuck job" : removeLabel(v.kind)}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
