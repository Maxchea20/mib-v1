// File: src/lib/storage.ts

import { supabase } from "./supabase";
import { shrinkImage } from "./imageResize";
import { BUCKET as PHOTO_BUCKET, CACHE_SECONDS, MAIN_MAX, MAIN_QUALITY, THUMB_MAX, THUMB_QUALITY, jpgName, thumbPathFor } from "./photoSize";


/*
| Photos are shrunk before they are stored (1600 px, about 250 KB) and a small
| thumbnail (480 px) is stored next to them, so listing pages do not download
| 5 MB phone photos. A picture the browser cannot read is stored as it is.
*/
export async function uploadPropertyPhoto(
  propertyId: number,
  photoType: string,
  file: File
) {
  const main = await shrinkImage(file, MAIN_MAX, MAIN_QUALITY);

  const originalExtension = file.name.split(".").pop() || "jpg";
  const fileName = main
    ? jpgName(photoType)
    : photoType.replace(/\s+/g, "_") + "." + originalExtension;

  const filePath = `${propertyId}/${fileName}`;

  // The photo that was here before (it may have a different file type)
  const { data: previous } = await supabase
    .from("property_photos")
    .select("file_name")
    .eq("property_id", propertyId)
    .eq("photo_type", photoType)
    .maybeSingle();

  const { error: uploadError } =
    await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, main ?? file, {
        upsert: true,
        cacheControl: CACHE_SECONDS,
        contentType: main ? "image/jpeg" : file.type || undefined,
      });

  if (uploadError) throw uploadError;

  // Small version for cards and the photo strip. A failure here is not fatal:
  // the website falls back to the full photo.
  const thumb = main ? await shrinkImage(main, THUMB_MAX, THUMB_QUALITY) : null;
  const thumbPath = thumbPathFor(filePath);
  if (thumb && thumbPath) {
    await supabase.storage.from(PHOTO_BUCKET).upload(thumbPath, thumb, {
      upsert: true,
      cacheControl: CACHE_SECONDS,
      contentType: "image/jpeg",
    });
  }

  const { data } =
    supabase.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(filePath);

  const imageUrl =
  data.publicUrl + "?t=" + Date.now();

  const { error: dbError } =
    await supabase
      .from("property_photos")
      .upsert(
        {
          property_id: propertyId,
          photo_type: photoType,
          image_url: imageUrl,
          file_name: fileName,
        },
        {
          onConflict: "property_id,photo_type",
        }
      );

  if (dbError) throw dbError;

  // Remove the old file when the new one has a different name, so nothing is left behind
  if (previous?.file_name && previous.file_name !== fileName) {
    const oldPath = `${propertyId}/${previous.file_name}`;
    const oldThumb = thumbPathFor(oldPath);
    await supabase.storage.from(PHOTO_BUCKET).remove(oldThumb ? [oldPath, oldThumb] : [oldPath]);
  }

  return imageUrl;
}

export async function getPropertyPhoto(
  propertyId: number,
  photoType: string
) {
  const { data } = await supabase
    .from("property_photos")
    .select("image_url")
    .eq("property_id", propertyId)
    .eq("photo_type", photoType)
    .maybeSingle();

  return data?.image_url ?? null;
}