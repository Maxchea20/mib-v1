import { notFound } from "next/navigation";
import { isLang, pathFor, type Lang } from "./i18n";

/*
| The language comes from the address (/ms, /zh, or none for English),
| never from a cookie, so pages can be cached and every language has its
| own indexable URL.
*/

export function requireLang(raw: string): Lang {
  if (!isLang(raw)) notFound();
  return raw;
}

/** Link helper: a path inside the site, in the visitor's language. */
export function link(lang: Lang, path: string): string {
  return pathFor(lang, path);
}
