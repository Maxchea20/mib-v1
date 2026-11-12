import { fitWithin } from "./photoSize";

/*
| Shrinks a photo in the browser before it is uploaded: upright (phone rotation
| tag applied), at most `max` px on the long side, JPEG. Returns null when the
| browser cannot read the picture (for example a HEIC file in desktop Chrome);
| the caller then uploads the original instead of failing.
*/
export async function shrinkImage(file: File | Blob, max: number, quality: number): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
    if (!width || !height) {
      bitmap.close();
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));
  } catch {
    return null;
  }
}
