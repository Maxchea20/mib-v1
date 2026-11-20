import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { BRAND } from "@/site/brand";
import { requireLang } from "@/site/context";
import { getPublicProfile } from "@/site/data";
import { whatsappUrl } from "@/site/format";
import { basePath } from "@/site/i18n";
import { firstName, fillText, isShowable, personSchema, pickText, profileText, yearsSince } from "@/site/profile";
import { breadcrumbSchema, safeJson } from "@/site/schema";
import { alternatesFor, OG_LOCALE } from "@/site/seo";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const profile = await getPublicProfile();
  if (!isShowable(profile)) return { robots: { index: false } };
  const text = profileText(lang);
  const title = `${profile.display_name} | ${text.title}`;
  const description = fillText(text.metaDescription, { name: profile.display_name ?? "" });
  const alt = alternatesFor(lang, "/about");
  return {
    title,
    description,
    alternates: alt,
    openGraph: {
      title,
      description,
      url: alt.canonical,
      siteName: BRAND.name,
      locale: OG_LOCALE[lang],
      type: "profile",
      images: [{ url: profile.photo_url ?? BRAND.ogImage }],
    },
    twitter: { card: "summary_large_image", title, description, images: [profile.photo_url ?? BRAND.ogImage] },
  };
}

export default async function AboutPage({ params }: Props) {
  const lang = requireLang((await params).lang);
  const profile = await getPublicProfile();
  if (!isShowable(profile)) notFound();

  const base = basePath(lang);
  const text = profileText(lang);
  const name = profile.display_name ?? "";
  const headline = pickText(profile, "headline", lang);
  const paragraphs = pickText(profile, "bio", lang).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const years = yearsSince(profile.since_year);
  const first = firstName(name);
  const message = fillText(text.whatsappMsg, { first });
  const groups: [string, string[]][] = [
    [text.specialises, profile.specialisations ?? []],
    [text.areas, profile.areas ?? []],
    [text.languages, profile.languages ?? []],
  ];

  const jsonLd = [
    personSchema(profile, lang),
    breadcrumbSchema([
      { name: BRAND.name, url: `${BRAND.siteUrl}${base || "/"}` },
      { name: text.title, url: alternatesFor(lang, "/about").canonical },
    ]),
  ];

  return (
    <main className="mx-auto flex max-w-[1000px] flex-col gap-8 px-4 pb-20 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />

      <section className="flex flex-col gap-8 sm:flex-row sm:items-start">
        {profile.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo_url}
            alt={name}
            width={360}
            height={450}
            fetchPriority="high"
            className="aspect-[4/5] w-full max-w-[320px] flex-none self-center rounded-2xl border border-[var(--mp-line-strong)] object-cover object-top sm:self-start"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h1 className="mp-display text-3xl font-bold leading-tight text-[var(--mp-ink)] sm:text-4xl">{name}</h1>
            {headline ? <p className="mt-2 text-lg text-[var(--mp-accent)]">{headline}</p> : null}
          </div>

          <p className="text-sm text-[var(--mp-muted)]">
            {text.reg}: <b className="text-[var(--mp-ink2)]">{BRAND.renNumber}</b>
            {years !== null && years > 0 ? <> · {fillText(text.years, { n: years })}</> : null}
          </p>

          <div className="flex flex-col gap-3 text-base leading-relaxed text-[var(--mp-ink2)]">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={whatsappUrl(message)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--mp-whatsapp)] px-5 text-sm font-extrabold text-[var(--mp-on-whatsapp)]"
            >
              <WhatsAppIcon />
              {fillText(text.whatsapp, { first })}
            </a>
            <Link
              href={base || "/"}
              className="inline-flex min-h-12 items-center rounded-full border border-[var(--mp-line-strong)] px-5 text-sm font-bold text-[var(--mp-ink)] hover:border-[var(--mp-accent)]"
            >
              {text.browse}
            </Link>
          </div>
        </div>
      </section>

      {groups.some(([, items]) => items.length > 0) && (
        <section className="grid gap-5 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:grid-cols-3 sm:p-6">
          {groups.map(([label, items]) =>
            items.length === 0 ? null : (
              <div key={label}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--mp-accent)]">{label}</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {items.map((it) => (
                    <li key={it} className="rounded-full border border-[var(--mp-line-strong)] px-3 py-1 text-sm text-[var(--mp-ink2)]">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </section>
      )}
    </main>
  );
}
