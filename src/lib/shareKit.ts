import { BRAND } from "../site/brand";
import { pathFor, type Lang } from "../site/i18n";

/*
|--------------------------------------------------------------------------
| SHARE KIT (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| Builds the caption, hashtags and tracked link for sharing a listing on
| Facebook, Instagram, Xiaohongshu and WhatsApp. Only facts that are already
| public on maxproperty.my are used: type, area / city / state, price, size,
| tenure, rooms. The street address and postal code are never included.
|
*/

export type ShareListing = {
  id: number | string;
  title?: string | null;
  category?: string | null;
  purpose?: string | null;
  price?: number | string | null;
  status?: string | null;
  is_public?: boolean | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  property_type?: string | null;
  property_sub_type?: string | null;
  land_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  built_up?: string | null;
  land_size?: string | null;
  tenure?: string | null;
};

export type SharePhoto = { photo_type?: string | null; image_url?: string | null };

export const LIVE_STATUSES = ["Available", "Booked"];

/** Photo that should come first, per category (same rule as the website). */
const COVER_TYPE: Record<string, string> = {
  Residential: "Front House",
  Commercial: "Shop Front",
  Industrial: "Factory Front",
  Land: "Front View",
};

/** Usable photo URLs, cover photo first, original order otherwise. */
export function orderedPhotoUrls(category: string | null | undefined, photos: SharePhoto[] | null | undefined): string[] {
  const cover = COVER_TYPE[category ?? ""] ?? "Front House";
  const list = (photos ?? []).filter((p): p is { photo_type?: string | null; image_url: string } => Boolean(p.image_url));
  return [...list.filter((p) => p.photo_type === cover), ...list.filter((p) => p.photo_type !== cover)].map((p) => p.image_url);
}

/** Is this listing actually visible on the public website right now? */
export function isLiveOnWebsite(l: Pick<ShareListing, "is_public" | "status">): boolean {
  return l.is_public === true && LIVE_STATUSES.includes(l.status ?? "");
}

/* ---------------------------------------------------------------- wording */

const TYPE_NAMES: Record<string, Partial<Record<Lang, string>>> = {
  Factory: { ms: "Kilang", zh: "工厂" },
  Warehouse: { ms: "Gudang", zh: "仓库" },
  "Cluster factory": { ms: "Kilang kluster", zh: "组合式工厂" },
  "Semi-D factory": { ms: "Kilang berkembar", zh: "半独立式工厂" },
  "Detached factory": { ms: "Kilang sesebuah", zh: "独立式工厂" },
  "Terrace factory": { ms: "Kilang teres", zh: "排屋式工厂" },
  "Industrial Land": { ms: "Tanah perindustrian", zh: "工业用地" },
  "Bungalow / Villa": { ms: "Banglo / Vila", zh: "独立式洋房 / 别墅" },
  "Semi-Detached House": { ms: "Rumah berkembar", zh: "半独立式住宅" },
  "Terrace / Link House": { ms: "Rumah teres / berangkai", zh: "排屋 / 连体屋" },
  Condominium: { ms: "Kondominium", zh: "共管公寓" },
  "Residential Land": { ms: "Tanah kediaman", zh: "住宅用地" },
  "Commercial Land": { ms: "Tanah komersial", zh: "商业用地" },
  "Agriculture Land": { ms: "Tanah pertanian", zh: "农业用地" },
  "Agricultural Land": { ms: "Tanah pertanian", zh: "农业用地" },
  Shop: { ms: "Kedai", zh: "店屋" },
  Office: { ms: "Pejabat", zh: "办公室" },
};

const CATEGORY_NAMES: Record<string, Record<Lang, string>> = {
  Residential: { en: "Property", ms: "Hartanah kediaman", zh: "住宅房产" },
  Commercial: { en: "Commercial property", ms: "Hartanah komersial", zh: "商业房产" },
  Industrial: { en: "Industrial property", ms: "Hartanah perindustrian", zh: "工业房产" },
  Land: { en: "Land", ms: "Tanah", zh: "土地" },
};

const EMOJI: Record<string, string> = { Residential: "🏠", Commercial: "🏪", Industrial: "🏭", Land: "🌳" };

const clean = (v: string | null | undefined) => (v ?? "").replace(/_/g, " ").trim();

