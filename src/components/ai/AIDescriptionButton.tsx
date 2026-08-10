"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  listing: any;
};

export default function AIDescriptionButton({
  listing,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [description, setDescription] =
    useState("");

  const [error, setError] =
    useState("");

  async function generateDescription() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/ai/description",
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
            highlights:
              listing.highlights,
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
            "Failed to generate description."
        );
      }

      setDescription(
        data.description || ""
      );

    } catch (err: any) {
      console.error(
        "AI Description Error:",
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

  async function saveDescription() {
    if (!description.trim()) {
      setError(
        "Description cannot be empty."
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
            description:
              description.trim(),
          })
          .eq(
            "id",
            listing.id
          );

      if (error) {
        throw error;
      }

      window.location.reload();

    } catch (err: any) {
      console.error(
        "Save Description Error:",
        err
      );

      setError(
        err.message ||
          "Failed to save description."
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
        onClick={generateDescription}
        disabled={
          loading ||
          saving
        }
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
      >
        {loading
          ? "✨ Generating..."
          : "✨ Generate AI Description"}
      </button>

      {/* ERROR */}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* AI DESCRIPTION EDITOR */}

      {description && (
        <div className="mt-5 border rounded-lg bg-gray-50 p-5">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-bold text-black">
              AI Description
            </h3>

            <span className="text-sm text-gray-500">
              Review before saving
            </span>

          </div>

          <textarea
            rows={10}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="w-full border rounded px-4 py-3 text-black bg-white leading-7 resize-y"
          />

          {/* ACTIONS */}

          <div className="flex gap-3 mt-4">

            <button
              type="button"
              onClick={
                generateDescription
              }
              disabled={
                loading ||
                saving
              }
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
            >
              {loading
                ? "Generating..."
                : "↻ Regenerate"}
            </button>

            <button
              type="button"
              onClick={
                saveDescription
              }
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
            >
              {saving
                ? "Saving..."
                : "Save Description"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}