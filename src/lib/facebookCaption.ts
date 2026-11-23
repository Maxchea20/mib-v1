/*
|--------------------------------------------------------------------------
| FACEBOOK CAPTION LANGUAGE (pure, unit-tested)
|--------------------------------------------------------------------------
|
| The AI writes the caption from the listing's own details. This chooses the
| language and tells the AI how to write it. The accuracy rules in the route
| (never invent facts, never change numbers) apply in every language.
|
*/

export type CaptionLang = "en" | "ms" | "zh";
export const CAPTION_LANGS: { id: CaptionLang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ms", label: "BM" },
  { id: "zh", label: "中文" },
];

/** Anything that is not a known language becomes English. */
export function captionLang(v: unknown): CaptionLang {
  return v === "ms" || v === "zh" ? v : "en";
}

const COMMON = `
- Keep every number, price, measurement and unit exactly as supplied. Do not translate, convert, round or reformat them (keep "RM", "sqft" and the like as supplied).
- Keep place names, people's names and the word WhatsApp as they are.
- The accuracy rules above apply in this language too: do not add, change or strengthen any fact, and do not add claims that are not in the supplied data.`;

export function languageRule(lang: CaptionLang): string {
  if (lang === "ms") {
    return `- Write the whole post in Bahasa Malaysia (Malay), as Malaysian property agents write it: natural, clear and polite, not a word-for-word translation of English.
- Use common Malaysian property terms where they match the supplied data, for example: untuk dijual, untuk disewa, pegangan bebas (freehold), pajakan (leasehold), rumah teres, kilang, gudang, tanah, kedai, bilik tidur, bilik air.
- Start with a factual hook in Malay, then the details, then a clear call to action in Malay.${COMMON}`;
  }
  if (lang === "zh") {
    return `- Write the whole post in Simplified Chinese, as Malaysian Chinese property agents write it for Malaysian Chinese readers: natural and clear, not a word-for-word translation of English.
- Use common Malaysian Chinese property terms where they match the supplied data, for example: 出售, 出租, 永久地契 (freehold), 租赁地契 (leasehold), 排屋, 单层排屋, 店屋, 工厂, 仓库, 土地, 卧室, 浴室.
- Start with a factual hook in Chinese, then the details, then a clear call to action in Chinese.${COMMON}`;
  }
  return `- Write the post in English.`;
}
