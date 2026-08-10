"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  listing: any;
};

export default function AIHighlightsButton({
  listing,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [suggestions, setSuggestions] =
    useState<string[]>([]);

  const [error, setError] =
    useState("");

  async function generateHighlights() {
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const response = await fetch(
        "/api/ai/highlights",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: listing.title,
            category: listing.category,
            purpose: listing.purpose,
            price: listing.price,
            area: listing.area,
            state: listing.state,
            land_size: listing.land_size,
            built_up: listing.built_up,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            residential_type:
              listing.residential_type,
            residential_storey:
              listing.residential_storey,
            commercial_type:
              listing.commercial_type,
            industrial_property_type:
              listing.industrial_property_type,
            industrial_zoning:
              listing.industrial_zoning,
            industrial_ceiling_height:
              listing.industrial_ceiling_height,
            industrial_power_supply:
              listing.industrial_power_supply,
            land_type:
              listing.land_type,
            tenure: listing.tenure,
            facing: listing.facing,
            description:
              listing.description,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to generate highlights."
        );
      }

      let parsed: string[] = [];

      try {
        parsed = JSON.parse(
          data.highlights
        );
      } catch {
        parsed = data.highlights
          .split("\n")
          .map(
            (item: string) =>
              item
                .replace(
                  /^[-•*✓]\s*/,
                  ""
                )
                .trim()
          )
          .filter(Boolean);
      }

      setSuggestions(parsed);
    } catch (err: any) {
      console.error(
        "AI Highlights Error:",
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

  function updateSuggestion(
    index: number,
    value: string
  ) {
    setSuggestions((current) =>
      current.map((item, i) =>
        i === index ? value : item
      )
    );
  }

  function removeSuggestion(
    index: number
  ) {
    setSuggestions((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  function addSuggestion() {
    setSuggestions((current) => [
      ...current,
      "",
    ]);
  }

  async function saveHighlights() {
    const cleaned =
      suggestions
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    if (cleaned.length === 0) {
      setError(
        "Please keep at least one highlight."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const { error } =
        await supabase
          .from("properties")
          .update({
            highlights: cleaned,
          })
          .eq("id", listing.id);

      if (error) {
        throw error;
      }

      window.location.reload();
    } catch (err: any) {
      console.error(
        "Save Highlights Error:",
        err
      );

      setError(
        err.message ||
          "Failed to save highlights."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">

      {/* GENERATE BUTTON */}

      <button
        type="button"
        onClick={generateHighlights}
        disabled={loading || saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
      >
        {loading
          ? "✨ Generating..."
          : "✨ Generate AI Highlights"}
      </button>

      {/* ERROR */}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* AI SUGGESTIONS */}

      {suggestions.length > 0 && (
        <div className="mt-5 border rounded-lg bg-gray-50 p-5">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-bold text-black">
              AI Suggestions
            </h3>

            <span className="text-sm text-gray-500">
              Review before saving
            </span>

          </div>

          <div className="space-y-3">

            {suggestions.map(
              (
                suggestion,
                index
              ) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >

                  <span className="text-blue-600 font-bold">
                    ✓
                  </span>

                  <input
                    type="text"
                    value={suggestion}
                    onChange={(e) =>
                      updateSuggestion(
                        index,
                        e.target.value
                      )
                    }
                    className="flex-1 border rounded px-3 py-2 text-black bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeSuggestion(
                        index
                      )
                    }
                    className="text-red-600 hover:text-red-800 px-2"
                    title="Remove"
                  >
                    ✕
                  </button>

                </div>
              )
            )}

          </div>

          {/* ADD */}

          <button
            type="button"
            onClick={addSuggestion}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Highlight
          </button>

          {/* SAVE */}

          <div className="mt-5">

            <button
              type="button"
              onClick={saveHighlights}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
            >
              {saving
                ? "Saving..."
                : "Save Highlights"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}