"use client";

import { useState } from "react";

export default function Gallery({
  images,
  alt,
  labels,
}: {
  images: string[];
  alt: string;
  labels: { prev: string; next: string; counter: string };
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-[var(--mp-accent-soft)] text-sm font-semibold text-[var(--mp-muted)]">
        {alt}
      </div>
    );
  }

  const go = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--mp-accent-soft)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${alt} (${index + 1}/${images.length})`}
          className="aspect-[16/10] w-full object-cover"
          loading={index === 0 ? "eager" : "lazy"}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={labels.prev}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--mp-line-strong)] bg-[rgba(10,10,11,0.85)] text-[var(--mp-accent)] shadow"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={labels.next}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--mp-line-strong)] bg-[rgba(10,10,11,0.85)] text-[var(--mp-accent)] shadow"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded-full border border-[var(--mp-accent)] bg-[rgba(10,10,11,0.85)] px-3 py-1 text-xs font-bold text-[var(--mp-accent)]">
              {labels.counter.replace("{i}", String(index + 1)).replace("{n}", String(images.length))}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={labels.counter.replace("{i}", String(i + 1)).replace("{n}", String(images.length))}
              aria-current={i === index}
              className={`h-16 w-24 flex-none overflow-hidden rounded-lg border-2 ${
                i === index ? "border-[var(--mp-accent)]" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
