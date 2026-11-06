import type { PublicListing } from "./data";

/*
| Search landing pages: one page per thing people search for, filled with the
| live public listings that match. Nothing is stored twice; the page asks the
| same public view as every other page.
|
|   houses-for-sale-ipoh      Residential, for sale, city Ipoh
|   factories-for-sale-ipoh   Industrial, for sale, city Ipoh, factory sub type
|   industrial-land-perak     Land (industrial land type), state Perak
|   commercial-property-ipoh  Commercial, city Ipoh
|   land-for-sale-perak       Land, for sale, state Perak
*/

export type LandingConfig = {
  slug: string;
  category: "Residential" | "Commercial" | "Industrial" | "Land";
  purpose?: "For Sale" | "For Rent";
  city?: string;
  state?: string;
  /** Matched against the property type, sub type and title. */
  typeMatch?: RegExp;
  /** Matched against the land type only. */
  landTypeMatch?: RegExp;
};

export const LANDINGS: LandingConfig[] = [
  { slug: "houses-for-sale-ipoh", category: "Residential", purpose: "For Sale", city: "ipoh" },
  { slug: "factories-for-sale-ipoh", category: "Industrial", purpose: "For Sale", city: "ipoh", typeMatch: /factory|kilang|工厂/i },
  { slug: "industrial-land-perak", category: "Land", state: "perak", landTypeMatch: /industr/i },
  { slug: "commercial-property-ipoh", category: "Commercial", city: "ipoh" },
  { slug: "land-for-sale-perak", category: "Land", purpose: "For Sale", state: "perak" },
];

export const LANDING_SLUGS = LANDINGS.map((l) => l.slug);

export function landingFromSlug(slug: string): LandingConfig | null {
  return LANDINGS.find((l) => l.slug === slug) ?? null;
}

const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();

export function matchesLanding(l: PublicListing, c: LandingConfig): boolean {
  if (l.category !== c.category) return false;
  if (c.purpose && l.purpose !== c.purpose) return false;
  if (c.city && norm(l.city) !== c.city) return false;
  if (c.state && norm(l.state) !== c.state) return false;
  if (c.typeMatch) {
    const hay = [l.property_type, l.property_sub_type, l.title].filter(Boolean).join(" ");
    if (!c.typeMatch.test(hay)) return false;
  }
  if (c.landTypeMatch && !c.landTypeMatch.test(l.land_type ?? "")) return false;
  return true;
}

/** Areas that have matching listings, most listings first. */
export function areasOf(listings: PublicListing[]): string[] {
  const counts = new Map<string, number>();
  for (const l of listings) {
    const a = (l.area ?? "").trim();
    if (a) counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([a]) => a);
}
