"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ThumbImg from "@/components/ThumbImg";
import { filesFor, importedPhotos, type PhotoRow } from "@/lib/importedPhotos";
import { photoFileName, savePhoto } from "@/lib/savePhoto";

/*
| Photos imported from a co-broke agent's post ("Photo 1", "Photo 2"...). They have no room name, so
| they are shown here instead of in the fixed slots. Each can be saved to the phone or deleted.
*/

export default function ImportedPhotos({ propertyId }: { propertyId: number }) {
  const [rows, setRows] = useState<PhotoRow[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("property_photos").select("id, photo_type, image_url, file_name").eq("property_id", propertyId).like("photo_type", "Photo %");
    setRows(importedPhotos((data as PhotoRow[]) ?? []));
  }, [propertyId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function remove(row: PhotoRow) {
    if (!window.confirm(`Delete ${row.photo_type}? The picture is removed for good.`)) return;
    setBusy(row.id);
    setError("");
    const files = filesFor(row.image_url);
    const { error: e } = await supabase.from("property_photos").delete().eq("id", row.id);
    if (e) setError("Could not delete the photo.");
    else if (files) await supabase.storage.from(files.bucket).remove(files.paths);
    setBusy(null);
    await load();
  }

  async function save(row: PhotoRow) {
    if (!row.image_url) return;
    setBusy(row.id);
    setError("");
    try {
      await savePhoto(row.image_url, photoFileName(row.photo_type ?? "photo", propertyId));
    } catch {
      setError("Could not save the photo.");
    }
    setBusy(null);
  }

  if (rows.length === 0) return null;

  return (
    <div className="mt-8" data-testid="imported-photos">
      <h3 className="mb-1 text-xl font-semibold text-black">Imported photos</h3>
      <p className="mb-4 text-sm text-gray-600">From a co-broke agent&apos;s Facebook post. They have no room names. Check each one, and delete any you should not use.</p>
      {error && <p role="alert" className="mb-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-semibold text-black">{r.photo_type}</p>
            <ThumbImg src={r.image_url!} alt={r.photo_type ?? "Photo"} className="h-40 w-full rounded object-cover" />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => save(r)} disabled={busy !== null} className="min-h-11 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-black disabled:opacity-50">Save to phone</button>
              <button type="button" onClick={() => remove(r)} disabled={busy !== null} className="min-h-11 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-red-800 disabled:opacity-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
