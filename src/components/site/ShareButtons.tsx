"use client";

import { useState } from "react";

export default function ShareButtons({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: { share: string; copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      return; // user closed the share sheet
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: nothing to do
    }
  }

  const base =
    "h-12 flex-1 rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] text-sm font-bold text-[var(--mp-ink)] hover:bg-[var(--mp-accent-soft)]";

  return (
    <div className="flex gap-2">
      <button type="button" onClick={share} className={base}>
        {labels.share}
      </button>
      <button type="button" onClick={copy} className={base} aria-live="polite">
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
