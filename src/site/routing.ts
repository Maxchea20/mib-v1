/*
|--------------------------------------------------------------------------
| PUBLIC HOST ROUTING (pure, no imports, unit-tested)
|--------------------------------------------------------------------------
|
| Decides what the proxy does with a request that arrives on one of the
| public hosts (maxproperty.my, www.maxproperty.my). The private CRM host
| never goes through this.
|
| Languages live in the address: English at the root, Bahasa Malaysia under
| /ms and Simplified Chinese under /zh.
|
|   /                      -> /site/en
|   /ms  /zh               -> /site/ms   /site/zh
|   /residential           -> /site/en/residential   (also commercial,
|   /ms/residential           industrial, land; and each language)
|   /listing/123           -> /site/en/listing/123   (and /ms /zh)
|   /calculators, /calculators/housing-loan, /calculators/dsr -> /site/en/calculators...
|   /en  /en/...           -> 308 to the same path without /en
|   /robots.txt /sitemap.xml /_next/...  -> pass through
|   anything else          -> 404 (no CRM page, API route or login is
|                             reachable from the public host)
|
*/

export type PublicRoute =
  | { action: "pass" }
  | { action: "rewrite"; path: string }
  | { action: "redirect"; host: string }
  | { action: "redirect-path"; path: string }
  | { action: "notfound" };

const PREFIXED_LANGS = ["ms", "zh"];

export function normalizeHost(rawHost: string | null | undefined): string {
  return (rawHost ?? "").toLowerCase().split(":")[0].trim();
}

export function resolvePublicRoute(
  rawHost: string | null | undefined,
  pathname: string,
  publicHosts: string[]
): PublicRoute | null {
  const host = normalizeHost(rawHost);

  if (!publicHosts.includes(host)) {
    return null; // not a public host: normal CRM handling
  }

  // One canonical address: www -> bare domain.
  if (host.startsWith("www.") && publicHosts.includes(host.slice(4))) {
    return { action: "redirect", host: host.slice(4) };
  }

  if (pathname.startsWith("/_next/")) {
    return { action: "pass" };
  }

  // English has no prefix: /en/... is a duplicate, so send it to the root form.
  const enMatch = /^\/en(\/.*)?$/.exec(pathname);
  if (enMatch) {
    return { action: "redirect-path", path: enMatch[1] || "/" };
  }

  // Language prefix (ms / zh) or none (English).
  let lang = "en";
  let rest = pathname;
  for (const l of PREFIXED_LANGS) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      lang = l;
      rest = pathname.slice(l.length + 1) || "/";
      break;
    }
  }

  if (rest === "/" || rest === "") {
    return { action: "rewrite", path: `/site/${lang}` };
  }

  const category = /^\/(residential|commercial|industrial|land)\/?$/.exec(rest);
  if (category) {
    return { action: "rewrite", path: `/site/${lang}/${category[1]}` };
  }

  const calculators = /^\/calculators(\/(?:housing-loan|dsr))?\/?$/.exec(rest);
  if (calculators) {
    return { action: "rewrite", path: `/site/${lang}/calculators${calculators[1] ?? ""}` };
  }

  const listing = /^\/listing\/(\d{1,12})\/?$/.exec(rest);
  if (listing) {
    return { action: "rewrite", path: `/site/${lang}/listing/${listing[1]}` };
  }

  // robots.txt / sitemap.xml exist only at the root (no language prefix).
  if (lang === "en" && (rest === "/robots.txt" || rest === "/sitemap.xml")) {
    return { action: "pass" };
  }

  return { action: "notfound" };
}
