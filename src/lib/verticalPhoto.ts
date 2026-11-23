/*
|--------------------------------------------------------------------------
| VERTICAL PHOTOS FOR VIDEO (pure, unit-tested)
|--------------------------------------------------------------------------
|
| A horizontal photo is placed in the middle of a 9:16 frame. AI (OpenAI image
| editing) only draws the empty bands above and below it, continuing what is
| already there (sky, road, ground, ceiling, floor). Afterwards the ORIGINAL
| pixels are pasted back over the middle, so the real property is never changed.
| A very wide photo (a panorama) would need more than half of the frame drawn by
| AI, so it gets a plain blurred background instead.
|
*/

export const V_WIDTH = 1024;
export const V_HEIGHT = 1536; // 2:3, the tall size the OpenAI image editor accepts; the video maker scales it to 9:16
export const FEATHER = 14; // px where the real photo fades into the drawn band, so there is no hard line
export const MAX_AI_BAND_SHARE = 0.62; // more than this share drawn by AI -> blurred fill instead
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

/** The instruction sent with the picture. Never asks for anything new to appear. */
export const VERTICAL_PROMPT =
  "This is a real estate photograph placed in the middle of a tall frame. Fill ONLY the transparent areas above and below it by continuing what is already in the photo: sky and clouds, roof lines, walls, road, driveway, pavement, grass, ground, ceiling or floor. " +
  "Keep the same light, colours, perspective and camera height. " +
  "Do NOT add, remove or change any building, house, room, furniture, window, door, fence, vehicle, person, plant, sign, text, number plate or logo. Do not add new objects of any kind. " +
  "Do not change the photograph itself. Photorealistic, no borders, no watermark.";
