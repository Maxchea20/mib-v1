"use client";

import { useState } from "react";

export default function VideoTestPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function generateVideo() {
    if (!imageUrl.trim()) {
      setError("Please paste a property image URL first.");
      return;
    }

    setLoading(true);
    setError("");
    setVideoId("");
    setStatus("");

    try {
      const response = await fetch(
        "/api/ai/property-video",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
  propertyId: 33,
  imageUrl: imageUrl.trim(),
}),
        }
      );

      const responseText = await response.text();

      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Server returned an invalid response (${response.status}).`
          );
        }
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            `Failed to create video (${response.status}).`
        );
      }

      setVideoId(data.videoId || "");
      setStatus(data.status || "queued");

    } catch (error: any) {
      console.error(
        "VIDEO TEST ERROR:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  }

  function clearTest() {
    setImageUrl("");
    setVideoId("");
    setStatus("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border p-6">

          <h1 className="text-3xl font-bold text-black">
            🎬 Sora 2 Video Test
          </h1>

          <p className="text-gray-500 mt-2">
            Generate a 4-second AI video from one
            real property photograph.
          </p>

        </div>

        {/* INPUT */}

        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Property Image URL
          </label>

          <input
            type="text"
            value={imageUrl}
            onChange={(e) =>
              setImageUrl(e.target.value)
            }
            placeholder="Paste the Supabase property image URL here..."
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* IMAGE PREVIEW */}

          {imageUrl.trim() && (
            <div className="mt-5">

              <p className="text-sm font-semibold text-gray-700 mb-2">
                Image Preview
              </p>

              <div className="bg-gray-100 rounded-lg p-3 flex justify-center">

                <img
                  src={imageUrl}
                  alt="Property preview"
                  className="max-h-[500px] max-w-full object-contain rounded"
                  onError={() =>
                    setError(
                      "Unable to load this image URL."
                    )
                  }
                />

              </div>

            </div>
          )}

          {/* BUTTONS */}

          <div className="flex gap-3 mt-6">

            <button
              type="button"
              onClick={generateVideo}
              disabled={loading}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading
                ? "🎬 Creating Sora Video..."
                : "🎬 Generate Video"}
            </button>

            <button
              type="button"
              onClick={clearTest}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
            >
              Clear
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-300 text-red-700">

              <p className="font-semibold">
                Error
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>

            </div>
          )}

        </div>

        {/* RESULT */}

        {videoId && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">

            <h2 className="text-xl font-bold text-black">
              🎥 Video Job Created
            </h2>

            <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4">

              <p className="text-sm font-semibold text-green-800">
                Sora is processing the video.
              </p>

              <div className="mt-3">

                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="font-semibold text-black">
                  {status}
                </p>

              </div>

              <div className="mt-3">

                <p className="text-xs text-gray-500">
                  Video ID
                </p>

                <p className="text-sm font-mono text-black break-all">
                  {videoId}
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}