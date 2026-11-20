import { BRAND } from "./brand";
import { pathFor, type Lang } from "./i18n";

/*
|--------------------------------------------------------------------------
| VLOG (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| The videos live on YouTube. MIB only keeps the 11-character video id, so
| nothing is stored in Supabase and no video data is served from it. Only a
| real YouTube address is accepted: the id is cut out of it and everything
| else is thrown away, so no other address can reach the page.
|
*/

export type VlogVideo = {
  id: number;
  youtube_id: string;
  title_en: string | null;
  title_ms: string | null;
  title_zh: string | null;
  desc_en: string | null;
  desc_ms: string | null;
  desc_zh: string | null;
  /** Set only when the listing is itself public. */
  property_id: number | null;
  sort_order: number;
  created_at: string | null;
};

export const ID_RE = /^[A-Za-z0-9_-]{11}$/;
export const LIMITS = { title: 120, desc: 1500 } as const;

/** A YouTube address (or the bare 11-character id) -> the video id, or null. */
export function parseYouTubeId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (ID_RE.test(raw)) return raw;
  let u: URL;
  try {
    u = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.split("/")[1] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") id = u.searchParams.get("v");
    else if (["shorts", "embed", "live", "v"].includes(parts[0] ?? "")) id = parts[1] ?? null;
  }
  return id && ID_RE.test(id) ? id : null;
}

export const thumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const embedUrl = (id: string, autoplay = false) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

const oneLine = (v: unknown, max: number) =>
  typeof v === "string" ? Array.from(v.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim()).slice(0, max).join("") : "";
const paragraphs = (v: unknown, max: number) => {
  if (typeof v !== "string") return "";
  const t = v.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/g, " ").split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return Array.from(t).slice(0, max).join("").trim();
};

export type VideoInput = {
  url?: unknown; title_en?: unknown; title_ms?: unknown; title_zh?: unknown;
  desc_en?: unknown; desc_ms?: unknown; desc_zh?: unknown; property_id?: unknown; is_public?: unknown;
};

/** The cleaned row to save, or a plain-words reason it cannot be saved. */
export function cleanVideo(i: VideoInput): { ok: true; row: Omit<VlogVideo, "id" | "sort_order" | "created_at"> & { is_public: boolean } } | { ok: false; error: string } {
  const id = parseYouTubeId(i.url);
  if (!id) return { ok: false, error: "That is not a YouTube address. Paste the link from YouTube (youtube.com/watch…, youtu.be/… or a Shorts link)." };
  const t = (v: unknown) => oneLine(v, LIMITS.title) || null;
  const d = (v: unknown) => paragraphs(v, LIMITS.desc) || null;
  const row = { youtube_id: id, title_en: t(i.title_en), title_ms: t(i.title_ms), title_zh: t(i.title_zh), desc_en: d(i.desc_en), desc_ms: d(i.desc_ms), desc_zh: d(i.desc_zh), property_id: null as number | null, is_public: i.is_public !== false };
  if (!row.title_en && !row.title_ms && !row.title_zh) return { ok: false, error: "Add a title in at least one language." };
  const n = Number(i.property_id);
  row.property_id = Number.isSafeInteger(n) && n > 0 ? n : null;
  return { ok: true, row };
}

/** The text for a language, falling back to English, then to any other language. */
export function pickText(v: VlogVideo, kind: "title" | "desc", lang: Lang): string {
  const get = (l: Lang) => (v[`${kind}_${l}` as keyof VlogVideo] as string | null) ?? "";
  return get(lang) || get("en") || get("ms") || get("zh") || "";
}

/** Shown order: lowest sort number first, then newest. */
export function sortVideos<T extends Pick<VlogVideo, "sort_order" | "id">>(list: T[]): T[] {
  return [...list].sort((a, b) => a.sort_order - b.sort_order || b.id - a.id);
}

/** A new video goes to the top: one step before the current first one. */
export const nextTopOrder = (list: Pick<VlogVideo, "sort_order">[]): number =>
  list.length === 0 ? 0 : Math.min(...list.map((v) => v.sort_order)) - 1;

/** Swap a video with its neighbour: returns the two new sort numbers, or null at the end of the list. */
export function moveVideo(list: Pick<VlogVideo, "id" | "sort_order">[], id: number, dir: -1 | 1): { id: number; sort_order: number }[] | null {
  const s = sortVideos(list);
  const i = s.findIndex((v) => v.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= s.length) return null;
  // give every video its position as the sort number, so equal numbers never block a move
  const order = s.map((v, k) => ({ id: v.id, sort_order: k }));
  [order[i].sort_order, order[j].sort_order] = [order[j].sort_order, order[i].sort_order];
  return order.filter((o, k) => o.sort_order !== k);
}

/** Schema.org description of one video page. */
export function videoSchema(v: VlogVideo, lang: Lang) {
  const title = pickText(v, "title", lang);
  const desc = pickText(v, "desc", lang) || title;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description: desc.slice(0, 500),
    thumbnailUrl: [thumbUrl(v.youtube_id)],
    uploadDate: v.created_at ?? undefined,
    embedUrl: embedUrl(v.youtube_id),
    contentUrl: watchUrl(v.youtube_id),
    publisher: { "@id": `${BRAND.siteUrl}/#agent` },
    url: `${BRAND.siteUrl}${pathFor(lang, `/vlog/${v.youtube_id}`)}`,
  };
}

const EN = {
  nav: "Vlog", title: "Vlog", intro: "Property tours and viewing videos from Ipoh and Perak.", empty: "No videos yet. Please check back soon.",
  watch: "Watch", play: "Play video", all: "All videos", viewProperty: "View this property", aboutVideo: "About this video",
  onYoutube: "Watch on YouTube", metaDescription: "Property tours and viewing videos from Ipoh and Perak by {name}.", moreVideos: "More videos", listingVideo: "Viewing video",
  whatsapp: "Ask Max about this property", whatsappMsg: "Hi Max, I watched your video \"{title}\" on maxproperty.my. ",
};
const MS: typeof EN = {
  nav: "Vlog", title: "Vlog", intro: "Video lawatan hartanah di Ipoh dan Perak.", empty: "Belum ada video. Sila datang semula nanti.",
  watch: "Tonton", play: "Main video", all: "Semua video", viewProperty: "Lihat hartanah ini", aboutVideo: "Tentang video ini",
  onYoutube: "Tonton di YouTube", metaDescription: "Video lawatan hartanah di Ipoh dan Perak oleh {name}.", moreVideos: "Video lain", listingVideo: "Video lawatan",
  whatsapp: "Tanya Max tentang hartanah ini", whatsappMsg: "Hi Max, saya tonton video anda \"{title}\" di maxproperty.my. ",
};
const ZH: typeof EN = {
  nav: "视频", title: "视频", intro: "怡保及霹雳的房产看房视频。", empty: "暂时还没有视频，请稍后再来。",
  watch: "观看", play: "播放视频", all: "全部视频", viewProperty: "查看这个房产", aboutVideo: "关于这个视频",
  onYoutube: "在 YouTube 观看", metaDescription: "{name} 带您看怡保及霹雳的房产。", moreVideos: "更多视频", listingVideo: "看房视频",
  whatsapp: "向 Max 询问这个房产", whatsappMsg: "你好 Max，我在 maxproperty.my 看了你的视频「{title}」。",
};
export const vlogText = (lang: Lang) => (lang === "ms" ? MS : lang === "zh" ? ZH : EN);
export const fillText = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
