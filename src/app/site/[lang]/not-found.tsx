"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { basePath, splitLangPath, t } from "@/site/i18n";

// not-found pages receive no params, so the language comes from the address.
export default function SiteNotFound() {
  const { lang } = splitLangPath(usePathname() || "/");
  const text = t(lang);

  return (
    <main className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="mp-display text-3xl font-bold">{text.notFoundTitle}</h1>
      <p className="text-base text-[var(--mp-muted)]">{text.notFoundText}</p>
      <Link href={basePath(lang) || "/"} className="mt-2 inline-flex min-h-12 items-center rounded-full bg-[var(--mp-accent)] px-6 font-extrabold text-[var(--mp-on-accent)]">
        {text.backToListings}
      </Link>
    </main>
  );
}
