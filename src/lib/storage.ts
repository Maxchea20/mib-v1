// File: src/lib/storage.ts

import { supabase } from "./supabase";

const BUCKET = "property-images";

export async function uploadPropertyPhoto(
  propertyId: number,
  photoType: string,
  file: File
) {
  const extension = file.name.split(".").pop();

  const fileName =
    photoType.replace(/\s+/g, "_") +
    "." +
    extension;

  const filePath =
    `${propertyId}/${fileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        upsert: true,
      });

  if (uploadError) throw uploadError;

  const { data } =
    supabase.storage
      .from(BUCKET)
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