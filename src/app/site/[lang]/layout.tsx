import type { Metadata, Viewport } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "../../globals.css";
import "./site.css";
import LangSwitch from "@/components/site/LangSwitch";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { BRAND, BRAND_CSS_VARS } from "@/site/brand";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { requireLang } from "@/site/context";
import { HTML_LANG, LANGS, basePath, t } from "@/site/i18n";
import { LANDINGS } from "@/site/landing";
import { landingCommon, landingText } from "@/site/landingText";
import { HOME_SEO, OG_LOCALE } from "@/site/seo";
import { whatsappUrl } from "@/site/format";

// Self-hosted (see ./fonts/README.md): no download from Google at build time.
const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
});

const playfair = localFont({
  src: "./fonts/playfair-display-latin-wght-normal.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  variable: "--mp-font-display",
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const home = HOME_SEO[lang];
  return {
    metadataBase: new URL(BRAND.siteUrl),
    title: { default: home.title, template: `%s | ${BRAND.name}` },
    description: home.description,
    robots: { index: true, follow: true },
    icons: { icon: BRAND.iconSrc, apple: BRAND.iconSrc },
    openGraph: {
      siteName: BRAND.name,
      type: "website",
      locale: OG_LOCALE[lang],
      title: home.title,
      description: home.description,
      images: [{ url: BRAND.ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [BRAND.ogImage] },
  };
}

// Pinch-zoom stays enabled on the public site (accessibility), and the
// browser bar matches the black theme.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: BRAND.colors.paper,
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const lang = requireLang((await params).lang);
  const base = basePath(lang);
  const text = t(lang);
  const home = base || "/";

  return (
    <html lang={HTML_LANG[lang]} style={{ background: BRAND.colors.paper }}>
    <body style={{ background: BRAND.colors.paper }}>
    <div
      style={BRAND_CSS_VARS as React.CSSProperties}
      className={`${jakarta.className} ${playfair.variable} mp-cement flex min-h-screen flex-col text-[var(--mp-ink)]`}
    >
      <header className="border-b border-[var(--mp-line)] bg-[var(--mp-header)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href={home} className="mp-display flex items-center gap-2.5 text-[22px] font-bold">
            {BRAND.logoSrc ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BRAND.logoSrc} alt="" width={58} height={40} className="h-10 w-auto" />
                <span>{BRAND.name}</span>
              </>
            ) : (
              <>
                <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                  <rect width="30" height="30" rx="8" fill="var(--mp-accent)" />
                  <path d="M7 21V11l8-5 8 5v10" fill="none" stroke="#0A0A0B" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 21v-6h6v6" fill="none" stroke="#0A0A0B" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span>{BRAND.name}</span>
              </>
            )}
          </Link>

          <nav aria-label="Main" className="order-3 flex w-full flex-wrap gap-x-6 gap-y-1 text-[15px] font-semibold sm:order-none sm:w-auto">
            <Link href={`${base}/residential`} className="hover:text-[var(--mp-accent)]">{text.navResidential}</Link>
            <Link href={`${base}/commercial`} className="hover:text-[var(--mp-accent)]">{text.navCommercial}</Link>
            <Link href={`${base}/industrial`} className="hover:text-[var(--mp-accent)]">{text.navIndustrial}</Link>
            <Link href={`${base}/land`} className="hover:text-[var(--mp-accent)]">{text.navLand}</Link>
            <Link href={`${base}/calculators`} className="hover:text-[var(--mp-accent)]">{text.calcNav}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Suspense fallback={null}>
              <LangSwitch current={lang} label={text.language} />
            </Suspense>
            <a
              href={whatsappUrl("")}
              className="hidden min-h-11 items-center gap-2 rounded-full bg-[var(--mp-whatsapp)] px-4 text-sm font-extrabold text-[var(--mp-on-whatsapp)] sm:flex"
            >
              <WhatsAppIcon />
              {text.whatsappUs}
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-[var(--mp-line)] bg-[var(--mp-footer)] text-[var(--mp-ink2)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 px-4 py-10 sm:px-6">
          <div className="max-w-sm">
            <p className="mp-display text-xl font-bold text-[var(--mp-accent)]">{BRAND.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mp-muted)]">{text.footerAbout}</p>
          </div>
          <nav aria-label={landingCommon(lang).popularTitle} className="text-sm text-[var(--mp-muted)]">
            <p className="font-bold text-[var(--mp-ink)]">{landingCommon(lang).popularTitle}</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {LANDINGS.map((l) => (
                <li key={l.slug}>
                  <Link href={`${base}/${l.slug}`} className="inline-flex min-h-8 items-center underline hover:text-[var(--mp-accent)]">
                    {landingText(l.slug, lang).nav}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-sm text-[var(--mp-muted)]">
            <p className="font-bold text-[var(--mp-ink)]">{text.footerContact}</p>
            <p className="mt-2">
              WhatsApp:{" "}
              <a href={whatsappUrl("")} className="underline">{BRAND.whatsappDisplay}</a>
            </p>
            {BRAND.renNumber && (
              <p className="mt-1">{text.footerReg}: {BRAND.renNumber}</p>
            )}
          </div>
        </div>
      </footer>
    </div>
    {/* Anonymous visitor counting for the public site only (never the CRM). */}
    <Analytics />
    </body>
    </html>
  );
}
