import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { requireUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";
import { BUCKET, CACHE_SECONDS, parsePhotoUrl } from "@/lib/photoSize";
import { FEATHER, MAX_SOURCE_BYTES, V_HEIGHT, V_WIDTH, VERTICAL_PROMPT, verticalPlan } from "@/lib/verticalPhoto";

/*
|--------------------------------------------------------------------------
| VERTICAL PHOTOS FOR VIDEO
|--------------------------------------------------------------------------
|
|   mode "status"   which of these photos already have a vertical copy
|   mode "make"     makes the vertical copy of ONE photo (the page loops over photos)
|
| The copy is saved next to the photo as <listing>/vertical/<name>.jpg. The original is
| never changed, and the website keeps using the original. The video maker uses the
| vertical copy when there is one. OpenAI draws only the bands above and below the photo;
| the real photo is pasted back over the middle afterwards.
|
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const admin = () =>
  createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const bad = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

async function exists(url: string): Promise<boolean> {
  try {
    return (await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(10_000) })).ok;
  } catch {
    return false;
  }
}

/** The real photo, with its top and bottom edges fading out over FEATHER px, so it blends into the drawn bands. */
async function feathered(photo: Buffer, w: number, h: number): Promise<Buffer> {
  const f = Math.min(FEATHER, Math.floor(h / 4));
  const fade = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="#000"/><stop offset="${f / h}" stop-color="#fff"/><stop offset="${1 - f / h}" stop-color="#fff"/><stop offset="1" stop-color="#000"/>` +
      `</linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`
  );
  const alpha = await sharp(fade).resize(w, h).greyscale().raw().toBuffer();
  return sharp(photo).removeAlpha().joinChannel(alpha, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
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
  const propertyId = Number(body.propertyId);
  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) return bad("Missing listing.");
  const ids = (Array.isArray(body.photoIds) ? body.photoIds : [body.photoId]).map(Number);
  if (ids.length < 1 || ids.length > 30 || ids.some((n) => !Number.isSafeInteger(n) || n <= 0)) return bad("Choose a photo.");

  // Photos are looked up by id for THIS listing, as the logged-in user (RLS applies)
  const supabase = await createClient();
  const { data: rows } = await supabase.from("property_photos").select("id,image_url").eq("property_id", propertyId).in("id", ids);
  const photos = (rows ?? []).map((r) => ({ id: Number(r.id), parsed: parsePhotoUrl(r.image_url as string | null) })).filter((r) => r.parsed);

  if (body.mode === "status") {
    const have = await Promise.all(photos.map(async (r) => ((await exists(`${r.parsed!.base}${r.parsed!.verticalPath}`)) ? r.id : 0)));
    return NextResponse.json({ ok: true, have: have.filter(Boolean) });
  }

  if (ids.length !== 1) return bad("Make one photo at a time.");
  const photo = photos[0];
  if (!photo?.parsed) return bad("Photo not found for this listing.", 404);
  const p = photo.parsed;
  if (!process.env.OPENAI_API_KEY) return bad("OpenAI is not set up on the server.", 500);

  try {
    if (!body.force && (await exists(`${p.base}${p.verticalPath}`))) return NextResponse.json({ ok: true, status: "exists" });

    const res = await fetch(`${p.base}${p.path}`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`Could not load the photo (${res.status}).`);
    const original = Buffer.from(await res.arrayBuffer());
    if (original.length > MAX_SOURCE_BYTES) throw new Error("The photo is too large (over 25 MB).");

    const oriented = await sharp(original, { failOn: "none" }).rotate().toBuffer();
    const meta = await sharp(oriented).metadata();
    const plan = verticalPlan(meta.width ?? 0, meta.height ?? 0);
    if (plan.mode === "skip") return NextResponse.json({ ok: true, status: "skipped", reason: plan.reason });

    const placed = await sharp(oriented).resize(plan.photoW, plan.photoH, { fit: "fill" }).removeAlpha().toBuffer();
    const sheet = { create: { width: V_WIDTH, height: V_HEIGHT, channels: 4 as const, background: { r: 0, g: 0, b: 0, alpha: 0 } } };

    let background: Buffer;
    if (plan.mode === "blur") {
      // panorama: a blurred, enlarged copy fills the frame, no AI
      background = await sharp(oriented).resize(V_WIDTH, V_HEIGHT, { fit: "cover" }).blur(28).modulate({ brightness: 0.7 }).removeAlpha().png().toBuffer();
    } else {
      // The picture for the editor: photo in the middle, transparent bands above and below
      const canvas = await sharp(sheet).composite([{ input: placed, left: 0, top: plan.top }]).png().toBuffer();
      // The mask: transparent where AI may draw (the bands), solid over the photo
      const solid = await sharp({ create: { width: V_WIDTH, height: plan.photoH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
      const mask = await sharp(sheet).composite([{ input: solid, left: 0, top: plan.top }]).png().toBuffer();

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 52_000, maxRetries: 0 });
      const out = await openai.images.edit({
        model: "gpt-image-1",
        image: await toFile(canvas, "photo.png", { type: "image/png" }),
        mask: await toFile(mask, "mask.png", { type: "image/png" }),
        prompt: VERTICAL_PROMPT,
        size: "1024x1536",
        quality: "medium",
        n: 1,
      });
      const b64 = out.data?.[0]?.b64_json;
      if (!b64) throw new Error("OpenAI did not return a picture.");
      background = await sharp(Buffer.from(b64, "base64")).resize(V_WIDTH, V_HEIGHT, { fit: "fill" }).removeAlpha().png().toBuffer();
    }

    // The real photo goes back over the middle, so it is exactly what was shot
    const final = await sharp(background)
      .composite([{ input: await feathered(placed, plan.photoW, plan.photoH), left: 0, top: plan.top }])
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    const { error } = await admin().storage.from(BUCKET).upload(`${propertyId}/vertical/${p.name}.jpg`, final, { upsert: true, contentType: "image/jpeg", cacheControl: CACHE_SECONDS });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return NextResponse.json({ ok: true, status: plan.mode === "blur" ? "blurred" : "made", bytes: final.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not make the vertical photo.";
    console.error("Vertical photo error:", message);
    return bad(/timed out|timeout/i.test(message) ? "OpenAI took too long. Try this photo again." : message, 500);
  }
}
