import type { Metadata } from "next";
import Link from "next/link";
import RpgtCalculator from "@/components/site/calculators/RpgtCalculator";
import { BRAND } from "@/site/brand";
import { requireLang } from "@/site/context";
import { basePath, t } from "@/site/i18n";
import { alternatesFor } from "@/site/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const text = t(lang);
  const alt = alternatesFor(lang, "/calculators/rpgt");

  return {
    title: text.rpTitle,
    description: text.rpIntro,
    alternates: alt,
    openGraph: {
      title: `${text.rpTitle} | ${BRAND.name}`,
      description: text.rpIntro,
      url: alt.canonical,
      siteName: BRAND.name,
      type: "website",
      images: [{ url: BRAND.ogImage, width: 1200, height: 630 }],
    },
  };
}

export default async function RpgtPage({ params }: Props) {
  const lang = requireLang((await params).lang);
  const text = t(lang);
  const base = basePath(lang);

  const assumptions = [text.rpAssume1, text.rpAssume2, text.rpAssume3, text.rpAssume4, text.rpAssume5, text.rpAssume6];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: text.rpTitle,
    description: text.rpIntro,
    url: alternatesFor(lang, "/calculators/rpgt").canonical,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "MYR" },
    publisher: { "@type": "Organization", name: BRAND.name, url: BRAND.siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="border-b border-[var(--mp-line)] bg-[linear-gradient(180deg,rgba(10,10,11,0.15),rgba(10,10,11,0.6))]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-[var(--mp-muted)]">
            <Link href={base || "/"} className="font-semibold text-[var(--mp-accent)] underline">{text.breadcrumbAll}</Link>
            <span>/</span>
            <Link href={`${base}/calculators`} className="font-semibold text-[var(--mp-accent)] underline">{text.calcNav}</Link>
            <span>/</span>
            <span>{text.rpTitle}</span>
          </nav>
          <h1 className="mp-display text-4xl font-bold sm:text-5xl">{text.rpTitle}</h1>
          <p className="max-w-[680px] text-lg text-[var(--mp-ink2)]">{text.rpIntro}</p>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 pb-14 pt-8 sm:px-6">
        <RpgtCalculator lang={lang} />

        <section aria-labelledby="how" className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6 sm:p-8">
          <h2 id="how" className="mp-display text-2xl font-bold">{text.rpAssumeTitle}</h2>
          <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 text-[15px] leading-relaxed text-[var(--mp-ink2)]">
            {assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
