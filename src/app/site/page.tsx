import Link from "next/link";
import ListingCard from "@/components/site/ListingCard";
import { cleanFilters, getPublicListings } from "@/site/data";
import { getSiteContext } from "@/site/context";
import { fill, t } from "@/site/i18n";

export default async function SiteHome({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang, base } = await getSiteContext();
  const text = t(lang);
  const filters = cleanFilters(await searchParams);
  const { listings, photos } = await getPublicListings(filters);
  const action = base || "/";
  const hasFilters = Boolean(filters.purpose || filters.category);

  const select =
    "h-12 rounded-[10px] border border-[#CFCABD] bg-white px-3 text-base text-[var(--mp-ink)]";

  return (
    <>
      <section className="bg-[var(--mp-accent)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-[72px]">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#BFE3D6]">{text.heroKicker}</p>
          <h1 className="max-w-[760px] text-4xl font-extrabold leading-[1.1] sm:text-5xl">{text.heroTitle}</h1>
          <p className="max-w-[620px] text-lg leading-relaxed text-[#E3F2EC]">{text.heroSub}</p>

          <form action={action} method="get" className="flex max-w-[860px] flex-wrap items-end gap-3 rounded-2xl bg-white p-4 text-[var(--mp-ink)]">
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
              <select name="category" defaultValue={filters.category ?? ""} className={select}>
                <option value="">{text.filterAnyType}</option>
                <option value="Residential">{text.residential}</option>
                <option value="Commercial">{text.commercial}</option>
                <option value="Industrial">{text.industrial}</option>
                <option value="Land">{text.land}</option>
              </select>
            </label>
            <button type="submit" className="h-12 rounded-[10px] bg-[var(--mp-accent)] px-8 text-base font-bold text-white">
              {text.filterSearch}
            </button>
          </form>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 pb-6 pt-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-3xl font-extrabold">{text.latest}</h2>
          <p className="text-[15px] text-[var(--mp-muted)]">{fill(text.resultsCount, { n: listings.length })}</p>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-10 text-center">
            <p className="text-lg font-bold">{text.empty}</p>
            <p className="mt-2 text-[var(--mp-muted)]">{text.emptyHint}</p>
            {hasFilters && (
              <Link href={action} className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--mp-accent)] px-5 font-bold text-[var(--mp-accent)]">
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

      <section className="mx-auto max-w-[1200px] px-4 pb-14 pt-8 sm:px-6">
        <div className="flex flex-col gap-6 rounded-[20px] border border-[var(--mp-line)] bg-[var(--mp-card)] p-6 sm:p-9">
          <h2 className="text-2xl font-extrabold">{text.howTitle}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              [text.how1Title, text.how1Text],
              [text.how2Title, text.how2Text],
              [text.how3Title, text.how3Text],
            ].map(([title, body], i) => (
              <div key={title} className="flex flex-col gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--mp-accent-soft)] font-extrabold text-[var(--mp-accent)]">{i + 1}</span>
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
