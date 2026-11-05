import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/site/Gallery";
import ShareButtons from "@/components/site/ShareButtons";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { BRAND } from "@/site/brand";
import { getSiteContext } from "@/site/context";
import { slugFromCategory } from "@/site/categories";
import { getPublicListing } from "@/site/data";
import {
  formatPrice,
  listingUrl,
  locationLine,
  sizeText,
  sortPhotos,
  titleCase,
  whatsappMessage,
  whatsappUrl,
} from "@/site/format";
import { t } from "@/site/i18n";

type Props = { params: Promise<{ id: string }> };

function parseId(raw: string): number {
  return /^\d{1,12}$/.test(raw) ? Number(raw) : NaN;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = await getPublicListing(parseId(id));

  if (!found) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const { listing, photos } = found;
  const { lang } = await getSiteContext();
  const price = formatPrice(listing, lang);
  const place = locationLine(listing);
  const title = `${listing.title ?? "Property"}${place ? `, ${place}` : ""}`;
  const description =
    (listing.headline || listing.description || `${listing.title} ${price}`)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 200);
  const image = sortPhotos(listing, photos)[0]?.image_url ?? undefined;
  const url = listingUrl(listing.id);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${price}`,
      description,
      url,
      siteName: BRAND.name,
      type: "website",
      images: [{ url: image ?? BRAND.ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${price}`,
      description,
      images: [image ?? BRAND.ogImage],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const found = await getPublicListing(parseId(id));

  if (!found) notFound();

  const { listing, photos } = found;
  const { lang, base } = await getSiteContext();
  const text = t(lang);
  const images = sortPhotos(listing, photos).map((p) => p.image_url as string);
  const price = formatPrice(listing, lang);
  const place = locationLine(listing);
  const message = whatsappMessage(listing, lang);
  const url = listingUrl(listing.id);

  const rows: [string, string | number | null][] = [
    [text.propertyType, [listing.property_sub_type || listing.property_type, listing.unit_type].filter(Boolean).join(" · ") || null],
    [text.bedrooms, (listing.bedrooms ?? 0) > 0 ? listing.bedrooms : null],
    [text.bathrooms, (listing.bathrooms ?? 0) > 0 ? listing.bathrooms : null],
    [text.builtUp, sizeText(listing.built_up)],
    [text.landSize, listing.land_size],
    [text.tenure, titleCase(listing.tenure) || null],
    [text.titleType, titleCase(listing.title_type) || null],
    [text.landType, titleCase(listing.land_type) || null],
    [text.furnishing, titleCase(listing.furnishing) || null],
    [text.parking, (listing.parking_spaces ?? 0) > 0 ? listing.parking_spaces : null],
    [text.facing, titleCase(listing.facing) || null],
  ];
  const visibleRows = rows.filter(([, v]) => v !== null && v !== "");
  const highlights = (listing.highlights ?? []).filter((h) => h && h.trim());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    url,
    description: listing.headline || listing.description || undefined,
    image: images.slice(0, 5),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "MYR",
      availability:
        listing.status === "Booked"
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
    },
    contentLocation: place || undefined,
  };

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-24 pt-6 sm:px-6 lg:pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-[var(--mp-muted)]">
        <Link href={base || "/"} className="font-semibold text-[var(--mp-accent)]">{text.breadcrumbAll}</Link>
        {slugFromCategory(listing.category) && (
          <>
            <span>/</span>
            <Link href={`${base}/${slugFromCategory(listing.category)}`} className="font-semibold text-[var(--mp-accent)]">
              {{ Residential: text.residential, Commercial: text.commercial, Industrial: text.industrial, Land: text.land }[listing.category as "Residential"]}
            </Link>
          </>
        )}
                {place && (<><span>/</span><span>{place}</span></>)}
      </nav>

      <Gallery
        images={images}
        alt={listing.title ?? ""}
        labels={{ prev: text.prevPhoto, next: text.nextPhoto, counter: text.photoOf }}
      />

      <div className="flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 flex-[999_1_540px] flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2">
              <span className="rounded-full border border-[var(--mp-accent)] bg-[var(--mp-paper)] px-3 py-1.5 text-xs font-extrabold text-[var(--mp-accent)]">
                {listing.purpose === "For Rent" ? text.forRent : text.forSale}
              </span>
              {listing.status === "Booked" && (
                <span className="rounded-full bg-[var(--mp-accent)] px-3 py-1.5 text-xs font-extrabold text-[var(--mp-on-accent)]">{text.booked}</span>
              )}
            </div>
            <h1 className="mp-display text-3xl font-bold leading-tight sm:text-5xl">{listing.title}</h1>
            {place && <p className="text-base text-[var(--mp-muted)]">{place}</p>}
            <p className="mp-display text-3xl font-bold text-[var(--mp-accent)] lg:hidden">{price}</p>
          </div>

          {visibleRows.length > 0 && (
            <section className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6">
              <h2 className="mp-display text-xl font-bold">{text.details}</h2>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {visibleRows.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[13px] text-[var(--mp-muted)]">{label}</dt>
                    <dd className="mt-1 text-base font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(listing.description || highlights.length > 0) && (
            <section className="flex flex-col gap-3.5 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6">
              <h2 className="mp-display text-xl font-bold">{text.about}</h2>
              {listing.description && (
                <p className="whitespace-pre-line text-base leading-[1.7] text-[var(--mp-ink2)]">{listing.description}</p>
              )}
              {highlights.length > 0 && (
                <>
                  <h3 className="mt-2 text-base font-extrabold text-[var(--mp-accent)]">{text.highlights}</h3>
                  <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-normal text-[var(--mp-ink2)]">
                    {highlights.map((h) => (<li key={h}>{h}</li>))}
                  </ul>
                </>
              )}
            </section>
          )}

          {place && (
            <section className="flex flex-col gap-2 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6">
              <h2 className="mp-display text-xl font-bold">{text.location}</h2>
              <p className="text-base font-semibold">{place}</p>
              <p className="text-sm text-[var(--mp-muted)]">{text.locationNote}</p>
            </section>
          )}
        </div>

        <aside className="flex min-w-[280px] max-w-full flex-[1_1_320px] flex-col gap-4 lg:sticky lg:top-4 lg:max-w-[380px]">
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--mp-accent)] bg-[var(--mp-card)] p-6">
            <div className="hidden lg:block">
              <p className="text-[13px] text-[var(--mp-muted)]">{text.askingPrice}</p>
              <p className="mp-display mt-1 text-4xl font-bold text-[var(--mp-accent)]">{price}</p>
            </div>
            <a
              href={whatsappUrl(message)}
              className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]"
            >
              <WhatsAppIcon size={22} />
              {text.enquire}
            </a>
            <div className="rounded-[10px] bg-[var(--mp-paper)] p-3 text-[13px] leading-relaxed text-[var(--mp-muted)]">
              <span className="font-bold text-[var(--mp-ink)]">{text.messageOpens}</span>
              <br />
              {message}
            </div>
          </div>
          <ShareButtons url={url} title={listing.title ?? BRAND.name} labels={{ share: text.share, copy: text.copyLink, copied: text.copied }} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-[var(--mp-line)] bg-[var(--mp-card)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="flex-none">
          <p className="text-xs text-[var(--mp-muted)]">{text.askingPrice}</p>
          <p className="mp-display text-lg font-bold text-[var(--mp-accent)]">{price}</p>
        </div>
        <a
          href={whatsappUrl(message)}
          className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--mp-whatsapp)] text-[15px] font-extrabold text-[var(--mp-on-whatsapp)]"
        >
          <WhatsAppIcon size={20} />
          WhatsApp
        </a>
      </div>
    </main>
  );
}
