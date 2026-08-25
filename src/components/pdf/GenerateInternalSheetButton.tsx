"use client";

import type React from "react";
import { useState } from "react";
import {
  pdf,
  type DocumentProps,
} from "@react-pdf/renderer";

import InternalListingSheet from "./InternalListingSheet";

type Props = {
  listing: any;
};

export default function GenerateInternalSheetButton({
  listing,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function generateInternalSheet() {
    try {
      setLoading(true);

      const pdfDocument = (
        <InternalListingSheet
          listing={listing}
        />
      ) as React.ReactElement<DocumentProps>;

      const blob = await pdf(
        pdfDocument
      ).toBlob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;

      link.download =
        `${listing.title || "property"}-internal-sheet.pdf`;

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(
        "Internal Sheet generation failed:",
        error
      );

      alert(
        "Unable to generate internal sheet. Please try again."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <button
      type="button"
      onClick={generateInternalSheet}
      disabled={loading}
      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {loading
        ? "Preparing PDF..."
        : "📋 Info Sheet"}
    </button>
  );
}