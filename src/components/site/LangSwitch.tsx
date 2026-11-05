"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LANGS, LANG_LABELS, HTML_LANG, pathFor, splitLangPath, type Lang } from "@/site/i18n";

/*
| Language links. Each language is its own address (/ms/..., /zh/...), so
| the switch is plain links to the same page in the other language.
*/
export default function LangSwitch({
  current,
  label,
}: {
  current: Lang;
  label: string;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { path } = splitLangPath(pathname || "/");

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1 rounded-full border border-[var(--mp-line)] bg-[var(--mp-card)] p-1">
      {LANGS.map((lang) => (
        <Link
          key={lang}
          href={`${pathFor(lang, path)}${search ? `?${search}` : ""}`}
          hrefLang={HTML_LANG[lang]}
          lang={HTML_LANG[lang]}
          prefetch={false}
          aria-current={lang === current ? "true" : undefined}
          className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-full px-3 text-sm font-bold ${
            lang === current
              ? "bg-[var(--mp-accent)] text-[var(--mp-on-accent)]"
              : "text-[var(--mp-ink)] hover:text-[var(--mp-accent)]"
          }`}
        >
          {LANG_LABELS[lang]}
        </Link>
      ))}
    </div>
  );
}
