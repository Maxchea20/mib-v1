import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/site/brand";
import { requireLang } from "@/site/context";
import { getPublicProfile, getPublicVideos } from "@/site/data";
import { basePath } from "@/site/i18n";
import { breadcrumbSchema, safeJson } from "@/site/schema";
import { alternatesFor, OG_LOCALE } from "@/site/seo";
import { fillText, pickText, thumbUrl, vlogText } from "@/site/vlog";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = requireLang((await params).lang);
  const videos = await getPublicVideos();
  if (videos.length === 0) return { robots: { index: false } };
  const profile = await getPublicProfile();
  const text = vlogText(lang);
  const alt = alternatesFor(lang, "/vlog");
  const title = text.title;
  const description = fillText(text.metaDescription, { name: profile?.display_name ?? BRAND.name });
  return {
    title,
    description,
    alternates: alt,
    openGraph: { title, description, url: alt.canonical, siteName: BRAND.name, locale: OG_LOCALE[lang], type: "website", images: [{ url: thumbUrl(videos[0].youtube_id) }] },
    twitter: { card: "summary_large_image", title, description, images: [thumbUrl(videos[0].youtube_id)] },
  };
}

export default async function VlogPage({ params }: Props) {
  const lang = requireLang((await params).lang);
  const base = basePath(lang);
  const text = vlogText(lang);
  const videos = await getPublicVideos();

  const jsonLd = [
    breadcrumbSchema([
      { name: BRAND.name, url: `${BRAND.siteUrl}${base || "/"}` },
      { name: text.title, url: alternatesFor(lang, "/vlog").canonical },
    ]),
  ];

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-20 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />
      <div>
        <h1 className="mp-display text-3xl font-bold text-[var(--mp-ink)] sm:text-4xl">{text.title}</h1>
        <p className="mt-2 text-base text-[var(--mp-ink2)]">{text.intro}</p>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-6 text-[var(--mp-ink2)]">{text.empty}</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const title = pickText(v, "title", lang);
            const desc = pickText(v, "desc", lang).split("\n")[0];
            return (
              <li key={v.id} className="overflow-hidden rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)]">
                <Link href={`${base}/vlog/${v.youtube_id}`} className="group block" aria-label={`${text.watch}: ${title}`}>
                  <div className="relative aspect-video bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbUrl(v.youtube_id)} alt="" loading={i < 3 ? "eager" : "lazy"} decoding="async" width={480} height={360} className="h-full w-full object-cover" />
                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--mp-accent)] shadow-lg transition group-hover:scale-105">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A0A0B"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 p-4">
                    <h2 className="text-lg font-extrabold leading-snug text-[var(--mp-ink)]">{title}</h2>
                    {desc ? <p className="line-clamp-2 text-sm text-[var(--mp-muted)]">{desc}</p> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
