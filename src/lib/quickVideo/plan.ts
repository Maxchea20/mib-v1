import { placeOf, priceText, sizeWithUnit, typeLabel, zhPlace, type ShareListing } from "../shareKit";
import { BRAND } from "../../site/brand";

/*
|--------------------------------------------------------------------------
| QUICK VIDEO: the plan (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| Turns a listing and the chosen photos into a timeline of scenes with
| timings, camera moves and on-screen words, and builds the FFmpeg graph.
| The real photos are only shown whole, zoomed or drifted slowly: nothing
| is generated or invented, so the video always shows the property as it is.
|
| Layout (1080 x 1920, vertical):
|   y 140..200   brand
|   y 250..1150  the photo, shown whole on a blurred copy of itself
|   y 1200..1480 words (kept clear of the app buttons and caption area)
|
*/

export type VideoLang = "en" | "ms" | "zh";
export type Length = "auto" | "short";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 24;
export const FADE_FRAMES = 12; // cross-fade between scenes: 0.5 s
export const MAX_PHOTOS = 12;
export const MAX_LABEL = 40;

export const LAYOUT = {
  boxW: 1080, // the photo is fitted inside this box
  boxH: 880,
  centerY: 690, // the box is centred here
  headerTop: 140,
  textTop: 1200,
  /** The source photo is made this much bigger than shown, so zooming in stays sharp. */
  headroom: 1.1,
} as const;

/* ------------------------------------------------------------------ labels */

const ROOM_NAMES: Record<string, Record<VideoLang, string>> = {
  "Living Room": { en: "Living room", ms: "Ruang tamu", zh: "客厅" },
  Kitchen: { en: "Kitchen", ms: "Dapur", zh: "厨房" },
  "Master Bedroom": { en: "Master bedroom", ms: "Bilik tidur utama", zh: "主卧室" },
  "Bedroom 2": { en: "Bedroom 2", ms: "Bilik tidur 2", zh: "卧室 2" },
  "Bedroom 3": { en: "Bedroom 3", ms: "Bilik tidur 3", zh: "卧室 3" },
  Bathroom: { en: "Bathroom", ms: "Bilik air", zh: "浴室" },
  "Car Porch": { en: "Car porch", ms: "Porch kereta", zh: "车位" },
  Backyard: { en: "Backyard", ms: "Halaman belakang", zh: "后院" },
  Interior: { en: "Interior", ms: "Dalaman", zh: "室内" },
  "Office Area": { en: "Office area", ms: "Kawasan pejabat", zh: "办公区" },
  Toilet: { en: "Toilet", ms: "Tandas", zh: "洗手间" },
  Parking: { en: "Parking", ms: "Tempat letak kereta", zh: "停车场" },
  "Road Frontage": { en: "Road frontage", ms: "Hadapan jalan", zh: "临路面" },
  "Main Gate": { en: "Main gate", ms: "Pintu masuk utama", zh: "大门" },
  Office: { en: "Office", ms: "Pejabat", zh: "办公室" },
  Warehouse: { en: "Warehouse", ms: "Gudang", zh: "仓库" },
  "Production Area": { en: "Production area", ms: "Kawasan pengeluaran", zh: "生产区" },
  "Loading Bay": { en: "Loading bay", ms: "Ruang pemunggahan", zh: "装卸区" },
  "Electrical Room": { en: "Electrical room", ms: "Bilik elektrik", zh: "电房" },
  Compound: { en: "Compound", ms: "Kawasan kompaun", zh: "厂区" },
  "Road Access": { en: "Road access", ms: "Akses jalan", zh: "道路通道" },
  "Left Boundary": { en: "Left boundary", ms: "Sempadan kiri", zh: "左侧边界" },
  "Right Boundary": { en: "Right boundary", ms: "Sempadan kanan", zh: "右侧边界" },
  "Surrounding Area": { en: "Surrounding area", ms: "Kawasan sekeliling", zh: "周边环境" },
  "Drone View": { en: "Aerial view", ms: "Pandangan udara", zh: "航拍视角" },
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
  return Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim()).slice(0, MAX_LABEL).join("");
}

/* ---------------------------------------------------------------- timeline */

export type SceneKind = "opening" | "photo" | "facts" | "end";
export type Motion = { z0: number; z1: number; dx0: number; dx1: number };

export type Scene = {
  index: number;
  kind: SceneKind;
  /** Which chosen photo (0-based) the scene shows. The facts and end cards have none of their own. */
  photo: number | null;
  frames: number;
  seconds: number;
  /** Room label shown on a "photo" scene (empty = no label). */
  label: string;
  motion: Motion | null;
};

/**
 * Slow, varied camera moves: a push in, a drift to the right, a pull out, a drift to the left.
 * Drifts zoom a little so a drifting photo never shows a gap at its edge.
 */
const MOTIONS: Motion[] = [
  { z0: 1.0, z1: 1.07, dx0: 0, dx1: 0 },
  { z0: 1.06, z1: 1.06, dx0: -28, dx1: 28 },
  { z0: 1.07, z1: 1.0, dx0: 0, dx1: 0 },
  { z0: 1.06, z1: 1.06, dx0: 28, dx1: -28 },
];

