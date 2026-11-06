/*
|--------------------------------------------------------------------------
| PUBLIC SITE BRAND
|--------------------------------------------------------------------------
|
| Everything that identifies the public website lives here, so the logo,
| colours and name can be swapped in one place later.
|
*/

export const BRAND = {
  name: "Max Property",
  tagline: "Property in Ipoh, Perak and across Malaysia",
  // WhatsApp number in international format, digits only (no +).
  whatsapp: "60165210993",
  whatsappDisplay: "+60 16-521 0993",
  // Registered Estate Negotiator number. Shown in the footer and on listing pages when set.
  renNumber: "31953",
  // Profile pages that belong to the business (Google Business Profile, Facebook, ...).
  // Add the full URLs here and they are published as "sameAs" in the structured data.
  sameAs: [] as string[],
  // Where the business works. Used as the service area in the structured data.
  serviceAreas: ["Ipoh", "Perak"] as string[],
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://maxproperty.my",
  // Hosts that serve the PUBLIC website (everything else is the private CRM).
  publicHosts: ["maxproperty.my", "www.maxproperty.my"],
  // CSS variables used by the public site. Swap these for the real palette.
  colors: {
    ink: "#F4EFE4",
    ink2: "#D8D2C4",
    muted: "#A7A092",
    paper: "#0A0A0B",
    card: "#141416",
    line: "#2A2A2E",
    lineStrong: "#3A3A40",
    accent: "#D4AF37",
    accentSoft: "#1D1A10",
    onAccent: "#0A0A0B",
    whatsapp: "#1FA855",
    onWhatsapp: "#07140C",
    header: "rgba(10, 10, 11, 0.82)",
    footer: "#050506",
  },
  // Replace with a real logo file in /public later (e.g. "/logo.svg").
  logoSrc: "/brand/logo-header.png" as string | null,
  // Square icon (browser tab / phone home screen) and default share image.
  iconSrc: "/brand/logo-icon.png",
  ogImage: "/brand/og-default.jpg",
};

export const BRAND_CSS_VARS = {
  "--mp-ink": BRAND.colors.ink,
  "--mp-ink2": BRAND.colors.ink2,
  "--mp-muted": BRAND.colors.muted,
  "--mp-paper": BRAND.colors.paper,
  "--mp-card": BRAND.colors.card,
  "--mp-line": BRAND.colors.line,
  "--mp-line-strong": BRAND.colors.lineStrong,
  "--mp-accent": BRAND.colors.accent,
  "--mp-accent-soft": BRAND.colors.accentSoft,
  "--mp-on-accent": BRAND.colors.onAccent,
  "--mp-whatsapp": BRAND.colors.whatsapp,
  "--mp-on-whatsapp": BRAND.colors.onWhatsapp,
  "--mp-header": BRAND.colors.header,
  "--mp-footer": BRAND.colors.footer,
} as Record<string, string>;
