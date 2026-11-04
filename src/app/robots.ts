import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { BRAND } from "@/site/brand";
import { normalizeHost } from "@/site/routing";

export const dynamic = "force-dynamic";

// The public site is indexable; the private CRM host never is.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = normalizeHost((await headers()).get("host"));

  if (BRAND.publicHosts.includes(host)) {
    return {
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${BRAND.siteUrl}/sitemap.xml`,
    };
  }

  return { rules: { userAgent: "*", disallow: "/" } };
}
