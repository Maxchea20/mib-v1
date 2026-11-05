import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import LangSwitch from "@/components/site/LangSwitch";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { BRAND, BRAND_CSS_VARS } from "@/site/brand";
import { getSiteContext } from "@/site/context";
import { HTML_LANG, t } from "@/site/i18n";
import { whatsappUrl } from "@/site/format";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  robots: { index: true, follow: true },
  openGraph: {
    siteName: BRAND.name,
    type: "website",
    locale: "en_MY",
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang, base } = await getSiteContext();
  const text = t(lang);
  const home = base || "/";

  return (
    <div
      lang={HTML_LANG[lang]}
      style={BRAND_CSS_VARS as React.CSSProperties}
      className={`${jakarta.className} flex min-h-screen flex-col bg-[var(--mp-paper)] text-[var(--mp-ink)]`}
    >
      <header className="border-b border-[var(--mp-line)] bg-[var(--mp-card)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href={home} className="flex items-center gap-2.5 text-xl font-extrabold">
            {BRAND.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={BRAND.logoSrc} alt={BRAND.name} className="h-8 w-auto" />
            ) : (
              <>
                <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                  <rect width="30" height="30" rx="8" fill="var(--mp-accent)" />
                  <path d="M7 21V11l8-5 8 5v10" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 21v-6h6v6" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
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
          </nav>

          <div className="flex items-center gap-3">
            <LangSwitch current={lang} label={text.language} />
            <a
              href={whatsappUrl("")}
              className="hidden min-h-11 items-center gap-2 rounded-full bg-[var(--mp-whatsapp)] px-4 text-sm font-bold text-white sm:flex"
            >
              <WhatsAppIcon />
              {text.whatsappUs}
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="bg-[var(--mp-footer)] text-[#E8E5DC]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 px-4 py-10 sm:px-6">
          <div className="max-w-sm">
            <p className="text-lg font-extrabold text-white">{BRAND.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#BDB9AE]">{text.footerAbout}</p>
          </div>
          <div className="text-sm text-[#BDB9AE]">
            <p className="font-bold text-white">{text.footerContact}</p>
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
  );
}
