import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND } from "@/site/brand";
import { basePath, t, type Lang } from "@/site/i18n";
import { alternatesFor } from "@/site/seo";

/* The page frame shared by the purchase-cost calculators (server component). */

export function calcMetadata(lang: Lang, path: string, title: string, intro: string): Metadata {
  const alt = alternatesFor(lang, path);
  return {
    title,
    description: intro,
    alternates: alt,
    openGraph: {
      title: `${title} | ${BRAND.name}`,
      description: intro,
      url: alt.canonical,
      siteName: BRAND.name,
      type: "website",
      images: [{ url: BRAND.ogImage, width: 1200, height: 630 }],
    },
  };
}

export default function CalcPage({
  lang, path, title, intro, assumptionsTitle, assumptions, children,
}: {
  lang: Lang;
  path: string;
  title: string;
  intro: string;
  assumptionsTitle: string;
  assumptions: string[];
  children: ReactNode;
}) {
  const text = t(lang);
  const base = basePath(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description: intro,
    url: alternatesFor(lang, path).canonical,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "MYR" },
    publisher: { "@type": "Organization", name: BRAND.name, url: BRAND.siteUrl },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="border-b border-[var(--mp-line)] bg-[linear-gradient(180deg,rgba(10,10,11,0.15),rgba(10,10,11,0.6))]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-[var(--mp-muted)]">
            <Link href={base || "/"} className="font-semibold text-[var(--mp-accent)] underline">{text.breadcrumbAll}</Link>
            <span>/</span>
            <Link href={`${base}/calculators`} className="font-semibold text-[var(--mp-accent)] underline">{text.calcNav}</Link>
            <span>/</span>
            <span>{title}</span>
          </nav>
          <h1 className="mp-display text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="max-w-[680px] text-lg text-[var(--mp-ink2)]">{intro}</p>
        </div>
      </section>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 pb-14 pt-8 sm:px-6">
        {children}
        <section aria-labelledby="how" className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6 sm:p-8">
          <h2 id="how" className="mp-display text-2xl font-bold">{assumptionsTitle}</h2>
          <ul className="mt-4 flex list-disc flex-col gap-2.5 pl-5 text-[15px] leading-relaxed text-[var(--mp-ink2)]">
            {assumptions.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>
      </main>
    </>
  );
}
