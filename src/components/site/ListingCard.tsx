import Link from "next/link";
import ThumbImg from "@/components/ThumbImg";
import type { PublicListing, PublicPhoto } from "@/site/data";
import { formatPrice, locationLine, sizeText, sortPhotos } from "@/site/format";
import { t, type Lang } from "@/site/i18n";

export default function ListingCard({
  listing,
  photos,
  lang,
  base,
}: {
  listing: PublicListing;
  photos: PublicPhoto[];
  lang: Lang;
  base: string;
}) {
  const text = t(lang);
  const cover = sortPhotos(listing, photos)[0]?.image_url ?? null;
  const hasRooms = (listing.bedrooms ?? 0) > 0 || (listing.bathrooms ?? 0) > 0;
  const size =
    listing.category === "Land"
      ? listing.land_size
      : sizeText(listing.built_up) || listing.land_size;

  return (
    <Link
      href={`${base}/listing/${listing.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] transition-colors hover:border-[var(--mp-accent)]"
    >
      <div className="relative aspect-[16/10] bg-[var(--mp-accent-soft)]">
        {cover ? (
          <ThumbImg src={cover} alt={[listing.title, locationLine(listing)].filter(Boolean).join(", ")} width={800} height={500} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <span className="absolute left-3 top-3 rounded-full border border-[var(--mp-accent)] bg-[var(--mp-paper)] px-3 py-1 text-xs font-extrabold text-[var(--mp-accent)]">
          {listing.purpose === "For Rent" ? text.forRent : text.forSale}
        </span>
        {listing.status === "Booked" && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--mp-accent)] px-3 py-1 text-xs font-extrabold text-[var(--mp-on-accent)]">
            {text.booked}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-5">
        <p className="mp-display text-2xl font-bold text-[var(--mp-accent)]">{formatPrice(listing, lang)}</p>
        <h3 className="text-[17px] font-bold leading-snug">{listing.title}</h3>
        <p className="text-sm text-[var(--mp-muted)]">{locationLine(listing)}</p>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--mp-line)] pt-3 text-sm font-semibold">
          {hasRooms && (
            <>
              {(listing.bedrooms ?? 0) > 0 && <span>{listing.bedrooms} {text.bed}</span>}
              {(listing.bathrooms ?? 0) > 0 && <span>{listing.bathrooms} {text.bath}</span>}
            </>
          )}
          {size && <span>{size}</span>}
        </div>
      </div>
    </Link>
  );
}
