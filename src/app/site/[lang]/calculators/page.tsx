import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/site/brand";
import { requireLang } from "@/site/context";
import { basePath, t } from "@/site/i18n";
import { alternatesFor } from "@/site/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const text = t(lang);
  const alt = alternatesFor(lang, "/calculators");

  return {
    title: text.calcHubTitle,
    description: text.calcHubIntro,
    alternates: alt,
    openGraph: {
      title: `${text.calcHubTitle} | ${BRAND.name}`,
      description: text.calcHubIntro,
      url: alt.canonical,
      siteName: BRAND.name,
      type: "website",
      images: [{ url: BRAND.ogImage, width: 1200, height: 630 }],
    },
  };
}

export default async function CalculatorsHub({ params }: Props) {
  const lang = requireLang((await params).lang);
  const text = t(lang);
  const base = basePath(lang);

  // More calculators are added to this list as they are built.
  const tools = [
    {
      href: `${base}/calculators/housing-loan`,
      title: text.hlTitle,
      body: text.hlCardText,
    },
    {
      href: `${base}/calculators/dsr`,
      title: text.dsrTitle,
      body: text.dsrCardText,
    },
    {
      href: `${base}/calculators/rpgt`,
      title: text.rpTitle,
      body: text.rpCardText,
    },
  ];

  return (
    <>
      <section className="border-b border-[var(--mp-line)] bg-[linear-gradient(180deg,rgba(10,10,11,0.15),rgba(10,10,11,0.6))]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-[var(--mp-muted)]">
            <Link href={base || "/"} className="font-semibold text-[var(--mp-accent)] underline">{text.breadcrumbAll}</Link>
            <span>/</span>
            <span>{text.calcNav}</span>
          </nav>
          <h1 className="mp-display text-4xl font-bold sm:text-5xl">{text.calcHubTitle}</h1>
          <p className="max-w-[680px] text-lg text-[var(--mp-ink2)]">{text.calcHubIntro}</p>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-4 pb-14 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--mp-line)] border-t-[3px] border-t-[var(--mp-accent)] bg-[var(--mp-card)] p-6 transition-colors hover:bg-[#1B1B1E]"
            >
              <h2 className="mp-display text-xl font-bold">{tool.title}</h2>
              <p className="text-[15px] leading-relaxed text-[var(--mp-muted)]">{tool.body}</p>
              <span className="mt-auto pt-2 text-sm font-extrabold text-[var(--mp-accent)]">{text.calcOpen} →</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
