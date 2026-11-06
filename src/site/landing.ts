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
  /** One or more MIB categories. */
  categories: ("Residential" | "Commercial" | "Industrial" | "Land")[];
  purpose?: "For Sale" | "For Rent";
  city?: string;
  state?: string;
  /** Matched against the property type, sub type and title. */
  typeMatch?: RegExp;
  /** Land category only: matched against the land type. */
  landTypeMatch?: RegExp;
  /** Industrial category only: matched against the property sub type. */
  subTypeMatch?: RegExp;
};

export const LANDINGS: LandingConfig[] = [
  { slug: "houses-for-sale-ipoh", categories: ["Residential"], purpose: "For Sale", city: "ipoh" },
  // MIB Industrial sub types: Factory, Warehouse, Cluster / Semi-D / Detached / Terrace factory, Industrial Land.
  { slug: "factories-for-sale-ipoh", categories: ["Industrial"], purpose: "For Sale", city: "ipoh", typeMatch: /factory|kilang|warehouse|gudang|工厂|仓库/i },
  // Industrial land is either a Land listing with the industrial land type,
  // or an Industrial listing whose sub type is "Industrial Land".
  { slug: "industrial-land-perak", categories: ["Land", "Industrial"], state: "perak", landTypeMatch: /industr/i, subTypeMatch: /industrial land|tanah perindustrian|工业用地/i },
  { slug: "commercial-property-ipoh", categories: ["Commercial"], city: "ipoh" },
  { slug: "land-for-sale-perak", categories: ["Land"], purpose: "For Sale", state: "perak" },
];

export const LANDING_SLUGS = LANDINGS.map((l) => l.slug);

export function landingFromSlug(slug: string): LandingConfig | null {
  return LANDINGS.find((l) => l.slug === slug) ?? null;
}

const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();

export function matchesLanding(l: PublicListing, c: LandingConfig): boolean {
  if (!l.category || !(c.categories as string[]).includes(l.category)) return false;
  if (c.purpose && l.purpose !== c.purpose) return false;
  if (c.city && norm(l.city) !== c.city) return false;
  if (c.state && norm(l.state) !== c.state) return false;
  if (c.typeMatch) {
    const hay = [l.property_type, l.property_sub_type, l.title].filter(Boolean).join(" ");
    if (!c.typeMatch.test(hay)) return false;
  }
  if (c.landTypeMatch || c.subTypeMatch) {
    const asLand = l.category === "Land" && c.landTypeMatch?.test(l.land_type ?? "");
    const asIndustrial = l.category === "Industrial" && c.subTypeMatch?.test(
      [l.property_sub_type, l.property_type].filter(Boolean).join(" ")
    );
    if (!asLand && !asIndustrial) return false;
  }
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