/** The kind of property, in the chosen language ("Semi-D factory", "Kilang berkembar", ...). */
export function typeLabel(l: ShareListing, lang: Lang): string {
  const raw =
    l.category === "Land" ? clean(l.land_type) :
    l.category === "Residential" ? clean(l.property_type) :
    clean(l.property_sub_type) || clean(l.property_type);
  // "Industrial" is only a placeholder type for industrial listings, not a description
  const useful = raw && raw.toLowerCase() !== "industrial" ? raw : "";
  if (useful) return (lang !== "en" && TYPE_NAMES[useful]?.[lang]) || useful;
  return (CATEGORY_NAMES[l.category ?? ""] ?? CATEGORY_NAMES.Residential)[lang];
}

/** Area, city and state only, without repeats. Never the street address. */
export function placeOf(l: Pick<ShareListing, "area" | "city" | "state">): string {
  const parts: string[] = [];
  for (const v of [l.area, l.city, l.state]) {
    const t = (v ?? "").trim();
    if (t && !parts.some((p) => p.toLowerCase() === t.toLowerCase())) parts.push(t);
  }
  return parts.join(", ");
}

export function priceText(l: Pick<ShareListing, "price" | "purpose">, lang: Lang): string {
  const n = Number(l.price);
  if (l.price === null || l.price === undefined || l.price === "" || !Number.isFinite(n) || n <= 0) return "";
  const amount = `RM ${n.toLocaleString("en-MY")}`;
  if (l.purpose !== "For Rent") return amount;
  return `${amount} ${lang === "ms" ? "/ bulan" : lang === "zh" ? "/ 每月" : "/ month"}`;
}

export const sizeWithUnit = (v: string | null | undefined) => {
  const t = (v ?? "").trim();
  if (!t) return "";
  return /^[\d,.\s]+$/.test(t) ? `${t} sqft` : t;
};

/* --------------------------------------------------------------- hashtags */

const slugTag = (s: string) => "#" + s.replace(/[^A-Za-z0-9一-鿿]/g, "");

export function hashtagsFor(l: ShareListing, lang: Lang): string[] {
  const place = (l.city || l.area || "").trim();
  const state = (l.state || "").trim();
  const rent = l.purpose === "For Rent";
  const base: string[] = [];

  if (lang === "zh") {
    base.push("#马来西亚房产", "#怡保房产");
    if (state) base.push(`#${state === "Perak" ? "霹雳" : state}房产`);
    base.push(rent ? "#出租" : "#出售");
  } else if (lang === "ms") {
    base.push("#HartanahMalaysia", "#HartanahIpoh");
    if (state) base.push(`#Hartanah${state.replace(/\s/g, "")}`);
    base.push(rent ? "#UntukDisewa" : "#UntukDijual");
  } else {
    base.push("#MalaysiaProperty", "#IpohProperty");
    if (state) base.push(`${slugTag(state)}Property`);
    base.push(rent ? "#PropertyForRent" : "#PropertyForSale");
  }

  const cat: Record<string, Record<Lang, string[]>> = {
    Residential: { en: ["#HouseForSale"], ms: ["#RumahDijual"], zh: ["#住宅"] },
    Commercial: { en: ["#CommercialProperty"], ms: ["#HartanahKomersial"], zh: ["#商业房产"] },
    Industrial: { en: ["#FactoryForSale", "#IndustrialProperty"], ms: ["#KilangDijual"], zh: ["#工厂"] },
    Land: { en: ["#LandForSale"], ms: ["#TanahDijual"], zh: ["#土地"] },
  };
  const extra = cat[l.category ?? ""]?.[lang] ?? [];
  // "#HouseForSale" makes no sense for a rental
  const filtered = rent ? extra.filter((t) => !/ForSale|Dijual/.test(t)) : extra;
  if (place && lang === "en" && place.toLowerCase() !== "ipoh") base.push(`${slugTag(place)}Property`);

  const seen = new Set<string>();
  return [...base, ...filtered].filter((t) => (seen.has(t.toLowerCase()) ? false : (seen.add(t.toLowerCase()), true))).slice(0, 8);
}

/* ------------------------------------------------------------ tracked link */

export type ShareChannel = "share" | "whatsapp" | "facebook" | "instagram" | "xiaohongshu" | "copy";

