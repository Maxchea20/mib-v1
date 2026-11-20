"use client";

import type { ImgHTMLAttributes } from "react";
import { mediumUrlFor, thumbUrlFor } from "@/lib/photoSize";

/*
| Shows the small version of a listing photo (about 25 KB instead of 3 to 5 MB), or
| with size="medium" the mid-size version (about 100 to 150 KB, for the big photo).
| If that version does not exist yet (older photos), it falls back to the full
| photo once, so nothing ever shows broken.
*/
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; size?: "thumb" | "medium" };

export default function ThumbImg({ src, alt = "", size = "thumb", ...rest }: Props) {
  const thumb = size === "medium" ? mediumUrlFor(src) : thumbUrlFor(src);

  const fallBack = (el: HTMLImageElement) => {
    if (el.dataset.fallback === "1") return;
    el.dataset.fallback = "1";
    el.src = src;
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...rest}
      alt={alt}
      src={thumb ?? src}
      // the picture can fail before React is ready to listen, so check once it is attached too
      ref={(el) => {
        if (el && thumb && el.complete && el.naturalWidth === 0) fallBack(el);
      }}
      onError={(e) => thumb && fallBack(e.currentTarget)}
    />
  );
}
