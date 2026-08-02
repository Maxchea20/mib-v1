"use client";

import { useState } from "react";

type Props = {
  details: React.ReactNode;
  gallery: React.ReactNode;
};

export default function ListingTabs({
  details,
  gallery,
}: Props) {

  const [tab, setTab] = useState<"details" | "gallery">(
    "details"
  );

  return (
    <div>

      <div className="bg-white rounded-xl shadow border mb-6">

        <div className="flex">

          <button
            onClick={() => setTab("details")}
            className={`px-8 py-4 font-semibold transition-all border-b-4 ${
              tab === "details"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            📋 Property Details
          </button>

          <button
            onClick={() => setTab("gallery")}
            className={`px-8 py-4 font-semibold transition-all border-b-4 ${
              tab === "gallery"
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:bg-gray-50"
            }`}
          >
            📷 Property Gallery
          </button>

        </div>

      </div>

      {tab === "details"
        ? details
        : gallery}

    </div>
  );
}