export function motionFor(photoIndex: number): Motion {
  if (photoIndex <= 0) return MOTIONS[0];
  return MOTIONS[photoIndex % 4];
}

/** Seconds each photo stays on screen: fewer photos get more time, many photos get less. */
export function secondsPerPhoto(photoCount: number, length: Length): number {
  const base = photoCount <= 4 ? 3.6 : photoCount <= 6 ? 3.2 : photoCount <= 9 ? 2.9 : 2.6;
  if (length === "auto") return base;
  return Math.max(2.0, Math.round(base * 0.72 * 10) / 10);
}

const frames = (seconds: number) => Math.round(seconds * FPS);

export type TimelineOptions = { length: Length; facts: boolean };

export function buildTimeline(photoCount: number, labels: string[], o: TimelineOptions): Scene[] {
  const n = Math.max(1, Math.min(MAX_PHOTOS, Math.floor(photoCount)));
  const per = secondsPerPhoto(n, o.length);
  const short = o.length === "short";
  const scenes: Omit<Scene, "index">[] = [];

  scenes.push({ kind: "opening", photo: 0, frames: frames(per + 0.4), seconds: 0, label: "", motion: motionFor(0) });
  if (o.facts) scenes.push({ kind: "facts", photo: null, frames: frames(short ? 2.8 : 3.4), seconds: 0, label: "", motion: null });
  for (let i = 1; i < n; i++) {
    scenes.push({ kind: "photo", photo: i, frames: frames(per), seconds: 0, label: cleanLabel(labels[i]), motion: motionFor(i) });
  }
  scenes.push({ kind: "end", photo: null, frames: frames(short ? 2.4 : 3.0), seconds: 0, label: "", motion: null });

  return scenes.map((s, index) => ({ ...s, index, seconds: s.frames / FPS }));
}

export function totalFrames(scenes: Scene[]): number {
  if (scenes.length === 0) return 0;
  return scenes.reduce((a, s) => a + s.frames, 0) - FADE_FRAMES * (scenes.length - 1);
}

export function totalSeconds(scenes: Scene[]): number {
  return Math.round((totalFrames(scenes) / FPS) * 10) / 10;
}

/** When each cross-fade starts, in seconds, for scenes joined one after another. */
export function fadeOffsets(scenes: Scene[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < scenes.length - 1; i++) {
    acc += scenes[i].frames;
    out.push((acc - (i + 1) * FADE_FRAMES) / FPS);
  }
  return out;
}

/* ------------------------------------------------------------ ffmpeg graph */

export type SceneInput = {
  /** Index of the FFmpeg input holding the scene's background picture. */
  bg: number;
  /** Index of the input holding the moving photo (photo scenes only). */
  fg: number | null;
  /** Width the photo is shown at when not zoomed, in pixels (even). */
  baseW: number;
};

const num = (n: number) => String(Math.round(n * 1000) / 1000);

/**
 * One FFmpeg graph for the whole video. Each picture is decoded and converted ONCE, then
 * repeated for the length of its scene (the slow part used to be decoding it again for every frame).
 */
export function buildFilterGraph(scenes: Scene[], inputs: SceneInput[]): string {
  const f: string[] = [];
  const tb = `settb=1/${FPS}`;
  const rep = (frames: number) => `loop=loop=${frames - 1}:size=1,setpts=N/(${FPS}*TB),${tb}`;

  scenes.forEach((s, i) => {
    const inp = inputs[i];
    const d = s.frames / FPS;
    f.push(`[${inp.bg}:v]format=yuv420p,setsar=1,${rep(s.frames)}[b${i}]`);
    if (s.motion && inp.fg !== null) {
      const m = s.motion;
      f.push(
        `[${inp.fg}:v]format=yuv420p,${rep(s.frames)},` +
          `scale=w='2*trunc(${inp.baseW}*(${num(m.z0)}+${num(m.z1 - m.z0)}*t/${num(d)})/2)':h=-2:eval=frame:flags=bilinear[f${i}]`
      );
      f.push(
        `[b${i}][f${i}]overlay=x='(W-w)/2+${num(m.dx0)}+${num(m.dx1 - m.dx0)}*t/${num(d)}':y='${LAYOUT.centerY}-h/2':eval=frame,` +
          `format=yuv420p,fps=${FPS},${tb}[s${i}]`
      );
    } else {
      f.push(`[b${i}]fps=${FPS},${tb}[s${i}]`);
    }
  });

  const offsets = fadeOffsets(scenes);
  let prev = "[s0]";
  offsets.forEach((off, i) => {
    const out = i === offsets.length - 1 ? "[v]" : `[x${i}]`;
    f.push(`${prev}[s${i + 1}]xfade=transition=fade:duration=${num(FADE_FRAMES / FPS)}:offset=${num(off)}${out}`);
    prev = out;
  });
  if (offsets.length === 0) f.push("[s0]null[v]");
  return f.join(";");
}

