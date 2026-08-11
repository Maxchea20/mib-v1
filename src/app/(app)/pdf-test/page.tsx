"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PDFTestPage() {
  const [listing, setListing] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      const { data, error } = await supabase
  .from("properties")
  .select(`
    *,
    property_photos (
      id,
      image_url,
      photo_type
    )
  `)
  .eq("listing_agent", "Max")
  .limit(1)
  .single();

      if (error) {
        setError(error.message);
        return;
      }

      setListing(data);
    }

    loadListing();
  }, []);

  async function generatePlan() {
    if (!listing) {
      setError("No Max listing found.");
      return;
    }

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch(
        "/api/ai/pdf-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listing,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to generate PDF design plan."
        );
      }

      setPlan(data.plan);
    } catch (err: any) {
      console.error(
        "PDF Plan Test Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold text-black mb-2">
        AI PDF Design Plan Test
      </h1>

      <p className="text-gray-500 mb-8">
        Temporary testing page — Phase 10.6.2
      </p>

      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {listing && (
        <div className="bg-white border rounded-lg p-6 mb-6">

          <h2 className="text-xl font-bold text-black">
            {listing.title}
          </h2>

          <p className="text-gray-600 mt-2">
            {listing.area || "-"}
          </p>

          <p className="text-2xl font-bold text-green-600 mt-3">
            RM{" "}
            {Number(
              listing.price
            ).toLocaleString()}
          </p>

          <div className="mt-4 text-sm text-gray-600">
            Category: {listing.category || "-"}
          </div>

          <button
            type="button"
            onClick={generatePlan}
            disabled={loading}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
          >
            {loading
              ? "🤖 Analysing Listing..."
              : "✨ Generate AI Design Plan"}
          </button>

        </div>
      )}

      {!listing && !error && (
        <p className="text-gray-500">
          Loading Max's listing...
        </p>
      )}

      {plan && (
        <div className="bg-slate-900 rounded-lg p-6">

          <h2 className="text-xl font-bold text-white mb-4">
            AI Design Plan
          </h2>

          <pre className="text-green-300 text-sm whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(
              plan,
              null,
              2
            )}
          </pre>

        </div>
      )}

    </div>
  );
}