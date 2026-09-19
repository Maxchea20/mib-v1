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

export default function ShareListingSheet({ listing }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const baseName = (listingDisplayName(listing) || "property")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  async function sendBoth() {
    setBusy("Preparing PDF and photo…");
    try {
      const [pdfBlob, imageBlob] = await Promise.all([
        buildBrochureBlob(listing),
        buildShareCardBlob(listing),
      ]);
      const files = [
        new File([pdfBlob], `${baseName}.pdf`, { type: "application/pdf" }),
        new File([imageBlob], `${baseName}.jpg`, { type: "image/jpeg" }),
      ];
      const shared = await shareFiles(
        files,
        listingDisplayName(listing),
        `${listingDisplayName(listing)} — PDF + photo from MIB`
      );
      if (!shared) {
        downloadBlob(pdfBlob, `${baseName}.pdf`);
        downloadBlob(imageBlob, `${baseName}.jpg`);
      }
      setOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Share failed.");
    } finally {
      setBusy(null);
    }
  }

  async function savePhoto() {
    setBusy("Creating photo…");
    try {
      const imageBlob = await buildShareCardBlob(listing);
      const file = new File([imageBlob], `${baseName}.jpg`, { type: "image/jpeg" });
      const shared = await shareFiles(
        [file],
        listingDisplayName(listing),
        "Save this listing photo"
      );
      if (!shared) downloadBlob(imageBlob, `${baseName}.jpg`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Photo failed.");
    } finally {
      setBusy(null);
    }
  }

  async function sendPdf() {
    setBusy("Creating PDF…");
    try {
      const pdfBlob = await buildBrochureBlob(listing);
      const file = new File([pdfBlob], `${baseName}.pdf`, { type: "application/pdf" });
      const shared = await shareFiles([file], listingDisplayName(listing), "Listing brochure");
      if (!shared) downloadBlob(pdfBlob, `${baseName}.pdf`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "PDF failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => setOpen(true)}>
        Send PDF + photo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button
            className="absolute inset-0 bg-[#1c1917]/40"
            onClick={() => !busy && setOpen(false)}
          />
          <div className="relative w-full sm:max-w-md surface rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <p className="label-caption">Share listing</p>
            <h3 className="font-display text-2xl mt-1">{listingDisplayName(listing)}</h3>
            <p className="text-sm text-[var(--ink-soft)] mt-2">
              iPhone can send both files through the share sheet. Recipients can save the photo
              to Camera Roll and keep the PDF.
            </p>

            {busy ? (
              <p className="mt-6 text-sm text-[var(--copper)]">{busy}</p>
            ) : (
              <div className="mt-5 space-y-3">
                <button type="button" className="btn-primary w-full" onClick={sendBoth}>
                  Send PDF + saveable photo
                </button>
                <button type="button" className="btn-secondary w-full" onClick={savePhoto}>
                  Save / send photo only
                </button>
                <button type="button" className="btn-secondary w-full" onClick={sendPdf}>
                  Send PDF only
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
