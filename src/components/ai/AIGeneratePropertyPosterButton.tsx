"use client";

import { useState } from "react";

type Props = {
  listing: any;
  onComplete?: () => void;
};

export default function AIGeneratePropertyPosterButton({
  listing,
  onComplete,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [posterUrl, setPosterUrl] =
    useState("");

  async function generatePoster() {
    if (!listing || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setPosterUrl("");

    try {
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
            "Failed to generate AI property poster."
        );
      }

      if (!data.image) {
        throw new Error(
          "AI did not return a poster image."
        );
      }

      const base64Data =
  data.image.includes(",")
    ? data.image.split(",")[1]
    : data.image;

const binaryString =
  window.atob(base64Data);

const bytes =
  new Uint8Array(
    binaryString.length
  );

for (
  let i = 0;
  i < binaryString.length;
  i++
) {
  bytes[i] =
    binaryString.charCodeAt(i);
}

const blob =
  new Blob(
    [bytes],
    {
      type: "image/png",
    }
  );

const objectUrl =
  URL.createObjectURL(blob);

setPosterUrl(objectUrl);

      /*
       * Close the 3-dot menu after
       * successful generation.
       */
      onComplete?.();
    } catch (err: any) {
      console.error(
        "AI Property Poster Error:",
        err
      );

      setError(
        err?.message ||
          "Failed to generate AI property poster."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadPoster() {
    if (!posterUrl) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = posterUrl;

    link.download =
      `${listing?.title || "property"}-AI-poster.png`;

    document.body.appendChild(link);

    link.click();

    link.remove();
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={generatePoster}
        disabled={loading}
        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "🎨 AI Designing..."
          : "🎨 Generate AI Property Poster"}
      </button>

      {error ? (
        <div className="mt-2 mx-2 p-3 rounded border border-red-300 bg-red-50 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      {posterUrl ? (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">

            {/* HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="font-bold text-lg text-black">
                  AI Property Poster
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Generated from the actual
                  listing and property photos.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPosterUrl("")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            {/* POSTER */}

            <div className="flex-1 overflow-auto bg-gray-100 p-5 flex justify-center">
              <img
                src={posterUrl}
                alt="AI generated property poster"
                className="max-w-full max-h-[75vh] w-auto h-auto object-contain shadow-xl"
              />
            </div>

            {/* FOOTER */}

            <div className="px-5 py-4 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setPosterUrl("")
                }
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={downloadPoster}
                className="px-5 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                ⬇️ Download Poster
              </button>
            </div>

          </div>
        </div>
      ) : null}
    </div>
  );
}