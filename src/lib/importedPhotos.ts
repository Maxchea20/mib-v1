/*
|--------------------------------------------------------------------------
| IMPORTED PHOTOS (pure, unit-tested)
|--------------------------------------------------------------------------
|
| Photos Becky saves from a co-broke agent's post are named "Photo 1", "Photo 2"... They have no room
| name, so they are not one of the Media Manager's fixed slots. They are listed in their own section.
|
*/

import { BUCKET, mediumPathFor, parsePhotoUrl, thumbPathFor } from "./photoSize";

export type PhotoRow = { id: number; photo_type: string | null; image_url: string | null; file_name?: string | null };

export const isImportedType = (t: string | null | undefined) => /^Photo \d+$/.test((t ?? "").trim());

const numberOf = (t: string | null | undefined) => Number(/\d+/.exec(t ?? "")?.[0] ?? 0);

/** Only the imported photos, in their own order (Photo 2 before Photo 10). */
export function importedPhotos<T extends PhotoRow>(rows: T[]): T[] {
  return rows.filter((r) => isImportedType(r.photo_type) && r.image_url).sort((a, b) => numberOf(a.photo_type) - numberOf(b.photo_type));
}

/** Every storage file behind one photo: the main picture, the mid-size and the small copy. */
export function filesFor(url: string | null | undefined): { bucket: string; paths: string[] } | null {
  const p = parsePhotoUrl(url);
  if (!p) return null;
  const paths = [p.path, mediumPathFor(p.path), thumbPathFor(p.path)].filter((x): x is string => Boolean(x));
  return { bucket: BUCKET, paths };
}
