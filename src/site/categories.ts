import type { PublicListing } from "./data";
import type { Lang } from "./i18n";

/*
| The public site is split by category. Each category has its own page
| (/residential, /commercial, /industrial, /land) and, inside it, groups:
|   Residential -> property type (Bungalow / Semi-D / Terrace / Condo)
|   Land        -> land type (Residential / Commercial / Industrial / Agriculture)
|   Commercial, Industrial -> property sub type when set
*/

export const CATEGORIES = [
  { slug: "residential", category: "Residential" },
  { slug: "commercial", category: "Commercial" },
  { slug: "industrial", category: "Industrial" },
  { slug: "land", category: "Land" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function categoryFromSlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function slugFromCategory(category: string | null | undefined) {
  return CATEGORIES.find((c) => c.category === category)?.slug ?? null;
}

/** The sub-group a listing belongs to inside its category page. */
export function groupOf(listing: PublicListing): string | null {
  let value: string | null | undefined;

  if (listing.category === "Residential") {
    value = listing.property_type;
  } else if (listing.category === "Land") {
    value = listing.land_type;
  } else {
    value = listing.property_sub_type || listing.property_type;
  }

  const clean = (value ?? "").trim();
  return clean ? clean : null;
}

/** Groups with counts, most listings first. */
export function groupsOf(listings: PublicListing[]) {
  const counts = new Map<string, number>();

  for (const listing of listings) {
    const key = groupOf(listing);
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const GROUP_NAMES: Record<string, Partial<Record<Lang, string>>> = {
  "Bungalow / Villa": { ms: "Banglo / Vila", zh: "独立式洋房 / 别墅" },
  "Semi-Detached House": { ms: "Rumah Berkembar", zh: "半独立式住宅" },
  "Terrace / Link House": { ms: "Rumah Teres / Berangkai", zh: "排屋 / 连体屋" },
  Condominium: { ms: "Kondominium", zh: "共管公寓" },
  "Residential Land": { ms: "Tanah Kediaman", zh: "住宅用地" },
  "Commercial Land": { ms: "Tanah Komersial", zh: "商业用地" },
  "Industrial Land": { ms: "Tanah Perindustrian", zh: "工业用地" },
  "Agriculture Land": { ms: "Tanah Pertanian", zh: "农业用地" },
  "Agricultural Land": { ms: "Tanah Pertanian", zh: "农业用地" },
};

export function groupLabel(name: string, lang: Lang): string {
  return GROUP_NAMES[name]?.[lang] ?? name;
}
