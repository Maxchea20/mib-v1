import Link from "next/link";
import { getSiteContext } from "@/site/context";
import { t } from "@/site/i18n";

export default async function SiteNotFound() {
  const { lang, base } = await getSiteContext();
  const text = t(lang);

  return (
    <main className="mx-auto flex max-w-[720px] flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-extrabold">{text.notFoundTitle}</h1>
      <p className="text-base text-[var(--mp-muted)]">{text.notFoundText}</p>
      <Link href={base || "/"} className="mt-2 inline-flex min-h-12 items-center rounded-full bg-[var(--mp-accent)] px-6 font-bold text-white">
        {text.backToListings}
      </Link>
    </main>
  );
}
