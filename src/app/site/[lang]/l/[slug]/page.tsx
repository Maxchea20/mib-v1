import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingCard from "@/components/site/ListingCard";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { BRAND } from "@/site/brand";
import { requireLang } from "@/site/context";
import { getPhotosForListings, getPublicListings } from "@/site/data";
import { whatsappUrl } from "@/site/format";
import { basePath, fill, t } from "@/site/i18n";
import { LANDINGS, landingFromSlug, matchesLanding, placesOf, sortForLanding } from "@/site/landing";
import { landingCommon, landingText } from "@/site/landingText";
import { ct } from "@/site/costText";
import { alternatesFor, OG_LOCALE } from "@/site/seo";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Cached for 5 minutes, like listing pages, so the database is not hit on every visit.
export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

async function listingsFor(slug: string) {
  const cfg = landingFromSlug(slug);
  if (!cfg) return null;
  const fetched = await getPublicListings({
    category: cfg.categories.length === 1 ? cfg.categories[0] : undefined,
    purpose: cfg.purpose,
  });
  return { cfg, listings: sortForLanding(fetched.filter((l) => matchesLanding(l, cfg))) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const found = await listingsFor(slug);
  if (!found) return { title: "Not found", robots: { index: false, follow: false } };

  const lang = requireLang(rawLang);
  const text = landingText(slug, lang);
  const alt = alternatesFor(lang, `/${slug}`);

  return {
    title: text.metaTitle,
    description: text.metaDesc,
    alternates: alt,
    // A page with nothing on it is not worth a place in search results yet.
    robots: found.listings.length === 0 ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${text.metaTitle} | ${BRAND.name}`,
      description: text.metaDesc,
      url: alt.canonical,
      siteName: BRAND.name,
      locale: OG_LOCALE[lang],
      type: "website",
      images: [{ url: BRAND.ogImage, width: 1200, height: 630 }],
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { lang: rawLang, slug } = await params;
  const found = await listingsFor(slug);
  if (!found) notFound();

  const lang = requireLang(rawLang);
  const base = basePath(lang);
  const text = landingText(slug, lang);
  const c = landingCommon(lang);
  const site = t(lang);
  const costs = ct(lang);
  const { listings } = found;
  const photos = await getPhotosForListings(listings.map((l) => l.id));
  const areas = placesOf(listings);
  const canonical = alternatesFor(lang, `/${slug}`).canonical;

  const others = LANDINGS.filter((l) => l.slug !== slug);
  const tools = [
    { href: `${base}/calculators/housing-loan`, label: c.toolLoan },
    { href: `${base}/calculators/purchase-cost`, label: c.toolCosts },
    { href: `${base}/calculators/legal-fees`, label: c.toolLegal },
    { href: `${base}/calculators/rental-yield`, label: c.toolRental },
  ];
  void costs;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: site.breadcrumbAll, item: `${BRAND.siteUrl}${base || "/"}` },
        { "@type": "ListItem", position: 2, name: text.h1, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: text.h1,
      description: text.metaDesc,
      url: canonical,
      inLanguage: lang === "zh" ? "zh-CN" : lang,
      about: { "@type": "Place", name: "Perak, Malaysia" },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: listings.length,
        itemListElement: listings.slice(0, 20).map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${BRAND.siteUrl}${base}/listing/${l.id}`,
          name: l.title ?? undefined,
        })),
      },
    },
  ];

  const pill = "inline-flex min-h-10 items-center rounded-full border border-[var(--mp-line)] bg-[var(--mp-card)] px-4 text-sm font-bold hover:border-[var(--mp-accent)]";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="border-b border-[var(--mp-line)] bg-[linear-gradient(180deg,rgba(10,10,11,0.15),rgba(10,10,11,0.6))]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-[var(--mp-muted)]">
            <Link href={base || "/"} className="font-semibold text-[var(--mp-accent)] underline">{site.breadcrumbAll}</Link>
            <span>/</span>
            <span>{text.h1}</span>
          </nav>
          <h1 className="mp-display text-4xl font-bold sm:text-5xl">{text.h1}</h1>
          <p className="max-w-[760px] text-lg leading-relaxed text-[var(--mp-ink2)]">{text.intro}</p>
          <p className="text-[var(--mp-muted)]" data-testid="count">{fill(c.matching, { n: listings.length })}</p>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 pb-14 pt-8 sm:px-6">
        {areas.length > 0 && (
          <section aria-labelledby="areas" className="flex flex-col gap-3">
            <h2 id="areas" className="text-sm font-extrabold uppercase tracking-wide text-[var(--mp-accent)]">{c.areasTitle}</h2>
            <ul className="flex flex-wrap gap-2">
              {areas.map((a) => (
                <li key={a} className="rounded-full border border-[var(--mp-line)] bg-[var(--mp-card)] px-4 py-2 text-sm font-semibold">{a}</li>
              ))}
            </ul>
          </section>
        )}

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-8 text-center sm:p-10" data-testid="empty">
            <p className="text-lg font-bold">{c.emptyTitle}</p>
            <p className="mx-auto mt-2 max-w-[560px] text-[var(--mp-muted)]">{c.emptyBody}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} photos={photos.filter((p) => p.property_id === listing.id)} lang={lang} base={base} />
            ))}
          </div>
        )}

        <section aria-labelledby="cta" className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--mp-accent)] bg-[var(--mp-card)] p-6 sm:p-8">
          <h2 id="cta" className="mp-display text-2xl font-bold">{c.ctaTitle}</h2>
          <p className="max-w-[620px] text-[var(--mp-ink2)]">{c.ctaBody}</p>
          <a
            href={whatsappUrl(fill(c.waMessage, { page: text.h1 }))}
            className="inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-5 text-base font-extrabold text-[var(--mp-on-whatsapp)]"
          >
            <WhatsAppIcon size={22} />
            {c.ctaButton}
          </a>
        </section>

        <section aria-labelledby="faq" className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6 sm:p-8">
          <h2 id="faq" className="mp-display text-2xl font-bold">{c.faqTitle}</h2>
          <div className="mt-4 flex flex-col divide-y divide-[var(--mp-line)]">
            {text.faq.map((f) => (
              <div key={f.q} className="py-4">
                <h3 className="text-base font-extrabold">{f.q}</h3>
                <p className="mt-1.5 leading-relaxed text-[var(--mp-ink2)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="tools" className="flex flex-col gap-3">
          <h2 id="tools" className="text-sm font-extrabold uppercase tracking-wide text-[var(--mp-accent)]">{c.toolsTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {tools.map((x) => <Link key={x.href} href={x.href} className={pill}>{x.label}</Link>)}
          </div>
        </section>

        <section aria-labelledby="more" className="flex flex-col gap-3">
          <h2 id="more" className="text-sm font-extrabold uppercase tracking-wide text-[var(--mp-accent)]">{c.moreTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={`${base}/${o.slug}`} className={pill}>{landingText(o.slug, lang).nav}</Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
