import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LiteYouTube from "@/components/site/LiteYouTube";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { BRAND } from "@/site/brand";
import { requireLang } from "@/site/context";
import { getPublicListing, getPublicVideo, getPublicVideos } from "@/site/data";
import { whatsappUrl } from "@/site/format";
import { basePath } from "@/site/i18n";
import { breadcrumbSchema, safeJson } from "@/site/schema";
import { alternatesFor, OG_LOCALE } from "@/site/seo";
import { fillText, pickText, thumbUrl, videoSchema, vlogText, watchUrl } from "@/site/vlog";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; vid: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang, vid } = await params;
  const lang = requireLang(rawLang);
  const video = await getPublicVideo(vid);
  if (!video) return { robots: { index: false } };
  const title = pickText(video, "title", lang);
  const description = (pickText(video, "desc", lang) || title).replace(/\s+/g, " ").slice(0, 200);
  const alt = alternatesFor(lang, `/vlog/${video.youtube_id}`);
  return {
    title,
    description,
    alternates: alt,
    openGraph: { title, description, url: alt.canonical, siteName: BRAND.name, locale: OG_LOCALE[lang], type: "video.other", images: [{ url: thumbUrl(video.youtube_id) }] },
    twitter: { card: "summary_large_image", title, description, images: [thumbUrl(video.youtube_id)] },
  };
}

export default async function VideoPage({ params }: Props) {
  const { lang: rawLang, vid } = await params;
  const lang = requireLang(rawLang);
  const video = await getPublicVideo(vid);
  if (!video) notFound();

  const base = basePath(lang);
  const text = vlogText(lang);
  const title = pickText(video, "title", lang);
  const paragraphs = pickText(video, "desc", lang).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const listing = video.property_id ? await getPublicListing(video.property_id) : null;
  const others = (await getPublicVideos()).filter((v) => v.youtube_id !== video.youtube_id).slice(0, 3);

  const jsonLd = [
    videoSchema(video, lang),
    breadcrumbSchema([
      { name: BRAND.name, url: `${BRAND.siteUrl}${base || "/"}` },
      { name: text.title, url: alternatesFor(lang, "/vlog").canonical },
      { name: title, url: alternatesFor(lang, `/vlog/${video.youtube_id}`).canonical },
    ]),
  ];

  return (
    <main className="mx-auto flex max-w-[1000px] flex-col gap-6 px-4 pb-20 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--mp-muted)]">
        <Link href={`${base}/vlog`} className="underline hover:text-[var(--mp-accent)]">{text.all}</Link>
      </nav>

      <LiteYouTube id={video.youtube_id} title={title} playLabel={text.play} eager />

      <div className="flex flex-col gap-3">
        <h1 className="mp-display text-2xl font-bold leading-tight text-[var(--mp-ink)] sm:text-3xl">{title}</h1>
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line text-base leading-relaxed text-[var(--mp-ink2)]">{p}</p>
        ))}
        <div className="flex flex-wrap gap-3 pt-2">
          {listing ? (
            <Link href={`${base}/listing/${listing.listing.id}`} className="inline-flex min-h-12 items-center rounded-full bg-[var(--mp-accent)] px-5 text-sm font-extrabold text-[var(--mp-on-accent)]">
              {text.viewProperty}
            </Link>
          ) : null}
          <a href={whatsappUrl(fillText(text.whatsappMsg, { title }))} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--mp-whatsapp)] px-5 text-sm font-extrabold text-[var(--mp-on-whatsapp)]">
            <WhatsAppIcon />
            {text.whatsapp}
          </a>
          <a href={watchUrl(video.youtube_id)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-[var(--mp-line-strong)] px-5 text-sm font-bold text-[var(--mp-ink)] hover:border-[var(--mp-accent)]">
            {text.onYoutube}
          </a>
        </div>
      </div>

      {others.length > 0 && (
        <section className="pt-4">
          <h2 className="text-lg font-extrabold text-[var(--mp-ink)]">{text.moreVideos}</h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-3">
            {others.map((v) => (
              <li key={v.id}>
                <Link href={`${base}/vlog/${v.youtube_id}`} className="group block overflow-hidden rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl(v.youtube_id)} alt="" loading="lazy" decoding="async" width={480} height={360} className="aspect-video w-full object-cover" />
                  <span className="block p-3 text-sm font-bold text-[var(--mp-ink)]">{pickText(v, "title", lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
