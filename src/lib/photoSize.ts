/*
|--------------------------------------------------------------------------
| PHOTO SIZES (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| Photos used to be stored exactly as they came off the phone (3 to 8 MB each)
| and shown to every visitor at that size. That used up the Supabase data
| allowance. Now every photo is kept as:
|
|   main    1600 px on the longest side, JPEG   (listing page, brochures, posters)
|   thumb   480 px on the longest side, JPEG    (cards and the photo strip)
|
| The thumbnail lives next to the photo, found by name:
|   <id>/Living_Room.jpg          main
|   <id>/thumb/Living_Room.jpg    thumbnail
|
*/

export const BUCKET = "property-images";
export const MAIN_MAX = 1600;
export const THUMB_MAX = 480;
export const MAIN_QUALITY = 0.82;
export const THUMB_QUALITY = 0.78;
export const CACHE_SECONDS = "31536000"; // one year: a replaced photo gets a new ?t= address
/** A heavy picture that is not a JPEG (a PNG, say) is converted once, whatever its size in pixels. */
export const KEEP_BYTES = 450_000;

/** New size that fits inside max x max, never enlarging, even numbers not needed. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) return { width: 0, height: 0 };
  const longest = Math.max(width, height);
  if (longest <= max) return { width: Math.round(width), height: Math.round(height) };
  const scale = max / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Does this stored photo need shrinking?
 *  - more than 1600 px on the long side: yes
 *  - a heavy non-JPEG (PNG and similar): yes, once (the result is a JPEG)
 *  - a JPEG of 1600 px or less is NEVER touched again, so running the clean-up twice
 *    cannot compress a photo a second time.
 */
export function needsShrink(bytes: number, width: number, height: number, isJpeg = true): boolean {
  if (Math.max(width, height) > MAIN_MAX) return true;
  return !isJpeg && bytes > KEEP_BYTES;
}

/** "Living Room" -> "Living_Room.jpg" (same rule MIB has always used for the name). */
export function jpgName(photoType: string): string {
  return `${photoType.replace(/\s+/g, "_")}.jpg`;
}

const URL_RE = new RegExp(`^(.*/storage/v1/object/public/${BUCKET}/)(\\d+)/([^/?#]+?)(\\.[A-Za-z0-9]+)?(\\?[^#]*)?$`);

/** Split a public photo address into its parts, or null when it is not one of ours. */
export function parsePhotoUrl(url: string | null | undefined) {
  const m = URL_RE.exec(url ?? "");
  if (!m) return null;
  const [, base, id, name, ext = "", query = ""] = m;
  return { base, id, name, ext, query, path: `${id}/${name}${ext}`, thumbPath: `${id}/thumb/${name}.jpg` };
}

/** Address of the small version of a photo (same ?t= tag), or null if the address is not ours. */
export function thumbUrlFor(url: string | null | undefined): string | null {
  const p = parsePhotoUrl(url);
  return p ? `${p.base}${p.thumbPath}${p.query}` : null;
}

/** Storage path of the small version of a stored photo path ("12/Kitchen.png" -> "12/thumb/Kitchen.jpg"). */
export function thumbPathFor(path: string): string | null {
  const m = /^(\d+)\/([^/]+?)(\.[A-Za-z0-9]+)?$/.exec(path);
  return m ? `${m[1]}/thumb/${m[2]}.jpg` : null;
}
