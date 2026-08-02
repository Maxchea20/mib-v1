"use client";

import { supabase } from "@/lib/supabase";

type Props = {
  id: number;
  title: string;
};

export default function DeleteListingButton({
  id,
  title,
}: Props) {

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis will permanently delete the listing and all photos.`
    );

    if (!confirmed) return;

    // Get photo file names
    const { data: photos, error: photoError } = await supabase
      .from("property_photos")
      .select("file_name")
      .eq("property_id", id);

    if (photoError) {
      alert(photoError.message);
      return;
    }

    // Delete files from Storage
    if (photos?.length) {
      const files = photos.map((photo) => photo.file_name);

      const { error: storageError } = await supabase.storage
        .from("property-images")
        .remove(files);

      if (storageError) {
        alert(storageError.message);
        return;
      }
    }

    // Delete property (property_photos will cascade because of your FK)
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Listing deleted successfully.");

    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
    >
      Delete
    </button>
  );
}