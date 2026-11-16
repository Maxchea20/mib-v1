/*
|--------------------------------------------------------------------------
| VIDEO CLEAN-UP (pure helpers, unit-tested)
|--------------------------------------------------------------------------
|
| Decides which stored videos are "old": created before the cut-off. The cut-off
| defaults to the day the new photo-based video maker replaced the old AI video
| tool (11 Nov 2026). A file whose date is unknown is NEVER treated as old.
|
*/

export const VIDEO_BUCKET = "ai-videos";
export const DEFAULT_CUTOFF = "2026-11-11T14:54:00.000Z";

export type StoredFile = { path: string; createdAt: string | null; size: number };

/** A cut-off as a timestamp, or null if it is not a real date or is in the future. */
export function parseCutoff(value: unknown, now: number): number | null {
  if (typeof value !== "string") return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t) || t > now) return null;
  return t;
}

export const isVideoPath = (path: string) => /\.(mp4|mov|webm|m4v)$/i.test(path);

export type Split = { old: StoredFile[]; kept: StoredFile[]; unknown: StoredFile[] };

export function splitByCutoff(files: StoredFile[], cutoff: number): Split {
  const out: Split = { old: [], kept: [], unknown: [] };
  for (const f of files) {
    if (!isVideoPath(f.path)) continue;
    const t = f.createdAt ? Date.parse(f.createdAt) : NaN;
    if (!Number.isFinite(t)) out.unknown.push(f);
    else if (t < cutoff) out.old.push(f);
    else out.kept.push(f);
  }
  return out;
}

export const totalBytes = (files: StoredFile[]) => files.reduce((n, f) => n + (f.size || 0), 0);

/** The address a stored video has in the database rows (the public URL contains this path). */
export const urlPartFor = (path: string) => `/${VIDEO_BUCKET}/${path}`;
