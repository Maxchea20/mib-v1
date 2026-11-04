import { cookies, headers } from "next/headers";
import { BRAND } from "./brand";
import { LANG_COOKIE, parseLang, type Lang } from "./i18n";
import { normalizeHost } from "./routing";

/*
| Per-request context for public pages: the visitor's language, and the
| link prefix. On the public host ("maxproperty.my") pages live at "/"
| and "/listing/ID". When previewed on the CRM host (owner only, logged
| in) they live under "/site", so links must carry that prefix.
*/
export async function getSiteContext(): Promise<{ lang: Lang; base: string }> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  const lang = parseLang(cookieStore.get(LANG_COOKIE)?.value);
  const host = normalizeHost(headerList.get("host"));
  const base = BRAND.publicHosts.includes(host) ? "" : "/site";

  return { lang, base };
}
