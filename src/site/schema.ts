import { BRAND } from "./brand";
import type { PublicListing } from "./data";
import { HOME_SEO } from "./seo";
import type { Lang } from "./i18n";

/*
|--------------------------------------------------------------------------
| STRUCTURED DATA (Schema.org JSON-LD), pure functions
|--------------------------------------------------------------------------
|
| Builders for the machine-readable description of the business, the site,
| breadcrumbs and each listing. Only facts that are already public on the
| page are used. No street address is ever published: listings show an
| approximate area only, exactly like the page.
|
*/

const IN_LANGUAGE: Record<Lang, string> = { en: "en", ms: "ms", zh: "zh-CN" };

export const AGENT_ID = `${BRAND.siteUrl}/#agent`;
export const WEBSITE_ID = `${BRAND.siteUrl}/#website`;

/** JSON for a <script type="application/ld+json"> tag ("<" escaped). */
export function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** The business: a registered estate agent based in Ipoh, serving Perak. */
export function agentSchema(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": AGENT_ID,
    name: BRAND.name,
    description: HOME_SEO[lang].description,
    url: BRAND.siteUrl,
    logo: `${BRAND.siteUrl}${BRAND.iconSrc}`,
    image: `${BRAND.siteUrl}${BRAND.ogImage}`,
    telephone: `+${BRAND.whatsapp}`,
    address: { "@type": "PostalAddress", addressLocality: "Ipoh", addressRegion: "Perak", addressCountry: "MY" },
    areaServed: BRAND.serviceAreas.map((name) => ({ "@type": name === "Perak" ? "AdministrativeArea" : "City", name })),
    knowsLanguage: ["en", "ms", "zh"],
    identifier: BRAND.renNumber
      ? { "@type": "PropertyValue", name: "Registered Estate Negotiator (REN)", value: BRAND.renNumber }
      : undefined,
    sameAs: BRAND.sameAs.length > 0 ? BRAND.sameAs : undefined,
  };
}

export function websiteSchema(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: BRAND.siteUrl,
    name: BRAND.name,
    inLanguage: IN_LANGUAGE[lang],
    publisher: { "@id": AGENT_ID },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

/** "1,650 sqft" -> { value: 1650, unit: "FTK" }; unknown units give null. */
export function parseFloorSize(text: string | null | undefined): { value: number; unit: "FTK" | "MTK" } | null {
  const m = /^\s*([\d,]+(?:\.\d+)?)\s*(sq\.?\s?ft|sqft|square\s?feet|sf|sq\.?\s?m|sqm|m2|m²)\b/i.exec(text ?? "");
  if (!m) return null;
  const value = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, unit: /ft|feet|sf/i.test(m[2]) ? "FTK" : "MTK" };
}

/** The Schema.org type that best describes what is for sale or rent. */
export function accommodationType(l: Pick<PublicListing, "category" | "property_type">): string {
  if (l.category === "Land") return "Place";
  if (l.category === "Residential") {
    return /condo|apartment|flat/i.test(l.property_type ?? "") ? "Apartment" : "House";
  }
  return "Accommodation";
}

export function listingSchema(
  l: PublicListing,
  o: { lang: Lang; url: string; images: string[]; place: string; description: string }
) {
  const rent = l.purpose === "For Rent";
  const floor = parseFloorSize(l.built_up);
  const beds = (l.bedrooms ?? 0) > 0 ? l.bedrooms : undefined;
  const baths = (l.bathrooms ?? 0) > 0 ? l.bathrooms : undefined;
  const hasPrice = typeof l.price === "number" && l.price > 0;
  const available = l.status === "Booked" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock";

  const about = {
    "@type": accommodationType(l),
    name: l.title ?? undefined,
    // Approximate area only: city / state, never a street address.
    address: {
      "@type": "PostalAddress",
      addressLocality: (l.city || l.area || "").trim() || undefined,
      addressRegion: (l.state ?? "").trim() || undefined,
      addressCountry: "MY",
    },
    floorSize: floor ? { "@type": "QuantitativeValue", value: floor.value, unitCode: floor.unit } : undefined,
    numberOfBedrooms: beds ?? undefined,
    numberOfBathroomsTotal: baths ?? undefined,
  };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: l.title ?? undefined,
    url: o.url,
    description: o.description || undefined,
    image: o.images.length > 0 ? o.images.slice(0, 5) : undefined,
    inLanguage: IN_LANGUAGE[o.lang],
    isPartOf: { "@id": WEBSITE_ID },
    provider: { "@type": "RealEstateAgent", "@id": AGENT_ID, name: BRAND.name },
    about,
    offers: hasPrice
      ? {
          "@type": "Offer",
          url: o.url,
          price: l.price,
          priceCurrency: "MYR",
          availability: available,
          businessFunction: rent
            ? "http://purl.org/goodrelations/v1#LeaseOut"
            : "http://purl.org/goodrelations/v1#Sell",
          priceSpecification: rent
            ? { "@type": "UnitPriceSpecification", price: l.price, priceCurrency: "MYR", unitText: "MONTH" }
            : undefined,
          seller: { "@id": AGENT_ID },
        }
      : undefined,
  };
}