/** The public listing address with a hidden tag showing where the visitor came from. */
export function trackedUrl(id: number | string, lang: Lang, channel: ShareChannel = "share"): string {
  const q = new URLSearchParams({ utm_source: channel, utm_medium: "social", utm_campaign: `listing-${id}` });
  return `${BRAND.siteUrl}${pathFor(lang, `/listing/${id}`)}?${q.toString()}`;
}

export const LINK_TOKEN = "{LINK}";

/* ----------------------------------------------------------------- caption */

/** The caption with a {LINK} placeholder, so the link can be tagged per channel. */
export function buildCaption(l: ShareListing, lang: Lang): string {
  const rent = l.purpose === "For Rent";
  const place = placeOf(l);
  const type = typeLabel(l, lang);
  const emoji = EMOJI[l.category ?? ""] ?? "🏠";

  const head =
    lang === "ms" ? `${type} untuk ${rent ? "disewa" : "dijual"}${place ? ` di ${place}` : ""}` :
    lang === "zh" ? `${place ? `${place} ` : ""}${type}${rent ? "出租" : "出售"}` :
    `${type} for ${rent ? "rent" : "sale"}${place ? ` in ${place}` : ""}`;

  const size = l.category === "Land" ? sizeWithUnit(l.land_size) : sizeWithUnit(l.built_up) || sizeWithUnit(l.land_size);
  const rooms =
    (l.bedrooms ?? 0) > 0
      ? lang === "zh" ? `${l.bedrooms} 房${(l.bathrooms ?? 0) > 0 ? ` ${l.bathrooms} 卫` : ""}`
        : lang === "ms" ? `${l.bedrooms} bilik${(l.bathrooms ?? 0) > 0 ? ` ${l.bathrooms} bilik air` : ""}`
        : `${l.bedrooms} bed${(l.bathrooms ?? 0) > 0 ? ` ${l.bathrooms} bath` : ""}`
      : "";
  const tenure = clean(l.tenure);
  const tenureText = tenure ? tenure.charAt(0).toUpperCase() + tenure.slice(1) : "";

  const facts = [priceText(l, lang), rooms, size, tenureText].filter(Boolean).join(" · ");

  const cta =
    lang === "ms" ? "Mesej Max untuk butiran dan lawatan 👇" :
    lang === "zh" ? "联系 Max 了解详情与安排看房 👇" :
    "Message Max for details and viewing 👇";
  const wa = `WhatsApp ${BRAND.whatsappDisplay}`;
  const ren = BRAND.renNumber ? `REN ${BRAND.renNumber}` : "";

  return [
    `${emoji} ${head}`,
    facts,
    [cta, wa, ren].filter(Boolean).join("\n"),
    LINK_TOKEN,
    hashtagsFor(l, lang).join(" "),
  ].filter(Boolean).join("\n\n");
}

/** Put the real tagged link into a caption. */
export function withLink(caption: string, id: number | string, lang: Lang, channel: ShareChannel): string {
  return caption.split(LINK_TOKEN).join(trackedUrl(id, lang, channel));
}

/* =====================================================================
   VIDEO CAPTIONS: one style per app (TikTok, Instagram, Xiaohongshu)
   ===================================================================== */

export type Platform = "tiktok" | "instagram" | "xiaohongshu";

export type PlatformCaption = {
  /** Xiaohongshu has a separate title box (20 characters at most). */
  title: string;
  body: string;
  /** What to paste: the title and the text together where the app has one box. */
  full: string;
};

/** Perak towns in Chinese. Anything not listed keeps its normal spelling. */
const ZH_PLACES: Record<string, string> = {
  ipoh: "怡保", perak: "霹雳", taiping: "太平", kampar: "金宝", "batu gajah": "华都牙也",
  "teluk intan": "安顺", sitiawan: "实兆远", lumut: "红土坎", menglembu: "万里望", "kuala kangsar": "江沙",
};
export const zhPlace = (v: string) => ZH_PLACES[v.trim().toLowerCase()] ?? v.trim();

/** RM 1,500,000 -> "RM1.5m" / "150万"; short forms for titles. */
function shortPrice(price: number, lang: Lang): string {
  if (lang === "zh") {
    if (price >= 10000) return `${Math.round((price / 10000) * 10) / 10}万`.replace(".0万", "万");
    return `${price}`;
  }
  if (price >= 1_000_000) return `RM${Math.round((price / 1_000_000) * 100) / 100}m`;
  if (price >= 1000) return `RM${Math.round(price / 1000)}k`;
  return `RM${price}`;
}

