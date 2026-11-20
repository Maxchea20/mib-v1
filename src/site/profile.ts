import { BRAND } from "./brand";
import { AGENT_ID } from "./schema";
import { pathFor, type Lang } from "./i18n";

/*
|--------------------------------------------------------------------------
| AGENT PROFILE (pure functions, unit-tested)
|--------------------------------------------------------------------------
|
| The owner writes the profile once in MIB (My profile). The website reads the
| published copy through the public_agent_profile view. Everything here is
| plain text: it is shown as text (never as HTML) and cleaned before saving.
|
*/

export type AgentProfile = {
  display_name: string | null;
  headline_en: string | null;
  headline_ms: string | null;
  headline_zh: string | null;
  bio_en: string | null;
  bio_ms: string | null;
  bio_zh: string | null;
  photo_url: string | null;
  specialisations: string[] | null;
  areas: string[] | null;
  languages: string[] | null;
  since_year: number | null;
};

export const LIMITS = { name: 80, headline: 140, bio: 2500, item: 40, items: 12 } as const;

const oneLine = (v: unknown, max: number): string =>
  typeof v === "string" ? Array.from(v.replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim()).slice(0, max).join("") : "";

/** Text with paragraphs: line breaks are kept (at most one blank line), HTML characters removed. */
const paragraphs = (v: unknown, max: number): string => {
  if (typeof v !== "string") return "";
  const t = v
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/g, " ")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return Array.from(t).slice(0, max).join("").trim();
};

/** "Factories, Land ; Industrial" or an array -> a short list of unique, trimmed items. */
export function cleanList(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;\n]/) : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of raw) {
    const t = oneLine(r, LIMITS.item);
    const k = t.toLowerCase();
    if (t && !seen.has(k)) {
      seen.add(k);
      out.push(t);
    }
    if (out.length >= LIMITS.items) break;
  }
  return out;
}

export function cleanYear(v: unknown, now = new Date().getFullYear()): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isInteger(n) && n >= 1980 && n <= now ? n : null;
}

/** Only an https address is kept for the photo (it is shown in an <img>). */
export function cleanPhotoUrl(v: unknown): string | null {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export type ProfileInput = Partial<Record<keyof AgentProfile, unknown>> & { is_public?: unknown };

/** The cleaned row that is saved. Empty text becomes null so empty fields stay hidden on the website. */
export function cleanProfile(input: ProfileInput, now = new Date().getFullYear()) {
  const text = (v: unknown, max: number) => oneLine(v, max) || null;
  const long = (v: unknown) => paragraphs(v, LIMITS.bio) || null;
  return {
    display_name: text(input.display_name, LIMITS.name),
    headline_en: text(input.headline_en, LIMITS.headline),
    headline_ms: text(input.headline_ms, LIMITS.headline),
    headline_zh: text(input.headline_zh, LIMITS.headline),
    bio_en: long(input.bio_en),
    bio_ms: long(input.bio_ms),
    bio_zh: long(input.bio_zh),
    photo_url: cleanPhotoUrl(input.photo_url),
    specialisations: cleanList(input.specialisations),
    areas: cleanList(input.areas),
    languages: cleanList(input.languages),
    since_year: cleanYear(input.since_year, now),
    is_public: input.is_public === true,
  };
}

/** Is there enough to show a profile page? A name and at least one bio. */
export function isShowable(p: AgentProfile | null | undefined): p is AgentProfile {
  return Boolean(p && p.display_name && (p.bio_en || p.bio_ms || p.bio_zh));
}

/** The text for a language, falling back to English, then to any other language. */
export function pickText(p: AgentProfile, kind: "headline" | "bio", lang: Lang): string {
  const get = (l: Lang) => (p[`${kind}_${l}` as keyof AgentProfile] as string | null) ?? "";
  return get(lang) || get("en") || get("ms") || get("zh") || "";
}

/** Whole years since the start year (null when unknown). */
export function yearsSince(since: number | null | undefined, now = new Date().getFullYear()): number | null {
  if (!since || since > now) return null;
  return now - since;
}

/** The person: a real estate agent working for the business. Only fields that are filled in. */
export function personSchema(p: AgentProfile, lang: Lang) {
  const bio = pickText(p, "bio", lang);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BRAND.siteUrl}/about#person`,
    name: p.display_name,
    jobTitle: pickText(p, "headline", lang) || undefined,
    description: bio ? bio.split("\n")[0].slice(0, 300) : undefined,
    image: p.photo_url ?? undefined,
    url: `${BRAND.siteUrl}${pathFor(lang, "/about")}`.replace(/\/$/, ""),
    worksFor: { "@id": AGENT_ID },
    knowsLanguage: p.languages && p.languages.length > 0 ? p.languages : undefined,
    knowsAbout: p.specialisations && p.specialisations.length > 0 ? p.specialisations : undefined,
    areaServed: p.areas && p.areas.length > 0 ? p.areas : undefined,
    identifier: BRAND.renNumber ? { "@type": "PropertyValue", name: "Registered Estate Negotiator (REN)", value: BRAND.renNumber } : undefined,
    sameAs: BRAND.sameAs.length > 0 ? BRAND.sameAs : undefined,
  };
}

/* ----------------------------------------------------------------- words */

const EN = {
  nav: "About",
  title: "About",
  metaDescription: "Meet {name}, a registered estate negotiator in Ipoh, Perak. Industrial, commercial, land and residential property.",
  reg: "Registered Estate Negotiator (REN)",
  agency: "Agency",
  specialises: "Specialises in",
  areas: "Areas",
  languages: "Languages",
  since: "In property since {year}",
  years: "{n} years in property",
  whatsapp: "Message {first} on WhatsApp",
  whatsappMsg: "Hi {first}, I found your profile on maxproperty.my. ",
  browse: "Browse listings",
  google: "Find us on Google",
};
const MS: typeof EN = {
  nav: "Tentang",
  title: "Tentang",
  metaDescription: "Kenali {name}, ejen harta tanah berdaftar (REN) di Ipoh, Perak. Hartanah perindustrian, komersial, tanah dan kediaman.",
  reg: "Perunding Harta Tanah Berdaftar (REN)",
  agency: "Agensi",
  specialises: "Pakar dalam",
  areas: "Kawasan",
  languages: "Bahasa",
  since: "Dalam bidang hartanah sejak {year}",
  years: "{n} tahun dalam bidang hartanah",
  whatsapp: "Mesej {first} di WhatsApp",
  whatsappMsg: "Hi {first}, saya jumpa profil anda di maxproperty.my. ",
  browse: "Lihat senarai hartanah",
  google: "Cari kami di Google",
};
const ZH: typeof EN = {
  nav: "关于我",
  title: "关于我",
  metaDescription: "认识 {name}，霹雳怡保的注册房地产经纪（REN）。工业、商业、土地与住宅房产。",
  reg: "注册房地产经纪（REN）",
  agency: "公司",
  specialises: "专长",
  areas: "服务地区",
  languages: "语言",
  since: "{year} 年起从事房地产",
  years: "从事房地产 {n} 年",
  whatsapp: "WhatsApp 联系 {first}",
  whatsappMsg: "你好 {first}，我在 maxproperty.my 看到了你的资料。",
  browse: "浏览房源",
  google: "在 Google 上找到我们",
};

export const profileText = (lang: Lang) => (lang === "ms" ? MS : lang === "zh" ? ZH : EN);

export const fillText = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** First word of the name, used in the WhatsApp button ("Max"). Falls back to the brand. */
export function firstName(name: string | null | undefined): string {
  const f = (name ?? "").trim().split(/\s+/)[0];
  return f || BRAND.name;
}
