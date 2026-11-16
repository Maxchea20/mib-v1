import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { requireUser } from "@/lib/apiAuth";
import {
  DEFAULT_CUTOFF, VIDEO_BUCKET, parseCutoff, splitByCutoff, totalBytes, urlPartFor, type StoredFile,
} from "@/lib/videoCleanup";

/*
|--------------------------------------------------------------------------
| OLD VIDEO CLEAN-UP
|--------------------------------------------------------------------------
|
|   mode "scan"    only lists: counts the old videos and their size. Nothing is deleted.
|   mode "delete"  removes old videos (a batch per call) and their database rows.
|
| Only the "ai-videos" bucket is touched, and only videos created BEFORE the
| cut-off. Photos, brochures and every newer video stay exactly as they are.
|
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH = 30;
const DEADLINE_MS = 45_000;

const admin = () =>
  createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

type Db = ReturnType<typeof admin>;

/** Every file in the bucket, walking through the folders. */
async function listAll(db: Db, started: number): Promise<{ files: StoredFile[]; complete: boolean }> {
  const files: StoredFile[] = [];
  const queue: string[] = [""];
  while (queue.length > 0) {
    if (Date.now() - started > DEADLINE_MS) return { files, complete: false };
    const prefix = queue.shift()!;
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.storage.from(VIDEO_BUCKET).list(prefix, { limit: 1000, offset });
      if (error || !data) throw new Error("Could not list the videos.");
      for (const item of data) {
        const path = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          queue.push(path); // a folder
        } else {
          const meta = (item.metadata ?? {}) as { size?: number };
          files.push({ path, createdAt: item.created_at ?? null, size: Number(meta.size) || 0 });
        }
      }
      if (data.length < 1000) break;
    }
  }
  return { files, complete: true };
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  let body: { mode?: unknown; cutoff?: unknown };
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  const mode = body.mode === "delete" ? "delete" : "scan";
  const cutoff = parseCutoff(body.cutoff ?? DEFAULT_CUTOFF, Date.now());
  if (cutoff === null) return bad("Choose a cut-off date that is not in the future.");

  const started = Date.now();
  const db = admin();

  try {
    const { files, complete } = await listAll(db, started);
    const { old, kept, unknown } = splitByCutoff(files, cutoff);

    if (mode === "scan") {
      return NextResponse.json({
        ok: true,
        complete,
        old: old.length, oldBytes: totalBytes(old),
        kept: kept.length, keptBytes: totalBytes(kept),
        unknown: unknown.length,
        cutoff: new Date(cutoff).toISOString(),
      });
    }

    // delete one batch of old videos, then their database rows
    const batch = old.slice(0, BATCH);
    if (batch.length === 0) return NextResponse.json({ ok: true, deleted: 0, remaining: 0, rows: 0, complete });

    const { error: removeError } = await db.storage.from(VIDEO_BUCKET).remove(batch.map((f) => f.path));
    if (removeError) return bad("Could not delete some videos. Run it again.", 500);

    let rows = 0;
    for (const f of batch) {
      const { data } = await db.from("ai_video_projects").delete().ilike("final_video_url", `%${urlPartFor(f.path)}%`).select("id");
      rows += data?.length ?? 0;
    }

    return NextResponse.json({
      ok: true,
      deleted: batch.length,
      freedBytes: totalBytes(batch),
      remaining: old.length - batch.length,
      rows,
      complete,
    });
  } catch (e) {
    return bad(e instanceof Error ? e.message : "Clean-up failed.", 500);
  }
}
