import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import sharp from "sharp";
import { requireUser } from "@/lib/apiAuth";
import {
  BUCKET, CACHE_SECONDS, MAIN_MAX, MAIN_QUALITY, THUMB_MAX, THUMB_QUALITY,
  needsShrink, parsePhotoUrl,
} from "@/lib/photoSize";

/*
|--------------------------------------------------------------------------
| PHOTO OPTIMIZER (one-time clean-up of photos stored at full phone size)
|--------------------------------------------------------------------------
|
|   mode "scan"  only measures: no file is touched, nothing is downloaded
|                (it asks storage for each file's size).
|   mode "run"   for each photo: shrinks it to 1600 px if it is heavy, and makes
|                the small 480 px version used by cards and the photo strip.
|
| A photo that is already small is left exactly as it is. A shrunk copy is only
| kept if it is really smaller. Safe to run again: finished photos are skipped.
| It works through a few photos per call (the page loops until the end).
|
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 40 * 1024 * 1024;

const admin = () =>
  createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

type Row = { id: number; property_id: number; photo_type: string | null; image_url: string | null; file_name: string | null };

async function headSize(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const n = Number(res.headers.get("content-length"));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

async function exists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15_000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const mode = body.mode === "run" ? "run" : "scan";
  const after = Number.isSafeInteger(Number(body.after)) ? Math.max(0, Number(body.after)) : 0;
  const limit = mode === "run" ? Math.min(8, Math.max(1, Number(body.limit) || 4)) : Math.min(60, Math.max(1, Number(body.limit) || 40));

  const db = admin();
  const { data, error } = await db
    .from("property_photos")
    .select("id, property_id, photo_type, image_url, file_name")
    .gt("id", after)
    .order("id", { ascending: true })
    .limit(limit);
  if (error) return bad("Could not read the photo list.", 500);
  const rows = (data ?? []) as Row[];
  const nextAfter = rows.length > 0 ? rows[rows.length - 1].id : after;
  const done = rows.length < limit;

  /* ------------------------------------------------------------- scan */
  if (mode === "scan") {
    let photos = 0, bytes = 0, heavy = 0, heavyBytes = 0, noThumb = 0, unknown = 0;
    await Promise.all(
      rows.map(async (r) => {
        const p = parsePhotoUrl(r.image_url);
        if (!p) return;
        photos++;
        const [size, hasThumb] = await Promise.all([headSize(`${p.base}${p.path}`), exists(`${p.base}${p.thumbPath}`)]);
        if (!hasThumb) noThumb++;
        if (size === null) return void unknown++;
        bytes += size;
        if (size > 450_000) {
          heavy++;
          heavyBytes += size;
        }
      })
    );
    return NextResponse.json({ ok: true, mode, nextAfter, done, photos, bytes, heavy, heavyBytes, noThumb, unknown });
  }

  /* -------------------------------------------------------------- run */
  const results: { id: number; status: "shrunk" | "kept" | "skipped" | "error"; before: number; after: number; thumb: boolean; note?: string }[] = [];

  for (const r of rows) {
    const p = parsePhotoUrl(r.image_url);
    if (!p) {
      results.push({ id: r.id, status: "skipped", before: 0, after: 0, thumb: false, note: "not stored in MIB photo storage" });
      continue;
    }
    try {
      const res = await fetch(`${p.base}${p.path}`, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`photo not found (${res.status})`);
      const original = Buffer.from(await res.arrayBuffer());
      if (original.length > MAX_BYTES) throw new Error("photo is over 40 MB");

      const meta = await sharp(original, { failOn: "none" }).metadata();
      const w = meta.width ?? 0, h = meta.height ?? 0;
      let current = original;
      let path = p.path;
      let status: "shrunk" | "kept" = "kept";
      let newUrl: string | null = null;
      let newFileName: string | null = null;

      if (needsShrink(original.length, w, h, /^\.jpe?g$/i.test(p.ext))) {
        const shrunk = await sharp(original, { failOn: "none" })
          .rotate()
          .resize({ width: MAIN_MAX, height: MAIN_MAX, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: Math.round(MAIN_QUALITY * 100), mozjpeg: true, progressive: true })
          .toBuffer();

        if (shrunk.length < original.length) {
          const isJpeg = /^\.jpe?g$/i.test(p.ext);
          path = isJpeg ? p.path : `${r.property_id}/${p.name}.jpg`;
          const { error: upErr } = await db.storage.from(BUCKET).upload(path, shrunk, { upsert: true, contentType: "image/jpeg", cacheControl: CACHE_SECONDS });
          if (upErr) throw new Error(`upload failed: ${upErr.message}`);
          current = shrunk;
          status = "shrunk";
          newUrl = `${p.base}${path}?t=${Date.now()}`;
          if (!isJpeg) newFileName = `${p.name}.jpg`;
        }
      }

      // thumbnail (only if there is none yet)
      const thumbPath = `${r.property_id}/thumb/${p.name}.jpg`;
      let thumb = await exists(`${p.base}${thumbPath}`);
      if (!thumb) {
        const small = await sharp(current, { failOn: "none" })
          .rotate()
          .resize({ width: THUMB_MAX, height: THUMB_MAX, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: Math.round(THUMB_QUALITY * 100), mozjpeg: true })
          .toBuffer();
        const { error: thErr } = await db.storage.from(BUCKET).upload(thumbPath, small, { upsert: true, contentType: "image/jpeg", cacheControl: CACHE_SECONDS });
        thumb = !thErr;
      }

      if (newUrl) {
        const patch: Record<string, string> = { image_url: newUrl };
        if (newFileName) patch.file_name = newFileName;
        const { error: dbErr } = await db.from("property_photos").update(patch).eq("id", r.id);
        if (dbErr) throw new Error(`database update failed: ${dbErr.message}`);
        // the old file under a different name is no longer used
        if (path !== p.path) await db.storage.from(BUCKET).remove([p.path]);
      }
      results.push({ id: r.id, status, before: original.length, after: current.length, thumb });
    } catch (e) {
      results.push({ id: r.id, status: "error", before: 0, after: 0, thumb: false, note: e instanceof Error ? e.message : "failed" });
    }
  }

  const saved = results.reduce((a, x) => a + (x.status === "shrunk" ? x.before - x.after : 0), 0);
  return NextResponse.json({
    ok: true, mode, nextAfter, done,
    processed: results.length,
    shrunk: results.filter((x) => x.status === "shrunk").length,
    kept: results.filter((x) => x.status === "kept").length,
    skipped: results.filter((x) => x.status === "skipped").length,
    errors: results.filter((x) => x.status === "error").map((x) => ({ id: x.id, note: x.note })),
    thumbs: results.filter((x) => x.thumb).length,
    savedBytes: saved,
  });
}