export function buildPlatformCaption(l: ShareListing, lang: Lang, platform: Platform, opts: { includeContact?: boolean } = {}): PlatformCaption {
  const rent = l.purpose === "For Rent";
  const emoji = EMOJI[l.category ?? ""] ?? "🏠";
  const place = placeOf(l);
  const type = typeLabel(l, lang);
  const facts = buildCaption(l, lang).split("\n\n")[1] ?? "";   // price · rooms · size · tenure
  const n = Number(l.price);
  const hasPrice = Number.isFinite(n) && n > 0;
  const site = `${BRAND.siteUrl.replace(/^https?:\/\//, "")}/listing/${l.id}`;
  const wa = `WhatsApp ${BRAND.whatsappDisplay}`;
  const ren = BRAND.renNumber ? `REN ${BRAND.renNumber}` : "";
  const cta = lang === "ms" ? "Mesej Max untuk butiran dan lawatan 👇" : lang === "zh" ? "联系 Max 了解详情与安排看房 👇" : "Message Max for details and viewing 👇";
  const head =
    lang === "ms" ? `${type} untuk ${rent ? "disewa" : "dijual"}${place ? ` di ${place}` : ""}` :
    lang === "zh" ? `${place ? `${place.split(", ").map(zhPlace).join(" ")} ` : ""}${type}${rent ? "出租" : "出售"}` :
    `${type} for ${rent ? "rent" : "sale"}${place ? ` in ${place}` : ""}`;

  if (platform === "tiktok") {
    // short: TikTok viewers read the first line only
    const tags = hashtagsFor(l, lang).slice(0, 5).join(" ");
    const body = [`${emoji} ${head}`, facts, [wa, site].join("\n"), tags].filter(Boolean).join("\n\n");
    return { title: "", body, full: body };
  }

  if (platform === "instagram") {
    const link = lang === "ms" ? "Pautan di bio 🔗" : lang === "zh" ? "链接在个人简介 🔗" : "Link in bio 🔗";
    const body = [`${emoji} ${head}`, facts, [cta, wa, ren].filter(Boolean).join("\n"), link, hashtagsFor(l, lang).join(" ")].filter(Boolean).join("\n\n");
    return { title: "", body, full: body };
  }

  // Xiaohongshu: a short title, then emoji lines. Phone numbers and links are left out by default.
  const city = zhPlace((l.city || l.area || "").trim());
  const t = lang === "zh"
    ? `${city ? `${city}｜` : ""}${type}${rent ? "出租" : "出售"}${hasPrice ? ` ${shortPrice(n, "zh")}` : ""}`
    : `${city ? `${city}｜` : ""}${type} ${rent ? "for rent" : "for sale"}${hasPrice ? ` ${shortPrice(n, lang)}` : ""}`;
  const title = Array.from(t).slice(0, 20).join("");

  const state = zhPlace((l.state || "").trim());
  const lines =
    lang === "zh"
      ? [`${emoji} ${place.split(", ")[0] ? zhPlace(place.split(", ")[0]) : ""} ${type}`.trim(),
         facts ? `💰 ${facts.replaceAll(" · ", " ｜ ")}` : "",
         state ? `📍 ${state}${city && city !== state ? ` · ${city}` : ""}` : "",
         `有意了解/看房，欢迎私信咨询 · 编号 ${l.id}`]
      : [`${emoji} ${head}`, facts ? `💰 ${facts}` : "", state ? `📍 ${[l.city, l.state].filter(Boolean).join(", ")}` : "",
         lang === "ms" ? `Berminat? Mesej saya · No. ${l.id}` : `Interested? Message me · Ref ${l.id}`];
  if (opts.includeContact) lines.push([wa, ren].filter(Boolean).join(" · "));
  const tags = (lang === "zh"
    ? ["#怡保房产", "#霹雳房产", "#马来西亚房产", rent ? "#出租" : "#出售", ({ Industrial: "#工厂", Land: "#土地", Commercial: "#商业房产", Residential: "#住宅" } as Record<string, string>)[l.category ?? ""] ?? ""]
    : hashtagsFor(l, lang).slice(0, 5)
  ).filter(Boolean).join(" ");
  const body = [...lines.filter(Boolean), "", tags].join("\n");
  return { title, body, full: `${title}\n\n${body}` };
}
