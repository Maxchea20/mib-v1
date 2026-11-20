"use client";

import { useState } from "react";
import { embedUrl, thumbUrl } from "@/site/vlog";

/*
| A YouTube video that loads only when tapped. Until then it is just the
| thumbnail from YouTube (no YouTube script runs and nothing is stored on
| MIB's own storage). The player is YouTube's privacy-friendly address.
*/
export default function LiteYouTube({ id, title, playLabel, eager = false }: { id: string; title: string; playLabel: string; eager?: boolean }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--mp-line-strong)] bg-black">
      {playing ? (
        <iframe
          src={embedUrl(id, true)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${playLabel}: ${title}`} className="group absolute inset-0 block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbUrl(id)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" width={480} height={360} />
          <span aria-hidden="true" className="absolute inset-0 bg-black/25 transition group-hover:bg-black/10" />
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--mp-accent)] shadow-lg">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#0A0A0B"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
