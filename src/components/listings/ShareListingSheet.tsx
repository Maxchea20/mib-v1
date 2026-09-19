"use client";

import { useState } from "react";
import {
  buildBrochureBlob,
  buildShareCardBlob,
  downloadBlob,
  listingDisplayName,
  shareFiles,
} from "@/lib/shareListing";

type Props = {
  listing: any;
};

type ReadyFiles = {
  pdf: File;
  photo: File;
};

export default function ShareListingSheet({ listing }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyFiles | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseName = (listingDisplayName(listing) || "property")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  async function prepare() {
    setBusy("Preparing PDF and photo…");
    setError(null);
    setReady(null);
    try {
      const [pdfBlob, imageBlob] = await Promise.all([
        buildBrochureBlob(listing),
        buildShareCardBlob(listing),
      ]);
      setReady({
        pdf: new File([pdfBlob], `${baseName}.pdf`, { type: "application/pdf" }),
        photo: new File([imageBlob], `${baseName}.jpg`, { type: "image/jpeg" }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare files.");
    } finally {
      setBusy(null);
    }
  }

  async function shareNow(which: "both" | "photo" | "pdf") {
    if (!ready) return;
    const files =
      which === "both"
        ? [ready.pdf, ready.photo]
        : which === "photo"
        ? [ready.photo]
        : [ready.pdf];
    try {
      const shared = await shareFiles(
        files,
        listingDisplayName(listing),
        `${listingDisplayName(listing)} from MIB`
      );
      if (!shared) {
        files.forEach((file) => downloadBlob(file, file.name));
      }
    } catch (err) {
      files.forEach((file) => downloadBlob(file, file.name));
      setError(
        err instanceof Error
          ? err.message
          : "Share sheet unavailable. Files were downloaded instead."
      );
    }
  }

  function close() {
    if (busy) return;
    setOpen(false);
    setReady(null);
    setError(null);
  }

  return (
    <>
      <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setOpen(true)}>
        Send PDF + photo
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
              iPhone needs two taps: prepare the files first, then share.
            </p>

            {busy && <p className="mt-6 text-sm text-[var(--copper)]">{busy}</p>}
            {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

            {!busy && !ready && (
              <button type="button" className="btn-primary w-full mt-5" onClick={prepare}>
                Prepare PDF + photo
              </button>
            )}

            {!busy && ready && (
              <div className="mt-5 space-y-3">
                <button type="button" className="btn-primary w-full" onClick={() => shareNow("both")}>
                  Share PDF + photo now
                </button>
                <button type="button" className="btn-secondary w-full" onClick={() => shareNow("photo")}>
                  Share / save photo only
                </button>
                <button type="button" className="btn-secondary w-full" onClick={() => shareNow("pdf")}>
                  Share PDF only
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
