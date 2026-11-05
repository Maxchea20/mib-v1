import { BRAND } from "./brand";
import { fill, pathFor, t, type Lang } from "./i18n";
import type { PublicListing, PublicPhoto } from "./data";

const COVER_TYPE: Record<string, string> = {
  Residential: "Front House",
  Commercial: "Shop Front",
  Industrial: "Factory Front",
  Land: "Front View",
};

export function formatPrice(
  listing: Pick<PublicListing, "price" | "purpose">,
  lang: Lang
): string {
  if (listing.price === null || listing.price === undefined) return "";
  const amount = `RM ${Number(listing.price).toLocaleString("en-MY")}`;
  return listing.purpose === "For Rent"
    ? `${amount} ${t(lang).perMonth}`
    : amount;
}

export function locationLine(
  listing: Pick<PublicListing, "area" | "city" | "state">
): string {
  const parts: string[] = [];
  for (const raw of [listing.area, listing.city, listing.state]) {
    const v = (raw ?? "").trim();
    if (v && !parts.some((p) => p.toLowerCase() === v.toLowerCase())) {
      parts.push(v);
    }
  }
  return parts.join(", ");
}

export function sortPhotos(
  listing: Pick<PublicListing, "category">,
  photos: PublicPhoto[]
): PublicPhoto[] {
  const cover = COVER_TYPE[listing.category ?? ""] ?? "Front House";
  return photos
    .filter((p) => Boolean(p.image_url))
    .sort((a, b) => {
      if (a.photo_type === cover && b.photo_type !== cover) return -1;
      if (b.photo_type === cover && a.photo_type !== cover) return 1;
      return a.id - b.id;
    });
}

export function listingUrl(id: number, lang: Lang = "en"): string {
  return `${BRAND.siteUrl}${pathFor(lang, `/listing/${id}`)}`;
}

export function whatsappMessage(listing: PublicListing, lang: Lang): string {
  return fill(t(lang).waMessage, {
    title: listing.title ?? "",
    price: formatPrice(listing, lang),
    url: listingUrl(listing.id, lang),
  });
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function titleCase(value: string | null | undefined): string {
  return (value ?? "").replace(/_/g, " ").trim();
}

/** "21700" -> "21,700 sqft". Text that already has a unit is left alone. */
export function sizeText(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  if (/^[\d,.\s]+$/.test(v)) {
    const n = Number(v.replace(/[,\s]/g, ""));
    if (Number.isFinite(n)) return `${n.toLocaleString("en-MY")} sqft`;
  }
  return v;
}
