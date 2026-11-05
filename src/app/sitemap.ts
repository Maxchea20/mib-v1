import type { MetadataRoute } from "next";
import { BRAND } from "@/site/brand";
import { CATEGORIES } from "@/site/categories";
import { getPublicListingIds } from "@/site/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getPublicListingIds();

  return [
    { url: BRAND.siteUrl, changeFrequency: "daily", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${BRAND.siteUrl}/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...ids.map((id) => ({
      url: `${BRAND.siteUrl}/listing/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
