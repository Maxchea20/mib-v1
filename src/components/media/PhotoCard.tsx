"use client";

import { useEffect, useRef, useState } from "react";
import {
  uploadPropertyPhoto,
  getPropertyPhoto,
} from "@/lib/storage";
import { photoFileName, savePhoto } from "@/lib/savePhoto";

type Props = {
  propertyId: number;
  photoType: string;
};

export default function PhotoCard({
  propertyId,
  photoType,
}: Props) {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] =
    useState<string | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState("");

  useEffect(() => {
    loadPhoto();
  }, []);

  async function loadPhoto() {
    const url =
      await getPropertyPhoto(
        propertyId,
        photoType
      );

    if (url) {
      setImageUrl(url);
    }
  }

  async function handleSave() {
    if (!imageUrl) return;
    setSaving(true);
    setSaved("");
    try {
      const r = await savePhoto(imageUrl, photoFileName(photoType, propertyId));
      setSaved(r === "downloaded" ? "Saved to your downloads." : r === "shared" ? "Choose Save Image in the menu." : "");
    } catch (error: any) {
      alert(error.message || "Could not save the photo.");
    } finally {
      setSaving(false);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  async function handleSelectFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    try {

      setUploading(true);

      const url =
        await uploadPropertyPhoto(
          propertyId,
          photoType,
          file
        );

      setImageUrl(url);

    } catch (error: any) {

      alert(error.message);

    } finally {

      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    }
  }

  return (

    <div className="border rounded-lg p-5">

      <h3 className="font-semibold text-black mb-3">
        {photoType}
      </h3>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelectFile}
        className="hidden"
      />

      <div
        onClick={!uploading ? openFilePicker : undefined}
        className="relative h-48 border rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
      >

        {imageUrl ? (

          <>
            <img
              src={imageUrl}
              alt={photoType}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">

              <span className="text-white font-semibold text-lg">

                📷 Replace Photo

              </span>

            </div>

          </>

        ) : (

          <div className="w-full h-full flex flex-col items-center justify-center">

            <div className="text-5xl mb-3">

              📷

            </div>

            <div className="font-semibold text-gray-700">

              Upload Photo

            </div>

          </div>

        )}

        {uploading && (

          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">

            <div className="text-blue-600 font-bold">

              Uploading...

            </div>

          </div>

        )}

      </div>

      {imageUrl && (

        <>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="mt-3 min-h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Preparing..." : "⬇ Save to phone"}
          </button>

          {saved && (
            <p className="mt-1 text-xs text-gray-500" role="status">{saved}</p>
          )}
        </>

      )}

    </div>

  );

}