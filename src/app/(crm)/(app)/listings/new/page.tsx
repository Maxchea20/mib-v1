"use client";

import { useState } from "react";
import ListingForm from "@/components/ListingForm";
import MediaManager from "@/components/media/MediaManager";

export default function AddListingPage() {
  const [propertyId, setPropertyId] =
    useState<number | null>(null);

  const [category, setCategory] =
    useState("Residential");

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Add Listing
      </h1>

      <ListingForm
        mode="create"
        onCreated={(id, selectedCategory) => {
          setPropertyId(id);
          setCategory(selectedCategory);
        }}
      />

      {propertyId && (
  <>
    <MediaManager
      propertyId={propertyId}
      category={category}
    />

    <div className="mt-8 flex justify-end">
      <button
        onClick={() => {
          window.location.href = "/listings";
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        ✅ Done
      </button>
    </div>
  </>
)}

    </div>
  );
}