/*
|--------------------------------------------------------------------------
| PUBLIC HOST ROUTING (pure, no imports, unit-tested)
|--------------------------------------------------------------------------
|
| Decides what the proxy does with a request that arrives on one of the
| public hosts (maxproperty.my, www.maxproperty.my). The private CRM host
| never goes through this.
|
|   /                    -> rewrite to /site
|   /listing/123         -> rewrite to /site/listing/123
|   /residential (also /commercial /industrial /land) -> /site/<category>
|   /robots.txt, /sitemap.xml -> pass through
|   /_next/...           -> pass through (assets)
|   anything else        -> 404 (no CRM page, API route or login is
|                           reachable from the public host)
|
*/

export type PublicRoute =
  | { action: "pass" }
  | { action: "rewrite"; path: string }
  | { action: "redirect"; host: string }
  | { action: "notfound" };

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

  if (pathname === "/" || pathname === "") {
    return { action: "rewrite", path: "/site" };
  }

  const listing = /^\/listing\/(\d{1,12})\/?$/.exec(pathname);
  if (listing) {
    return { action: "rewrite", path: `/site/listing/${listing[1]}` };
  }

  const category = /^\/(residential|commercial|industrial|land)\/?$/.exec(pathname);
  if (category) {
    return { action: "rewrite", path: `/site/${category[1]}` };
  }

  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return { action: "pass" };
  }

  if (pathname.startsWith("/_next/")) {
    return { action: "pass" };
  }

  return { action: "notfound" };
}
