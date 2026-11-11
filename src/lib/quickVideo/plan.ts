import { placeOf, priceText, typeLabel, type ShareListing } from "../shareKit";
import { BRAND } from "../../site/brand";

/*
|--------------------------------------------------------------------------
| QUICK VIDEO: the plan (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| Turns a listing and the chosen photos into a list of scenes with timings,
| pan directions and on-screen words. The real photos are only panned and
| zoomed slightly: nothing is generated or invented, so the video always
| shows the property as it is.
|
*/

export type VideoLang = "en" | "ms";
export type Pace = "standard" | "fast";

export const WIDTH = 720;
export const HEIGHT = 1280;
export const FPS = 30;
export const FADE = 0.5; // cross-fade between scenes, seconds
export const END_SECONDS = 3;
export const MAX_PHOTOS = 12;
export const MAX_LABEL = 40;

export type Scene = {
  index: number;
  seconds: number;
  dir: "ltr" | "rtl";
  kind: "opening" | "room";
  /** Room label shown on a "room" scene (empty = no label). */
  label: string;
};

/* ------------------------------------------------------------------ labels */

const ROOM_NAMES: Record<string, Record<VideoLang, string>> = {
  "Living Room": { en: "Living room", ms: "Ruang tamu" },
  Kitchen: { en: "Kitchen", ms: "Dapur" },
  "Master Bedroom": { en: "Master bedroom", ms: "Bilik tidur utama" },
  "Bedroom 2": { en: "Bedroom 2", ms: "Bilik tidur 2" },
  "Bedroom 3": { en: "Bedroom 3", ms: "Bilik tidur 3" },
  Bathroom: { en: "Bathroom", ms: "Bilik air" },
  "Car Porch": { en: "Car porch", ms: "Porch kereta" },
  Backyard: { en: "Backyard", ms: "Halaman belakang" },
  Interior: { en: "Interior", ms: "Dalaman" },
  "Office Area": { en: "Office area", ms: "Kawasan pejabat" },
  Toilet: { en: "Toilet", ms: "Tandas" },
  Parking: { en: "Parking", ms: "Tempat letak kereta" },
  "Road Frontage": { en: "Road frontage", ms: "Hadapan jalan" },
  "Main Gate": { en: "Main gate", ms: "Pintu masuk utama" },
  Office: { en: "Office", ms: "Pejabat" },
  Warehouse: { en: "Warehouse", ms: "Gudang" },
  "Production Area": { en: "Production area", ms: "Kawasan pengeluaran" },
  "Loading Bay": { en: "Loading bay", ms: "Ruang pemunggahan" },
  "Electrical Room": { en: "Electrical room", ms: "Bilik elektrik" },
  Compound: { en: "Compound", ms: "Kawasan kompaun" },
  "Road Access": { en: "Road access", ms: "Akses jalan" },
  "Left Boundary": { en: "Left boundary", ms: "Sempadan kiri" },
  "Right Boundary": { en: "Right boundary", ms: "Sempadan kanan" },
  "Surrounding Area": { en: "Surrounding area", ms: "Kawasan sekeliling" },
  "Drone View": { en: "Aerial view", ms: "Pandangan udara" },
};

/** The photo types that show the outside / cover of a property. */
const COVER_TYPES = ["Front House", "Shop Front", "Factory Front", "Front View"];

/** Default label for a photo, from its type in MIB (cover photos get none). */
export function defaultLabel(photoType: string | null | undefined, lang: VideoLang): string {
  const t = (photoType ?? "").trim();
  if (!t || COVER_TYPES.includes(t)) return "";
  return ROOM_NAMES[t]?.[lang] ?? t;
}

/** Tidy a label typed by the user: no control characters, at most MAX_LABEL characters. */
export function cleanLabel(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_LABEL);
}

/* ------------------------------------------------------------------ timing */

/** Seconds a scene stays on screen. The opening scene is a little longer. */
export function sceneSeconds(index: number, pace: Pace): number {
  const base = pace === "fast" ? 2.4 : 3.4;
  return index === 0 ? base + 0.4 : base;
}

