import { BRAND } from "./brand";
import { HTML_LANG, LANGS, pathFor, type Lang } from "./i18n";

/*
| Canonical + hreflang alternates for a page, e.g. path "/residential":
|   en        https://maxproperty.my/residential
|   ms        https://maxproperty.my/ms/residential
|   zh-CN     https://maxproperty.my/zh/residential
|   x-default the English address
*/
export function alternatesFor(lang: Lang, path: string) {
  const url = (l: Lang) => `${BRAND.siteUrl}${pathFor(l, path)}`.replace(/\/$/, "");

  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[HTML_LANG[l]] = url(l);
  languages["x-default"] = url("en");

  return { canonical: url(lang), languages };
}

/** Open Graph locale per language. */
export const OG_LOCALE: Record<Lang, string> = { en: "en_MY", ms: "ms_MY", zh: "zh_CN" };

/** Default title / description of the public site, per language (home page). */
export const HOME_SEO: Record<Lang, { title: string; description: string }> = {
  en: {
    title: `${BRAND.name} | Property for sale and rent in Ipoh, Perak`,
    description:
      `Houses, shop lots, factories and land for sale and rent in Ipoh and across Perak. Browse listings and chat directly with Max, a registered estate negotiator (REN ${BRAND.renNumber}).`,
  },
  ms: {
    title: `${BRAND.name} | Hartanah untuk dijual dan disewa di Ipoh, Perak`,
    description:
      `Rumah, kedai, kilang dan tanah untuk dijual dan disewa di Ipoh dan seluruh Perak. Lihat senarai dan berbual terus dengan Max, ejen harta tanah berdaftar (REN ${BRAND.renNumber}).`,
  },
  zh: {
    title: `${BRAND.name} | 怡保及霹雳房产买卖与出租`,
    description:
      `怡保及霹雳全州的住宅、店屋、工厂和土地买卖与出租。浏览房源，直接与注册房地产经纪 Max 联系 (REN ${BRAND.renNumber})。`,
  },
};
