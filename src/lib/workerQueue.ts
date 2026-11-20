/*
|--------------------------------------------------------------------------
| WORKER QUEUE (pure helpers, unit-tested)
|--------------------------------------------------------------------------
|
| The MIB Desktop worker takes jobs (post to iProperty, Facebook groups, Google
| Business) from the desktop_jobs table, one at a time, and tells the database it
| is alive every 30 seconds. These helpers turn those rows into plain words for
| the Worker queue page. They never change anything.
|
*/

export type JobRow = {
  id: string | number;
  worker_id?: string | number | null;
  job_type: string | null;
  status: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
};

export type WorkerRow = { id: string | number; worker_name: string | null; status: string | null; last_seen: string | null };

export const HEARTBEAT_MS = 30_000;
/** Three missed heartbeats: the worker is treated as offline. */
export const OFFLINE_AFTER_MS = 3 * HEARTBEAT_MS;
/** A job "running" for longer than this probably got stuck (the worker was closed mid-job). */
export const STUCK_AFTER_MS = 20 * 60_000;

export const JOB_LABELS: Record<string, string> = {
  iproperty_create_listing: "iProperty post",
  facebook_group_post: "Facebook group post",
  google_business_post: "Google Business post",
  generate_property_video: "Property video",
  test_job: "Test job",
  background_test: "Background test",
};

export const jobLabel = (type: string | null | undefined): string => {
  const t = (type ?? "").trim();
  return JOB_LABELS[t] ?? (t ? t.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "Job");
};

export type StatusKind = "waiting" | "running" | "done" | "failed" | "other";

export function statusKind(status: string | null | undefined): StatusKind {
  const s = (status ?? "").toLowerCase();
  if (["queued", "pending", "scheduled", "waiting", "new"].includes(s)) return "waiting";
  if (["running", "processing", "claimed", "in_progress", "in progress", "started", "active"].includes(s)) return "running";
  if (["completed", "complete", "done", "success", "succeeded", "finished"].includes(s)) return "done";
  if (["failed", "error", "errored"].includes(s)) return "failed";
  return "other";
}

const ms = (v: string | null | undefined): number | null => {
  const t = v ? Date.parse(v) : NaN;
  return Number.isFinite(t) ? t : null;
};

export type WorkerState = { online: boolean; lastSeenMs: number | null; ageMs: number | null };

/** Online only when the last heartbeat is recent. The stored status text is not trusted: a closed app cannot mark itself offline. */
export function workerState(w: Pick<WorkerRow, "last_seen"> | null | undefined, now: number): WorkerState {
  const seen = ms(w?.last_seen);
  if (seen === null) return { online: false, lastSeenMs: null, ageMs: null };
  const age = Math.max(0, now - seen);
  return { online: age <= OFFLINE_AFTER_MS, lastSeenMs: seen, ageMs: age };
}

/** "12 seconds", "5 minutes", "2 hours", "3 days". */
export function spanText(totalMs: number): string {
  const s = Math.max(0, Math.round(totalMs / 1000));
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"}`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} hour${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"}`;
}

export const agoText = (t: number | null, now: number): string => (t === null ? "never" : `${spanText(now - t)} ago`);

export type JobView = {
  kind: StatusKind;
  label: string;
  /** One short line about timing, such as "took 2 minutes" or "waiting 5 minutes". */
  timing: string;
  stuck: boolean;
  listingId: number | null;
  error: string | null;
};

/** The listing a job is about (payload.listing_id or property_id), or null. */
export function listingIdOf(payload: JobRow["payload"]): number | null {
  const p = payload ?? {};
  for (const k of ["listing_id", "property_id", "propertyId", "listingId"]) {
    const n = Number((p as Record<string, unknown>)[k]);
    if (Number.isSafeInteger(n) && n > 0) return n;
  }
  return null;
}

export function describeJob(j: JobRow, now: number): JobView {
  const kind = statusKind(j.status);
  const created = ms(j.created_at);
  const done = ms(j.completed_at);
  const scheduled = ms(j.scheduled_at);
  let timing = "";
  let stuck = false;

  if (kind === "done" || kind === "failed") {
    timing = created !== null && done !== null ? `${kind === "failed" ? "failed after" : "took"} ${spanText(done - created)}` : kind === "failed" ? "failed" : "finished";
  } else if (kind === "running") {
    const since = created !== null ? now - created : 0;
    stuck = since > STUCK_AFTER_MS;
    timing = created !== null ? `running for ${spanText(since)}` : "running";
  } else if (kind === "waiting") {
    timing = scheduled !== null && scheduled > now ? `scheduled in ${spanText(scheduled - now)}` : created !== null ? `waiting ${spanText(now - (scheduled ?? created))}` : "waiting";
  } else {
    timing = String(j.status ?? "");
  }

  const err = (j.error ?? "").replace(/\s+/g, " ").trim();
  return { kind, label: jobLabel(j.job_type), timing, stuck, listingId: listingIdOf(j.payload), error: err ? err.slice(0, 600) : null };
}

export type Counts = { waiting: number; running: number; done: number; failed: number; other: number };

export function countJobs(jobs: JobRow[]): Counts {
  const c: Counts = { waiting: 0, running: 0, done: 0, failed: 0, other: 0 };
  for (const j of jobs) c[statusKind(j.status)] += 1;
  return c;
}

/** Newest first; jobs without a date go last. */
export function sortJobs<T extends Pick<JobRow, "created_at" | "id">>(jobs: T[]): T[] {
  return [...jobs].sort((a, b) => (ms(b.created_at) ?? -1) - (ms(a.created_at) ?? -1) || String(b.id).localeCompare(String(a.id)));
}

/** The one-line message at the top: is the worker able to take jobs? */
export function workerSummary(state: WorkerState, counts: Counts, now: number): { tone: "good" | "warn" | "bad"; text: string } {
  if (state.online) {
    if (counts.running > 0) return { tone: "good", text: "The worker is online and busy with a job." };
    if (counts.waiting > 0) return { tone: "good", text: "The worker is online. Waiting jobs start within a few seconds." };
    return { tone: "good", text: "The worker is online and idle. Nothing is waiting." };
  }
  const when = state.lastSeenMs === null ? "It has never reported in." : `It was last seen ${agoText(state.lastSeenMs, now)}.`;
  const jobs = counts.waiting > 0 ? ` ${counts.waiting} job${counts.waiting === 1 ? " is" : "s are"} waiting and will not run until it is back.` : "";
  return { tone: counts.waiting > 0 ? "bad" : "warn", text: `The worker is offline. ${when} Open the MIB Desktop app on your PC to start it.${jobs}` };
}
