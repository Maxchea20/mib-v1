import Link from "next/link";
import { redirect } from "next/navigation";
import ListingCard from "@/components/site/ListingCard";
import { CATEGORIES, slugFromCategory } from "@/site/categories";
import { cleanFilters, getPhotosForListings, getPublicListings } from "@/site/data";
import { getSiteContext } from "@/site/context";
import { countText, fill, t, type Lang } from "@/site/i18n";

const PER_SECTION = 3;

function categoryLabel(category: string, lang: Lang): string {
  const text = t(lang);
  const map: Record<string, string> = {
    Residential: text.residential,
    Commercial: text.commercial,
    Industrial: text.industrial,
    Land: text.land,
  };
  return map[category] ?? category;
}

export default async function SiteHome({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang, base } = await getSiteContext();
  const text = t(lang);
  const filters = cleanFilters(await searchParams);
  const action = base || "/";

  // The hero search sends a category: take the visitor to that category page.
  if (filters.category) {
    const slug = slugFromCategory(filters.category);
    if (slug) {
      const qs = filters.purpose ? `?purpose=${encodeURIComponent(filters.purpose)}` : "";
      redirect(`${base}/${slug}${qs}`);
    }
  }

  const all = await getPublicListings({ purpose: filters.purpose });

  const sections = CATEGORIES.map((c) => ({
    ...c,
    listings: all.filter((l) => l.category === c.category),
  }));

  const shown = sections.flatMap((s) => s.listings.slice(0, PER_SECTION));
  const photos = await getPhotosForListings(shown.map((l) => l.id));

  const purposeQs = filters.purpose ? `?purpose=${encodeURIComponent(filters.purpose)}` : "";
  const select =
    "h-12 rounded-[10px] border border-[var(--mp-line-strong)] bg-[var(--mp-paper)] px-3 text-base text-[var(--mp-ink)]";

  return (
    <>
      <section className="border-b border-[var(--mp-line)] bg-[linear-gradient(180deg,rgba(10,10,11,0.15),rgba(10,10,11,0.6))]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-[72px]">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--mp-accent)]">{text.heroKicker}</p>
          <h1 className="mp-display max-w-[780px] text-4xl font-bold leading-[1.08] sm:text-6xl">{text.heroTitle}</h1>
          <p className="max-w-[620px] text-lg leading-relaxed text-[var(--mp-ink2)]">{text.heroSub}</p>

          <form action={action} method="get" className="flex max-w-[860px] flex-wrap items-end gap-3 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-[var(--mp-ink)]">
            <label className="flex min-w-[170px] flex-1 flex-col gap-1.5 text-[13px] font-bold text-[var(--mp-muted)]">
              {text.filterLooking}
              <select name="purpose" defaultValue={filters.purpose ?? ""} className={select}>
                <option value="">{text.filterAny}</option>
                <option value="For Sale">{text.filterBuy}</option>
                <option value="For Rent">{text.filterRent}</option>
              </select>
            </label>
            <label className="flex min-w-[170px] flex-1 flex-col gap-1.5 text-[13px] font-bold text-[var(--mp-muted)]">
              {text.filterType}
              <select name="category" defaultValue="" className={select}>
                <option value="">{text.filterAnyType}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.category}>{categoryLabel(c.category, lang)}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-12 rounded-[10px] bg-[var(--mp-accent)] px-8 text-base font-extrabold text-[var(--mp-on-accent)]">
              {text.filterSearch}
            </button>
          </form>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 pb-6 pt-12 sm:px-6">
        <section aria-labelledby="browse" className="flex flex-col gap-4">
          <h2 id="browse" className="mp-display text-2xl font-bold">{text.browseByCategory}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sections.map((s) => (
              <Link
                key={s.slug}
                href={`${base}/${s.slug}${purposeQs}`}
                className="flex flex-col gap-1 rounded-2xl border border-[var(--mp-line)] border-t-[3px] border-t-[var(--mp-accent)] bg-[var(--mp-card)] p-5 transition-colors hover:bg-[#1B1B1E]"
              >
                <span className="mp-display text-xl font-bold">{categoryLabel(s.category, lang)}</span>
                <span className="text-sm text-[var(--mp-muted)]">{countText(lang, s.listings.length)}</span>
              </Link>
            ))}
          </div>
        </section>

        {all.length === 0 && (
          <div className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-10 text-center">
            <p className="text-lg font-bold">{text.empty}</p>
            <p className="mt-2 text-[var(--mp-muted)]">{text.emptyHint}</p>
            {filters.purpose && (
              <Link href={action} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--mp-accent)] px-5 font-bold text-[var(--mp-accent)]">
                {text.clearFilters}
              </Link>
            )}
          </div>
        )}

        {sections
          .filter((s) => s.listings.length > 0)
          .map((s) => (
            <section key={s.slug} aria-label={categoryLabel(s.category, lang)} className="flex flex-col gap-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="mp-display text-3xl font-bold">{categoryLabel(s.category, lang)}</h2>
                <Link href={`${base}/${s.slug}${purposeQs}`} className="text-[15px] font-bold text-[var(--mp-accent)] underline">
                  {fill(text.viewAllN, { n: s.listings.length })}
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {s.listings.slice(0, PER_SECTION).map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    photos={photos.filter((p) => p.property_id === listing.id)}
                    lang={lang}
                    base={base}
                  />
                ))}
              </div>
            </section>
          ))}
      </main>

      <section className="mx-auto max-w-[1200px] px-4 pb-14 pt-12 sm:px-6">
        <div className="flex flex-col gap-6 rounded-[20px] border border-[var(--mp-line)] bg-[var(--mp-card)] p-6 sm:p-9">
          <h2 className="mp-display text-2xl font-bold">{text.howTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              [text.how1Title, text.how1Text],
              [text.how2Title, text.how2Text],
              [text.how3Title, text.how3Text],
            ].map(([title, body], i) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--mp-accent)] font-extrabold text-[var(--mp-accent)]">{i + 1}</span>
                <h3 className="text-[17px] font-bold">{title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--mp-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
