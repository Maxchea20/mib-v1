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
