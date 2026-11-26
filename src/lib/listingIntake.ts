/*
|--------------------------------------------------------------------------
| LISTING INTAKE (pure helpers, unit-tested)
|--------------------------------------------------------------------------
|
| Facebook post links from co-broke agents are saved in a table first, then
| sent to the MIB Desktop worker one at a time. These helpers clean what is
| typed in and say what state a row is in. They never touch the database.
|
*/

export type IntakeStatus = "saved" | "queued" | "running" | "done" | "failed";

export type IntakeRow = {
  id: number;
  source_url: string;
  cobroke_agent: string;
  status: IntakeStatus;
  error: string | null;
  property_id: number | null;
  job_id: string | null;
  created_at: string;
  sent_at: string | null;
  finished_at: string | null;
};

/**
 * Flip to true only once the worker on the PC can handle "listing_intake" jobs.
 * Until then, sending would only make jobs that fail with "no handler registered".
 */
export const INTAKE_WORKER_READY = false;
export const INTAKE_JOB_TYPE = "listing_intake";

export const MAX_AGENT_NAME = 80;
export const MAX_URL = 500;

const FB_HOSTS = ["facebook.com", "fb.com", "fb.watch", "fb.me"];
const TRACKING = /^(fbclid|mibextid|__cft__.*|__tn__|utm_.*|ref|rdid|share_url|sfnsn|_rdr|paipv|eav|comment_id|reply_comment_id|notif_id|notif_t)$/i;

export type UrlResult = { ok: true; url: string } | { ok: false; error: string };

const isFacebookHost = (host: string) => FB_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

/** One Facebook link, tidied: https, no tracking junk, no #fragment, no trailing slash. */
export function cleanIntakeUrl(raw: unknown): UrlResult {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return { ok: false, error: "Paste a Facebook link first." };
  if (text.length > MAX_URL) return { ok: false, error: "That link is too long." };
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { ok: false, error: "That does not look like a link." };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, error: "That does not look like a link." };
  const host = u.hostname.toLowerCase();
  if (!isFacebookHost(host)) return { ok: false, error: "Only Facebook links are accepted here." };
  u.protocol = "https:";
  u.hostname = host;
  u.hash = "";
  u.username = "";
  u.password = "";
  for (const key of [...u.searchParams.keys()]) if (TRACKING.test(key)) u.searchParams.delete(key);
  let out = u.toString();
  if (out.endsWith("?")) out = out.slice(0, -1);
  out = out.replace(/\/+(\?|$)/, "$1");
  return { ok: true, url: out };
}

/** The co-broke agent's name: one line of plain text. Empty means "not given". */
export function cleanAgentName(raw: unknown): string {
  const t = typeof raw === "string" ? raw.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim() : "";
  return Array.from(t).slice(0, MAX_AGENT_NAME).join("").trim();
}

export const STATUS_LABEL: Record<IntakeStatus, string> = {
  saved: "Saved",
  queued: "Waiting for worker",
  running: "Worker is on it",
  done: "Draft made",
  failed: "Failed",
};

/** A row can be removed or (re)sent only when the worker is not holding it. */
export const canRemove = (s: IntakeStatus) => s === "saved" || s === "failed" || s === "done";
export const canSend = (s: IntakeStatus) => s === "saved" || s === "failed";

/** Short readable form of a link for the table. */
export function shortUrl(url: string, max = 52): string {
  const t = url.replace(/^https?:\/\/(www\.)?/i, "");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
