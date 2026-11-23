/*
|--------------------------------------------------------------------------
| VERTICAL PHOTOS FOR VIDEO (pure, unit-tested)
|--------------------------------------------------------------------------
|
| OpenAI image editing is given the whole photo with the instruction in
| VERTICAL_PROMPT (change to 9:16 ratio, enhance to higher quality).
| The picture it returns replaces the photo in the vertical copy, so AI may change
| details; the original photo is never touched. A very wide photo (a panorama)
| gets a plain blurred background instead.
|
*/

export const V_WIDTH = 1024;
export const V_HEIGHT = 1536; // 2:3, the tall size the OpenAI image editor accepts; the video maker scales it to 9:16
export const FEATHER = 14; // px where the real photo fades into the drawn band, so there is no hard line
export const MAX_AI_BAND_SHARE = 0.75; // only a true panorama (about 2.7:1 or wider) gets the blurred fill instead of the AI
export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

export type VerticalPlan =
  | { mode: "skip"; reason: string }
  | { mode: "ai" | "blur"; photoW: number; photoH: number; top: number; bottom: number };

/** How a photo of width x height sits inside the tall frame. */
export function verticalPlan(width: number, height: number): VerticalPlan {
  if (!(width > 0) || !(height > 0)) return { mode: "skip", reason: "unreadable photo" };
  if (height >= width) return { mode: "skip", reason: "already vertical" };
  const photoW = V_WIDTH;
  const photoH = Math.max(1, Math.round((height * V_WIDTH) / width));
  const top = Math.floor((V_HEIGHT - photoH) / 2);
  const bottom = V_HEIGHT - photoH - top;
  const share = (V_HEIGHT - photoH) / V_HEIGHT;
  return { mode: share > MAX_AI_BAND_SHARE ? "blur" : "ai", photoW, photoH, top, bottom };
}

/** The instruction sent with the picture (the owner's own wording). */
export const VERTICAL_PROMPT = "Change to 9:16 ratio. Enhance to higher quality.";

/** Image models to try, best first. OPENAI_IMAGE_MODEL (set on Vercel) goes first when present. */
export function imageModels(preferred?: string | null): string[] {
  const list = ["gpt-image-2", "gpt-image-1.5", "gpt-image-1", "gpt-image-1-mini"];
  const p = (preferred ?? "").trim();
  return /^[A-Za-z0-9._-]{3,60}$/.test(p) ? [p, ...list.filter((m) => m !== p)] : list;
}

/** Did OpenAI refuse because THIS account cannot use that model (so the next one should be tried)? */
export function isModelAccessError(status: number | undefined, message: string): boolean {
  if (status === 404) return true;
  return status === 400 && /model/i.test(message) && /(does not exist|not found|no access|do not have access|must be verified|not supported|unsupported|invalid)/i.test(message);
}
