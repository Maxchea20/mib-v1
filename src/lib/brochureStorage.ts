import { supabase } from "@/lib/supabase";

const BUCKET = "property-brochures";

/**
 * Uploads the brochure PDF for a listing (overwriting any previous
 * one), and records its public URL + timestamp on the properties row.
 * Returns the public URL to use for viewing / sharing.
 */
export async function uploadBrochurePdf(propertyId: number, blob: Blob): Promise<string> {
  const filePath = `${propertyId}/brochure.pdf`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
    upsert: true,
    contentType: "application/pdf",
  });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  const pdfUrl = data.publicUrl + "?t=" + Date.now();

  const { error: dbError } = await supabase
    .from("properties")
    .update({
      brochure_url: pdfUrl,
      brochure_generated_at: new Date().toISOString(),
    })
    .eq("id", propertyId);

  if (dbError) throw dbError;

  return pdfUrl;
}