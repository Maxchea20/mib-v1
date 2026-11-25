/*
|--------------------------------------------------------------------------
| SAVE A PHOTO TO THE PHONE
|--------------------------------------------------------------------------
|
| On a phone the share sheet is used, which has "Save Image" (iPhone) or
| "Save to gallery" (Android). On a computer the photo is downloaded.
|
*/

/** "Living Room" + "12" -> "Living_Room-12.jpg" (letters, numbers, dash, underscore only). */
export function photoFileName(photoType: string, propertyId: number | string): string {
  const base = photoType.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "").replace(/_+/g, "_").replace(/^_|_$/g, "") || "photo";
  return `${base}-${propertyId}.jpg`;
}

export type SaveResult = "shared" | "downloaded" | "cancelled";

export async function savePhoto(url: string, fileName: string): Promise<SaveResult> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load the photo.");
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      // otherwise fall through to a normal download
    }
  }

  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
  return "downloaded";
}
