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
  aiPlan?: any;
};

export default function GenerateBrochureButton({
  listing,
  aiPlan,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function generateBrochure() {
    try {
      setLoading(true);

      /*
       * =========================================
       * STEP 1
       * GET AI PDF DESIGN PLAN
       * =========================================
       */

      let designPlan = aiPlan;

      if (!designPlan) {
        const planResponse = await fetch(
          "/api/ai/pdf-plan",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              listing,
            }),
          }
        );

        const planData =
          await planResponse.json();

        if (
          !planResponse.ok ||
          !planData.success
        ) {
          throw new Error(
            planData.error ||
              "Failed to generate AI PDF design plan."
          );
        }

        designPlan =
          planData.plan;
      }

      /*
       * =========================================
       * STEP 2
       * CREATE PDF USING AI DESIGN PLAN
       * =========================================
       */

      const pdfDocument = (
        <ListingBrochure
          listing={listing}
          aiPlan={designPlan}
        />
      ) as React.ReactElement<DocumentProps>;

      /*
       * =========================================
       * STEP 3
       * GENERATE PDF BLOB
       * =========================================
       */

      const blob = await pdf(
        pdfDocument
      ).toBlob();

      /*
       * =========================================
       * STEP 4
       * DOWNLOAD PDF
       * =========================================
       */

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `${listing.title || "property"}-brochure.pdf`;

      window.document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Brochure generation failed:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to generate brochure. Please try again."
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
        ? "🤖 Designing PDF..."
        : "📄 Generate PDF"}
    </button>
  );
}