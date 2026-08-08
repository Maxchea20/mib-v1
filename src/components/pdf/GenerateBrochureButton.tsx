"use client";
import type React from "react";
import { useState } from "react";
import {
  pdf,
  type DocumentProps,
} from "@react-pdf/renderer";

import ListingBrochure from "./ListingBrochure";

type Props = {
  listing: any;
};

export default function GenerateBrochureButton({
  listing,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function generateBrochure() {
    try {
      setLoading(true);

      const pdfDocument = (
        <ListingBrochure
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
        `${listing.title || "property"}-brochure.pdf`;

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(
        "Brochure generation failed:",
        error
      );

      alert(
        "Unable to generate brochure. Please try again."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <button
      type="button"
      onClick={generateBrochure}
      disabled={loading}
      className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {loading
        ? "Preparing PDF..."
        : "📄 Generate PDF"}
    </button>
  );
}