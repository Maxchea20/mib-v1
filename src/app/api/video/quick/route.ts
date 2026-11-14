import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { requireUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";
import { cleanLabel, MAX_PHOTOS, type Length, type VideoLang } from "@/lib/quickVideo/plan";
import { renderQuickVideo, RenderTimeoutError } from "@/lib/quickVideo/render";

/*
|--------------------------------------------------------------------------
| QUICK VIDEO
|--------------------------------------------------------------------------
|
| Makes a vertical video from a listing's own photos (no AI-generated
| footage): slow pans, the listing's title / price / place, room labels and
| a Max Property closing card. The finished video is stored like every other
| MIB video (bucket ai-videos, table ai_video_projects), so it shows up in
| the Video tab and the Share tab.
|
| Photos are looked up by id for THIS listing, never taken as web addresses
| from the browser.
|
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The hosting plan allows 60 seconds. The renderer stops FFmpeg at about 50 so a slow server
// gives a clear message instead of a failed request.
export const maxDuration = 60;
const TOTAL_BUDGET_MS = 51_000;

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

const admin = () =>
  createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

async function download(url: string): Promise<Buffer> {
  const allowed = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  const u = new URL(url);
  if (u.host !== allowed) throw new Error("A photo is not stored in MIB storage.");
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Could not load a photo (${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_PHOTO_BYTES) throw new Error("A photo is too large (over 20 MB).");
  return buf;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  const propertyId = Number(body.propertyId);
  const photoIds = Array.isArray(body.photoIds) ? body.photoIds.map(Number) : [];
  const lang: VideoLang = body.lang === "ms" ? "ms" : body.lang === "zh" ? "zh" : "en";
  const length: Length = body.length === "short" ? "short" : "auto";
  const showPrice = body.showPrice !== false;
  const showFacts = body.showFacts !== false;
  const labelsIn = Array.isArray(body.labels) ? body.labels : [];

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) return bad("Missing listing.");
  if (photoIds.length < 1 || photoIds.length > MAX_PHOTOS || photoIds.some((n) => !Number.isSafeInteger(n) || n <= 0))
    return bad(`Choose between 1 and ${MAX_PHOTOS} photos.`);
  if (new Set(photoIds).size !== photoIds.length) return bad("A photo was chosen twice.");

  // The listing and its photos, read as the logged-in user (RLS applies)
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("properties")
    .select("id,title,headline,category,purpose,price,status,area,city,state,property_type,property_sub_type,land_type,bedrooms,bathrooms,built_up,land_size,tenure")
    .eq("id", propertyId)
    .single();
  if (!listing) return bad("Listing not found.", 404);

  const { data: rows } = await supabase
    .from("property_photos")
    .select("id,image_url")
    .eq("property_id", propertyId)
    .in("id", photoIds);
  const byId = new Map((rows ?? []).map((r) => [Number(r.id), r.image_url as string | null]));
  const urls = photoIds.map((id) => byId.get(id));
  if (urls.some((u) => !u)) return bad("One of the chosen photos was not found for this listing.");

  const db = admin();
  const { data: project, error: insertError } = await db
    .from("ai_video_projects")
    .insert({ property_id: propertyId, status: "generating", clip_count: photoIds.length, final_video_url: null, completed_at: null, error_message: null })
    .select("id")
    .single();
  if (insertError || !project) return bad("Could not start the video.", 500);

  const fail = async (message: string) => {
    await db.from("ai_video_projects").update({ status: "failed", error_message: message.slice(0, 500) }).eq("id", project.id);
  };

  try {
    const photos = await Promise.all((urls as string[]).map(download));
    const downloaded = Date.now() - startedAt;
    const rendered = await renderQuickVideo({
      listing,
      photos,
      labels: photoIds.map((_, i) => cleanLabel(labelsIn[i])),
      lang,
      length,
      showPrice,
      showFacts,
      ffmpegBudgetMs: TOTAL_BUDGET_MS - downloaded,
    });
    const video = rendered.video;

    const storagePath = `property-${propertyId}/projects/${project.id}/final-video.mp4`;
    const { error: uploadError } = await db.storage.from("ai-videos").upload(storagePath, video, { contentType: "video/mp4", upsert: true });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const completedAt = new Date().toISOString();
    const { data: pub } = db.storage.from("ai-videos").getPublicUrl(storagePath);
    const url = `${pub.publicUrl}?v=${encodeURIComponent(completedAt)}`;
    await db.from("ai_video_projects").update({ status: "completed", final_video_url: url, completed_at: completedAt, error_message: null }).eq("id", project.id);

    const timing = { downloadMs: downloaded, ...rendered.ms, totalMs: Date.now() - startedAt };
    console.log("Quick video:", photoIds.length, "photos,", rendered.scenes, "scenes,", rendered.seconds, "s,", Math.round(video.length / 1024), "KB,", JSON.stringify(timing));
    return NextResponse.json({ ok: true, projectId: project.id, url, bytes: video.length, seconds: rendered.seconds, timing });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Video failed.";
    console.error("Quick video error:", message);
    await fail(message);
    return bad(message, e instanceof RenderTimeoutError ? 504 : 500);
  }
}

/** Delete one finished video (its file and its record). */
export async function DELETE(request: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
  if (!/^[0-9a-f-]{8,64}$/i.test(projectId)) return bad("Missing video.");

  // Only a video this user can see (RLS) may be removed
  const supabase = await createClient();
  const { data: project } = await supabase.from("ai_video_projects").select("id,property_id").eq("id", projectId).single();
  if (!project) return bad("Video not found.", 404);

  const db = admin();
  await db.storage.from("ai-videos").remove([`property-${project.property_id}/projects/${project.id}/final-video.mp4`]);
  const { error } = await db.from("ai_video_projects").delete().eq("id", project.id);
  if (error) return bad("Could not delete the video.", 500);
  return NextResponse.json({ ok: true });
}
