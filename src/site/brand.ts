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
  // Shown in the footer/profile when set. Leave "" until you have it.
  renNumber: "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://maxproperty.my",
  // Hosts that serve the PUBLIC website (everything else is the private CRM).
  publicHosts: ["maxproperty.my", "www.maxproperty.my"],
  // CSS variables used by the public site. Swap these for the real palette.
  colors: {
    ink: "#14201C",
    muted: "#566259",
    paper: "#F7F5F0",
    card: "#FFFFFF",
    line: "#E4E0D6",
    accent: "#0F5C4D",
    accentSoft: "#E3F2EC",
    whatsapp: "#128C4A",
    footer: "#14201C",
  },
  // Replace with a real logo file in /public later (e.g. "/logo.svg").
  logoSrc: null as string | null,
};

export const BRAND_CSS_VARS = {
  "--mp-ink": BRAND.colors.ink,
  "--mp-muted": BRAND.colors.muted,
  "--mp-paper": BRAND.colors.paper,
  "--mp-card": BRAND.colors.card,
  "--mp-line": BRAND.colors.line,
  "--mp-accent": BRAND.colors.accent,
  "--mp-accent-soft": BRAND.colors.accentSoft,
  "--mp-whatsapp": BRAND.colors.whatsapp,
  "--mp-footer": BRAND.colors.footer,
} as Record<string, string>;
