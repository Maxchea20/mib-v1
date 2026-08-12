"use client";

import { useEffect, useState } from "react";

type Props = {
  listing: any;
};

type AIDesign = {
  id: string;
  property_id: number;
  design_type: string;
  image_url: string;
  created_at: string;
};

export default function AIDesignTab({
  listing,
}: Props) {
  const [designs, setDesigns] =
    useState<AIDesign[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingDesigns, setLoadingDesigns] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadDesigns() {
    try {
      setLoadingDesigns(true);
      setError("");

      const response =
        await fetch(
          `/api/ai/property-designs?property_id=${listing.id}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to load AI designs."
        );
      }

      setDesigns(
        data.designs || []
      );

    } catch (error: any) {
      console.error(
        "AI DESIGN LOAD ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to load AI designs."
      );

    } finally {
      setLoadingDesigns(false);
    }
  }

  useEffect(() => {
    if (listing?.id) {
      loadDesigns();
    }
  }, [listing?.id]);

  async function generatePoster() {
    if (!listing || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/ai/property-poster",
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

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to generate AI poster."
        );
      }

      if (!data.image) {
        throw new Error(
          "AI did not return an image."
        );
      }

      /*
       * Poster has already been saved
       * to Supabase by the API.
       *
       * Reload the saved designs.
       */

      await loadDesigns();

    } catch (error: any) {
      console.error(
        "AI POSTER ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to generate AI poster."
      );

    } finally {
      setLoading(false);
    }
  }

  function downloadPoster(
    imageUrl: string,
    index: number
  ) {
    const link =
      document.createElement("a");

    link.href = imageUrl;

    link.download =
      `${listing?.title || "property"}-AI-poster-${index + 1}.png`;

    link.target = "_blank";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  }

  return (
    <div className="space-y-6">

      {/* ================================= */}
      {/* AI DESIGN HEADER */}
      {/* ================================= */}

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold text-black">
              🎨 AI Design
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              AI-generated marketing designs
              for this property.
            </p>

          </div>

          <button
            type="button"
            onClick={generatePoster}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold"
          >
            {loading
              ? "🎨 AI Designing..."
              : "🎨 Generate AI Poster"}
          </button>

        </div>

        {/* LOADING MESSAGE */}

        {loading ? (
          <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

            <p className="text-sm font-semibold text-purple-800">
              AI is designing this property...
            </p>

            <p className="text-xs text-purple-600 mt-1">
              Studying the listing information
              and actual property photographs.
              This may take about 1–2 minutes.
            </p>

          </div>
        ) : null}

        {/* ERROR */}

        {error ? (
          <div className="mt-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

      </div>

      {/* ================================= */}
      {/* GENERATED DESIGNS */}
      {/* ================================= */}

      <div>

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-lg font-bold text-black">
            Generated Designs
          </h3>

          {designs.length > 0 ? (
            <span className="text-sm text-gray-500">
              {designs.length} design
              {designs.length !== 1
                ? "s"
                : ""}
            </span>
          ) : null}

        </div>

        {/* LOADING */}

        {loadingDesigns ? (

          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            Loading AI designs...
          </div>

        ) : designs.length === 0 ? (

          /* EMPTY STATE */

          <div className="bg-white border rounded-xl p-12 text-center">

            <div className="text-5xl mb-4">
              🎨
            </div>

            <h3 className="font-bold text-lg text-black">
              No AI designs yet
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Generate the first marketing
              poster for this property.
            </p>

          </div>

        ) : (

          /* DESIGN GRID */

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {designs.map(
              (
                design,
                index
              ) => (

                <div
                  key={design.id}
                  className="bg-white border rounded-xl shadow-sm overflow-hidden"
                >

                  {/* POSTER */}

                  <div className="bg-gray-100">

                    <img
                      src={design.image_url}
                      alt={`AI property poster ${index + 1}`}
                      className="w-full h-auto block"
                    />

                  </div>

                  {/* FOOTER */}

                  <div className="p-4">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="font-semibold text-black">
                          AI Property Poster
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            design.created_at
                          ).toLocaleString()}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          downloadPoster(
                            design.image_url,
                            index
                          )
                        }
                        className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium whitespace-nowrap"
                      >
                        ⬇ Download
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}