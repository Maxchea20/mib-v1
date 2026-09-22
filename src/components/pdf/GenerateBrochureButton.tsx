"use client";

import type React from "react";
import { useState } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";

import ListingBrochure from "./ListingBrochure";
import type { Listing } from "./listingTypes";
import { uploadBrochurePdf } from "@/lib/brochureStorage";

type Props = {
  listing: Listing;
  /** Called with the new URL after a (re)generate, so the parent can update its cached listing. */
  onGenerated?: (pdfUrl: string) => void;
};

async function renderPdfBlob(listing: Listing): Promise<Blob> {
  /*
   * Cobroke Agent info is INTERNAL ONLY — never shown in the
   * generated brochure. If handled by a Cobroke Agent, the PDF
   * still shows MAX CHEA as the listing agent.
   */
  const pdfListing: Listing = {
    ...listing,
    listing_agent: listing.listing_agent === "Cobroke Agent" ? "MAX CHEA" : listing.listing_agent,
    cobroke_agent_name: undefined,
  };

  const pdfDocument = (
    <ListingBrochure listing={pdfListing} />
  ) as React.ReactElement<DocumentProps>;

  return pdf(pdfDocument).toBlob();
}

async function shareOrDownload(blob: Blob, listing: Listing, pdfUrl: string) {
  const fileName = `${listing.title || "property"}-brochure.pdf`;

  // Download the PDF, then hand off a WhatsApp link the person can
  // send manually. (navigator.share was removed: it only works when
  // called synchronously inside the click handler, and the awaits
  // for generation/upload above break that — the browser rejects it
  // with "Must be handling a user gesture" once those finish.)
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = fileName;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  const waText = encodeURIComponent(`${listing.title || "Property listing"}\n${pdfUrl}`);
  window.open(`https://wa.me/?text=${waText}`, "_blank");
}

export default function GenerateBrochureButton({ listing, onGenerated }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    try {
      setLoading(true);

      // Already generated for this listing — reuse it, no regeneration.
      if (listing.brochure_url) {
        const res = await fetch(listing.brochure_url);
        const blob = await res.blob();
        await shareOrDownload(blob, listing, listing.brochure_url);
        return;
      }

      const blob = await renderPdfBlob(listing);
      const pdfUrl = await uploadBrochurePdf(listing.id, blob);
      onGenerated?.(pdfUrl);
      await shareOrDownload(blob, listing, pdfUrl);
    } catch (error) {
      console.error("Brochure send failed:", error);
      alert(error instanceof Error ? error.message : "Unable to send brochure. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    try {
      setLoading(true);
      const blob = await renderPdfBlob(listing);
      const pdfUrl = await uploadBrochurePdf(listing.id, blob);
      onGenerated?.(pdfUrl);
      await shareOrDownload(blob, listing, pdfUrl);
    } catch (error) {
      console.error("Brochure regenerate failed:", error);
      alert(error instanceof Error ? error.message : "Unable to regenerate brochure. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        {loading ? "Working..." : listing.brochure_url ? "📄 Download PDF" : "📄 Generate PDF"}
      </button>
      {listing.brochure_url ? (
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading}
          className="w-full text-left px-4 py-3 text-xs text-gray-500 hover:bg-gray-100"
        >
          ↻ Regenerate PDF
        </button>
      ) : null}
    </>
  );
}