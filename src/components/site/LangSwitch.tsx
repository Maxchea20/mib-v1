"use client";

import { useRouter } from "next/navigation";
import { LANGS, LANG_LABELS, rememberLang, type Lang } from "@/site/i18n";

export default function LangSwitch({
  current,
  label,
}: {
  current: Lang;
  label: string;
}) {
  const router = useRouter();

  function choose(lang: Lang) {
    rememberLang(lang);
    router.refresh();
  }

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1 rounded-full border border-[var(--mp-line)] bg-[var(--mp-card)] p-1">
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => choose(lang)}
          aria-pressed={lang === current}
          className={`min-h-9 min-w-11 rounded-full px-3 text-sm font-bold ${
            lang === current
              ? "bg-[var(--mp-accent)] text-[var(--mp-on-accent)]"
              : "text-[var(--mp-ink)] hover:text-[var(--mp-accent)]"
          }`}
        >
          {LANG_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
