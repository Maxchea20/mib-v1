import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListingCard from "@/components/site/ListingCard";
import { BRAND } from "@/site/brand";
import { categoryFromSlug, groupLabel, groupOf, groupsOf } from "@/site/categories";
import { getSiteContext } from "@/site/context";
import { cleanFilters, getPhotosForListings, getPublicListings } from "@/site/data";
import { fill, t, type Lang } from "@/site/i18n";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function label(category: string, lang: Lang): string {
  const text = t(lang);
  return (
    {
      Residential: text.residential,
      Commercial: text.commercial,
      Industrial: text.industrial,
      Land: text.land,
    } as Record<string, string>
  )[category] ?? category;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = categoryFromSlug(slug);
  if (!cat) return { title: "Not found", robots: { index: false, follow: false } };

  const { lang } = await getSiteContext();
  const title = fill(t(lang).categoryPage, { category: label(cat.category, lang) });

  return {
    title,
    description: `${title}. ${BRAND.tagline}`,
    alternates: { canonical: `${BRAND.siteUrl}/${cat.slug}` },
    openGraph: { title: `${title} | ${BRAND.name}`, url: `${BRAND.siteUrl}/${cat.slug}`, siteName: BRAND.name, type: "website" },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const cat = categoryFromSlug(slug);
  if (!cat) notFound();

  const { lang, base } = await getSiteContext();
  const text = t(lang);
  const query = await searchParams;
  const filters = cleanFilters({ purpose: query.purpose });
  const rawType = Array.isArray(query.type) ? query.type[0] : query.type;
  const type = rawType ? rawType.slice(0, 80) : "";

  // Groups are counted for the chosen purpose, before the type filter.
  const inCategory = await getPublicListings({ category: cat.category, purpose: filters.purpose });
  const groups = groupsOf(inCategory);
  const listings = type ? inCategory.filter((l) => groupOf(l) === type) : inCategory;
  const photos = await getPhotosForListings(listings.map((l) => l.id));

  const href = (purpose?: string, groupName?: string) => {
    const params = new URLSearchParams();
    if (purpose) params.set("purpose", purpose);
    if (groupName) params.set("type", groupName);
    const qs = params.toString();
    return `${base}/${cat.slug}${qs ? `?${qs}` : ""}`;
  };

  const pill = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold ${
      active
        ? "border-[var(--mp-accent)] bg-[var(--mp-accent)] text-white"
        : "border-[var(--mp-line)] bg-[var(--mp-card)] text-[var(--mp-ink)] hover:bg-[var(--mp-accent-soft)]"
    }`;

  return (
    <>
      <section className="bg-[var(--mp-accent)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-[#BFE3D6]">
            <Link href={base || "/"} className="font-semibold underline">{text.breadcrumbAll}</Link>
            <span>/</span>
            <span>{label(cat.category, lang)}</span>
          </nav>
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            {fill(text.categoryPage, { category: label(cat.category, lang) })}
          </h1>
          <p className="text-[#E3F2EC]">{fill(text.resultsCount, { n: listings.length })}</p>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-14 pt-8 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label={text.filterLooking}>
            <Link href={href(undefined, type || undefined)} className={pill(!filters.purpose)}>{text.allPurposes}</Link>
            <Link href={href("For Sale", type || undefined)} className={pill(filters.purpose === "For Sale")}>{text.filterBuy}</Link>
            <Link href={href("For Rent", type || undefined)} className={pill(filters.purpose === "For Rent")}>{text.filterRent}</Link>
          </div>

          {groups.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label={text.groupBy}>
              <Link href={href(filters.purpose)} className={pill(!type)}>{text.allTypes} ({inCategory.length})</Link>
              {groups.map((g) => (
                <Link key={g.name} href={href(filters.purpose, g.name)} className={pill(type === g.name)}>
                  {groupLabel(g.name, lang)} ({g.count})
                </Link>
              ))}
            </div>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-10 text-center">
            <p className="text-lg font-bold">{text.empty}</p>
            <p className="mt-2 text-[var(--mp-muted)]">{text.emptyHint}</p>
            {(filters.purpose || type) && (
              <Link href={`${base}/${cat.slug}`} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--mp-accent)] px-5 font-bold text-[var(--mp-accent)]">
                {text.clearFilters}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                photos={photos.filter((p) => p.property_id === listing.id)}
                lang={lang}
                base={base}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
