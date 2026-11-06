import type { MetadataRoute } from "next";
import { BRAND } from "@/site/brand";
import { CATEGORIES } from "@/site/categories";
import { getPublicListingIds } from "@/site/data";
import { HTML_LANG, LANGS, pathFor } from "@/site/i18n";

export const dynamic = "force-dynamic";

// Every page is listed once per language, each entry pointing at its
// translations (hreflang), so Google serves the right language.
function entry(
  path: string,
  changeFrequency: "daily" | "weekly",
  priority: number
): MetadataRoute.Sitemap {
  const url = (lang: (typeof LANGS)[number]) =>
    `${BRAND.siteUrl}${pathFor(lang, path)}`.replace(/\/$/, "");

  const languages: Record<string, string> = {};
  for (const lang of LANGS) languages[HTML_LANG[lang]] = url(lang);
  languages["x-default"] = url("en");

  return LANGS.map((lang) => ({
    url: url(lang),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getPublicListingIds();

  return [
    ...entry("/", "daily", 1),
    ...CATEGORIES.flatMap((c) => entry(`/${c.slug}`, "daily", 0.9)),
    ...entry("/calculators", "weekly", 0.7),
    ...entry("/calculators/housing-loan", "weekly", 0.8),
    ...entry("/calculators/dsr", "weekly", 0.8),
    ...entry("/calculators/rpgt", "weekly", 0.8),
    ...entry("/calculators/legal-fees", "weekly", 0.8),
    ...entry("/calculators/purchase-cost", "weekly", 0.8),
    ...entry("/calculators/rental-yield", "weekly", 0.8),
    ...ids.flatMap((id) => entry(`/listing/${id}`, "weekly", 0.8)),
  ];
}
