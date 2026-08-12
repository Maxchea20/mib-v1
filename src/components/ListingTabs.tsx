"use client";

import { useState } from "react";

type Props = {
  details: React.ReactNode;
  gallery: React.ReactNode;
  aiDesign: React.ReactNode;
};

export default function ListingTabs({
  details,
  gallery,
  aiDesign,
}: Props) {
  const [tab, setTab] = useState<
    "details" | "gallery" | "ai"
  >("details");

  return (
    <div>

      {/* ================================= */}
      {/* TAB NAVIGATION */}
      {/* ================================= */}

      <div className="bg-white rounded-xl shadow border mb-6">

        <div className="flex overflow-x-auto">

          {/* PROPERTY DETAILS */}

          <button
            type="button"
            onClick={() =>
              setTab("details")
            }
            className={`px-8 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
              tab === "details"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            📋 Property Details
          </button>

          {/* PROPERTY GALLERY */}

          <button
            type="button"
            onClick={() =>
              setTab("gallery")
            }
            className={`px-8 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
              tab === "gallery"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            📷 Property Gallery
          </button>

          {/* AI DESIGN */}

          <button
            type="button"
            onClick={() =>
              setTab("ai")
            }
            className={`px-8 py-4 font-semibold transition-all border-b-4 whitespace-nowrap ${
              tab === "ai"
                ? "border-purple-600 text-purple-600 bg-purple-50"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            🎨 AI Design
          </button>

        </div>

      </div>

      {/* ================================= */}
      {/* TAB CONTENT */}
      {/* ================================= */}

      {tab === "details" && details}

      {tab === "gallery" && gallery}

      {tab === "ai" && aiDesign}

    </div>
  );
}