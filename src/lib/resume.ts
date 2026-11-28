/*
|--------------------------------------------------------------------------
| RESUME WHERE YOU LEFT OFF (pure, unit-tested)
|--------------------------------------------------------------------------
|
| On a phone, switching to another app can make the system close MIB's page to free memory.
| When you come back, the page starts again from the start page and you lose your place.
|
| The app now remembers the last page you were on. When it starts fresh on a start page
| ("/" or "/dashboard") it takes you back there, if that was recent. It only does this once
| per start, so you can still go to the dashboard on purpose.
|
| After a login (for example, if the login expired while you were away) you also go back to
| the page you wanted, not to the start page.
|
*/

export const LAST_PAGE_KEY = "mib-last-page";
export const STARTED_KEY = "mib-started";
/** How long a remembered page stays valid. */
export const RESUME_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const START_PAGES = ["/", "/dashboard"];

export type SavedPage = { path: string; at: number };

/** A same-site page address that is safe to go to: starts with a single "/", no login page, no API. */
export function safePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const p = raw.trim();
  if (p.length === 0 || p.length > 500) return null;
  if (!/^\/(?![/\\])/.test(p)) return null; // not "//evil.com", not "/\evil.com", not "http://..."
  if (/[\u0000-\u001f\u007f]/.test(p)) return null;
  const pathOnly = p.split(/[?#]/)[0];
  if (pathOnly === "/login" || pathOnly.startsWith("/login/")) return null;
  if (pathOnly.startsWith("/api/") || pathOnly.startsWith("/_next")) return null;
  return p;
}

/** Whether a page is worth remembering (everything except the start page itself and the login page). */
export const worthSaving = (path: string) => safePath(path) !== null && !START_PAGES.includes(path.split(/[?#]/)[0]);

/** Reads what was stored; anything odd is ignored. */
export function parseSaved(raw: string | null): SavedPage | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    const path = safePath(v?.path);
    const at = Number(v?.at);
    return path && Number.isFinite(at) ? { path, at } : null;
  } catch {
    return null;
  }
}

/**
 * Where to go on a fresh start, or null to stay.
 * Only from a start page, only once per start, only for a page saved recently.
 */
export function resumeTarget(args: { pathname: string; saved: SavedPage | null; now: number; alreadyStarted: boolean }): string | null {
  const { pathname, saved, now, alreadyStarted } = args;
  if (alreadyStarted) return null;
  if (!START_PAGES.includes(pathname)) return null;
  if (!saved) return null;
  const age = now - saved.at;
  if (age < 0 || age > RESUME_MAX_AGE_MS) return null;
  if (!worthSaving(saved.path)) return null;
  return saved.path;
}

/** The login address that remembers where the person was going. Only for pages that are worth coming back to. */
export function loginUrlFor(path: string, search: string): string {
  const full = `${path}${search}`;
  const safe = safePath(full);
  return safe && safe !== "/" ? `/login?next=${encodeURIComponent(safe)}` : "/login";
}