export function buildScenes(photoCount: number, labels: string[], pace: Pace): Scene[] {
  const n = Math.max(1, Math.min(MAX_PHOTOS, Math.floor(photoCount)));
  return Array.from({ length: n }, (_, i) => ({
    index: i,
    seconds: sceneSeconds(i, pace),
    dir: i % 2 === 0 ? "ltr" : "rtl",
    kind: i === 0 ? "opening" : "room",
    label: i === 0 ? "" : cleanLabel(labels[i]),
  }));
}

/** Start time of each cross-fade when clips are joined one after another. */
export function fadeOffsets(durations: number[], fade = FADE): number[] {
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < durations.length - 1; i++) {
    acc += durations[i] - fade;
    out.push(Math.round(acc * 100) / 100);
  }
  return out;
}

export function totalSeconds(durations: number[], fade = FADE): number {
  if (durations.length === 0) return 0;
  const sum = durations.reduce((a, b) => a + b, 0);
  return Math.round((sum - fade * (durations.length - 1)) * 100) / 100;
}

/* ------------------------------------------------------------ ffmpeg filters */

/**
 * Slow pan across a photo with a gentle up/down drift.
 * Photos are scaled to 1500 px high (at least 900 wide), then a 720x1280 window
 * moves across them.
 */
export function panFilter(dir: Scene["dir"], seconds: number): string {
  const x = dir === "ltr" ? `(iw-${WIDTH})*t/${seconds}` : `(iw-${WIDTH})*(1-t/${seconds})`;
  return (
    `scale=w=max(900\\,trunc(iw*1500/ih/2)*2):h=-2:flags=lanczos,` +
    `crop=${WIDTH}:${HEIGHT}:x='${x}':y='(ih-${HEIGHT})/2+20*sin(t)',fps=${FPS},setsar=1`
  );
}

/** One scene: the panned photo with its text overlay fading in. */
export function sceneFilter(dir: Scene["dir"], seconds: number): string {
  return (
    `[0:v]${panFilter(dir, seconds)}[bg];` +
    `[1:v]format=rgba,fade=t=in:st=0.35:d=0.5:alpha=1[ov];` +
    `[bg][ov]overlay=0:0:format=auto,format=yuv420p[v]`
  );
}

/** Joins N clips with cross-fades. Needs at least 2 clips. */
export function joinFilter(durations: number[], fade = FADE): string {
  const offsets = fadeOffsets(durations, fade);
  let graph = "";
  let prev = "[0:v]";
  offsets.forEach((offset, i) => {
    const out = i === offsets.length - 1 ? "[v]" : `[x${i}]`;
    graph += `${prev}[${i + 1}:v]xfade=transition=fade:duration=${fade}:offset=${offset}${out};`;
    prev = out;
  });
  return graph.slice(0, -1);
}

/* -------------------------------------------------------------------- words */

export type OpeningCopy = { tag: string; title: string; sub: string };
export type EndCopy = { heading: string; whatsapp: string; ren: string; site: string };

/** Words for the first scene, from the listing's own details. */
export function openingCopy(l: ShareListing & { headline?: string | null }, lang: VideoLang, showPrice: boolean): OpeningCopy {
  const rent = l.purpose === "For Rent";
  const tag = lang === "ms" ? (rent ? "DISEWA" : "DIJUAL") : rent ? "FOR RENT" : "FOR SALE";
  const raw = (l.headline || l.title || "").replace(/\s+/g, " ").trim();
  const title = (raw || typeLabel(l, lang)).slice(0, 48);
  const sub = [showPrice ? priceText(l, lang) : "", placeOf(l)].filter(Boolean).join("  ·  ");
  return { tag, title, sub };
}

export function endCopy(lang: VideoLang): EndCopy {
  return {
    heading: lang === "ms" ? "Berminat? Mesej Max" : "Interested? Message Max",
    whatsapp: `WhatsApp ${BRAND.whatsappDisplay}`,
    ren: BRAND.renNumber ? (lang === "ms" ? `Ejen Harta Tanah Berdaftar · REN ${BRAND.renNumber}` : `Registered Estate Negotiator · REN ${BRAND.renNumber}`) : "",
    site: BRAND.siteUrl.replace(/^https?:\/\//, ""),
  };
}