/** FFmpeg encoder settings: fast enough for the server, and small files (about 1 MB per 8 seconds). */
export const ENCODER_ARGS = [
  "-c:v", "libx264",
  "-preset", "superfast",
  "-crf", "26",
  "-profile:v", "high",
  "-x264-params", "ref=1:subme=1:trellis=0:weightp=0:mbtree=0:aq-mode=0",
  "-pix_fmt", "yuv420p",
  "-r", String(FPS),
  "-an",
  "-movflags", "+faststart",
] as const;

/* -------------------------------------------------------------------- words */

export type OpeningCopy = { tag: string; title: string; sub: string };
export type EndCopy = { heading: string; whatsapp: string; ren: string; site: string };
export type FactRow = { label: string; value: string; big?: boolean };
export type FactsCopy = { heading: string; rows: FactRow[] };

type Listing = ShareListing & { headline?: string | null };

const placeFor = (l: Listing, lang: VideoLang) => (lang === "zh" ? placeOf(l).split(", ").map(zhPlace).join("，") : placeOf(l));

/** Words for the first scene, from the listing's own details. */
export function openingCopy(l: Listing, lang: VideoLang, showPrice: boolean): OpeningCopy {
  const rent = l.purpose === "For Rent";
  const tag = lang === "zh" ? (rent ? "出租" : "出售") : lang === "ms" ? (rent ? "DISEWA" : "DIJUAL") : rent ? "FOR RENT" : "FOR SALE";
  const raw = (l.headline || l.title || "").replace(/\s+/g, " ").trim();
  const title = Array.from(raw || typeLabel(l, lang)).slice(0, 48).join("");
  const sub = [showPrice ? priceText(l, lang) : "", placeFor(l, lang)].filter(Boolean).join(lang === "zh" ? "  ｜  " : "  ·  ");
  return { tag, title, sub };
}

export function endCopy(lang: VideoLang): EndCopy {
  return {
    heading: lang === "zh" ? "有意了解？联系 Max" : lang === "ms" ? "Berminat? Mesej Max" : "Interested? Message Max",
    whatsapp: `WhatsApp ${BRAND.whatsappDisplay}`,
    ren: BRAND.renNumber
      ? lang === "zh" ? `注册房地产经纪 · REN ${BRAND.renNumber}` : lang === "ms" ? `Ejen Harta Tanah Berdaftar · REN ${BRAND.renNumber}` : `Registered Estate Negotiator · REN ${BRAND.renNumber}`
      : "",
    site: BRAND.siteUrl.replace(/^https?:\/\//, ""),
  };
}

const TENURE: Record<string, Record<VideoLang, string>> = {
  freehold: { en: "Freehold", ms: "Pegangan bebas", zh: "永久地契" },
  leasehold: { en: "Leasehold", ms: "Pajakan", zh: "租赁地契" },
};

/** The "at a glance" card: only facts that exist; the price only when it is allowed to show. */
export function factsCopy(l: Listing, lang: VideoLang, showPrice: boolean): FactsCopy {
  const L = {
    heading: { en: "At a glance", ms: "Ringkasan", zh: "房产概览" }[lang],
    price: { en: "Price", ms: "Harga", zh: "价格" }[lang],
    size: { en: "Size", ms: "Saiz", zh: "面积" }[lang],
    rooms: { en: "Rooms", ms: "Bilik", zh: "房间" }[lang],
    tenure: { en: "Tenure", ms: "Pegangan", zh: "地契" }[lang],
    place: { en: "Location", ms: "Lokasi", zh: "地点" }[lang],
  };
  const rows: FactRow[] = [];

  const price = showPrice ? priceText(l, lang) : "";
  if (price) rows.push({ label: L.price, value: price, big: true });

  const size = l.category === "Land" ? sizeWithUnit(l.land_size) : sizeWithUnit(l.built_up) || sizeWithUnit(l.land_size);
  if (size) rows.push({ label: L.size, value: size });

  const beds = l.bedrooms ?? 0;
  const baths = l.bathrooms ?? 0;
  if (beds > 0) {
    const value =
      lang === "zh" ? `${beds} 房${baths > 0 ? ` · ${baths} 卫` : ""}` :
      lang === "ms" ? `${beds} bilik${baths > 0 ? ` · ${baths} bilik air` : ""}` :
      `${beds} bed${baths > 0 ? ` · ${baths} bath` : ""}`;
    rows.push({ label: L.rooms, value });
  }

  const tenureRaw = (l.tenure ?? "").replace(/_/g, " ").trim();
  if (tenureRaw) {
    const known = TENURE[tenureRaw.toLowerCase()];
    rows.push({ label: L.tenure, value: known ? known[lang] : tenureRaw.charAt(0).toUpperCase() + tenureRaw.slice(1) });
  }

  const place = placeFor(l, lang);
  if (place) rows.push({ label: L.place, value: place });

  return { heading: L.heading, rows: rows.slice(0, 5) };
}

/** A facts card is worth showing only when it has at least two facts. */
export const hasFacts = (c: FactsCopy) => c.rows.length >= 2;
