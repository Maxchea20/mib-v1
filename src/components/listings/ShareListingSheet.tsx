"use client";

import { useState } from "react";
import {
  buildBrochureBlob,
  downloadBlob,
  listingDisplayName,
  shareFiles,
} from "@/lib/shareListing";

type Props = {
  listing: any;
};

export default function ShareListingSheet({ listing }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseName = (listingDisplayName(listing) || "property")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  async function prepare() {
    setBusy("Preparing brochure PDF…");
    setError(null);
    setPdf(null);
    try {
      const pdfBlob = await buildBrochureBlob(listing);
      setPdf(new File([pdfBlob], `${baseName}.pdf`, { type: "application/pdf" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare the PDF.");
    } finally {
      setBusy(null);
    }
  }

  async function shareNow() {
    if (!pdf) return;
    try {
      const shared = await shareFiles(
        [pdf],
        listingDisplayName(listing),
        `${listingDisplayName(listing)} brochure`
      );
      if (!shared) downloadBlob(pdf, pdf.name);
    } catch {
      downloadBlob(pdf, pdf.name);
    }
  }

  function close() {
    if (busy) return;
    setOpen(false);
    setPdf(null);
    setError(null);
  }

  return (
    <>
      <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setOpen(true)}>
        Send PDF
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button className="absolute inset-0 bg-[#1c1917]/40" onClick={close} />
          <div className="relative w-full sm:max-w-md surface rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <p className="label-caption">Share listing</p>
            <h3 className="font-display text-2xl mt-1 text-[var(--ink)]">
              {listingDisplayName(listing)}
            </h3>
            <p className="text-sm text-[var(--ink-soft)] mt-2">
              Recipients get the PDF. They open it, tap a photo, then tap and hold
              to save that photo to their phone. Ask them to open the PDF in Files or Safari
              if WhatsApp preview does not make photos tappable.
            </p>

            {busy && <p className="mt-6 text-sm text-[var(--copper)]">{busy}</p>}
            {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

            {!busy && !pdf && (
              <button type="button" className="btn-primary w-full mt-5" onClick={prepare}>
                Prepare PDF
              </button>
            )}

            {!busy && pdf && (
              <button type="button" className="btn-primary w-full mt-5" onClick={shareNow}>
                Send PDF now
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
