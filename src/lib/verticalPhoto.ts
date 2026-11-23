/*
|--------------------------------------------------------------------------
| VERTICAL PHOTOS FOR VIDEO (pure, unit-tested)
|--------------------------------------------------------------------------
|
| OpenAI image editing is given the whole photo with the instruction in
| VERTICAL_PROMPT (enhance the quality and change to a tall 9:16-style picture).
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
export const VERTICAL_PROMPT = "Enhance the photo quality to higher pixels. and change to 9:16 ratio";
