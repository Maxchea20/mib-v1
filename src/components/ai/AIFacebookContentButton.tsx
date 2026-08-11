"use client";

import { useState } from "react";

type Props = {
  listing: any;
};

export default function AIFacebookContentButton({
  listing,
}: Props) {
  const [platform, setPlatform] =
    useState("profile");

  const [loading, setLoading] =
    useState(false);

  const [content, setContent] =
    useState("");

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  async function generateContent() {
    setLoading(true);
    setError("");
    setContent("");
    setCopied(false);

    try {
      const response = await fetch(
        "/api/ai/facebook",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            platform,

            title: listing.title,
            category: listing.category,
            purpose: listing.purpose,
            price: listing.price,
            area: listing.area,
            state: listing.state,

            land_size:
              listing.land_size,

            built_up:
              listing.built_up,

            bedrooms:
              listing.bedrooms,

            bathrooms:
              listing.bathrooms,

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

            tenure:
              listing.tenure,

            facing:
              listing.facing,

            highlights:
              listing.highlights,

            description:
              listing.description,
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
            "Failed to generate Facebook content."
        );
      }

      setContent(
        data.content || ""
      );

    } catch (err: any) {
      console.error(
        "AI Facebook Content Error:",
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

  async function copyContent() {
    if (!content.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error(
        "Copy Error:",
        err
      );

      setError(
        "Failed to copy content."
      );
    }
  }

  return (
    <div className="mt-6 border rounded-lg bg-white p-6 shadow-sm">

      {/* HEADER */}

      <div className="mb-5">

        <h2 className="text-2xl font-bold text-black">
          📣 AI Facebook Content
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Generate platform-specific Facebook
          marketing content from this listing.
        </p>

      </div>


      {/* PLATFORM */}

      <div className="mb-4">

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform
        </label>

        <select
          value={platform}
          onChange={(e) => {
            setPlatform(e.target.value);
            setContent("");
            setCopied(false);
          }}
          disabled={loading}
          className="w-full md:w-80 border rounded px-3 py-2 text-black bg-white"
        >

          <option value="profile">
            Facebook Profile
          </option>

          <option value="page">
            Facebook Page
          </option>

          <option value="group">
            Facebook Group
          </option>

          <option value="marketplace">
            Facebook Marketplace
          </option>

        </select>

      </div>


      {/* GENERATE */}

      <button
        type="button"
        onClick={generateContent}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
      >

        {loading
          ? "✨ Generating..."
          : "✨ Generate Facebook Content"}

      </button>


      {/* ERROR */}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}


      {/* CONTENT EDITOR */}

      {content && (

        <div className="mt-5 border rounded-lg bg-gray-50 p-5">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-bold text-black">
              Generated Content
            </h3>

            <span className="text-sm text-gray-500">
              Review and edit before posting
            </span>

          </div>


          <textarea
            rows={14}
            value={content}
            onChange={(e) =>
              setContent(
                e.target.value
              )
            }
            className="w-full border rounded px-4 py-3 text-black bg-white leading-7 resize-y"
          />


          {/* ACTIONS */}

          <div className="flex gap-3 mt-4">

            <button
              type="button"
              onClick={generateContent}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
            >

              {loading
                ? "Generating..."
                : "↻ Regenerate"}

            </button>


            <button
              type="button"
              onClick={copyContent}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium"
            >

              {copied
                ? "✓ Copied"
                : "📋 Copy"}

            </button>

          </div>

        </div>

      )}

    </div>
  );
}