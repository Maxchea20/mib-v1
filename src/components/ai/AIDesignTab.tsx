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

type AIVideo = {
  id: string;
  property_id: number;
  video_id: string;
  status: string;
  progress: number;
  video_url?: string | null;
  created_at: string;
  completed_at?: string | null;
  error_message?: string | null;
};

export default function AIDesignTab({
  listing,
}: Props) {

  const [designs, setDesigns] =
    useState<AIDesign[]>([]);

  const [videos, setVideos] =
    useState<AIVideo[]>([]);

  const [loadingDesigns, setLoadingDesigns] =
    useState(true);

  const [loadingVideos, setLoadingVideos] =
    useState(true);

  const [loadingPoster, setLoadingPoster] =
    useState(false);

  const [generatingVideo, setGeneratingVideo] =
    useState(false);

  const [deletingVideoId, setDeletingVideoId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD DESIGNS
  |--------------------------------------------------------------------------
  */

  async function loadDesigns() {
    if (!listing?.id) {
      return;
    }

    try {
      setLoadingDesigns(true);

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

  /*
  |--------------------------------------------------------------------------
  | LOAD VIDEOS
  |--------------------------------------------------------------------------
  */

  async function loadVideos() {
    if (!listing?.id) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/ai/property-video?property_id=${listing.id}`,
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
            "Failed to load AI videos."
        );
      }

      setVideos(
        data.videos || []
      );

    } catch (error: any) {
      console.error(
        "AI VIDEO LOAD ERROR:",
        error
      );

    } finally {
      setLoadingVideos(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!listing?.id) {
      return;
    }

    loadDesigns();
    loadVideos();

  }, [listing?.id]);

  /*
  |--------------------------------------------------------------------------
  | AUTO POLLING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!listing?.id) {
      return;
    }

    const hasProcessingVideo =
      videos.some(
        (video) =>
          video.status === "queued" ||
          video.status === "in_progress"
      );

    if (!hasProcessingVideo) {
      return;
    }

    const timer =
      setTimeout(() => {
        loadVideos();
      }, 10000);

    return () => {
      clearTimeout(timer);
    };

  }, [
    listing?.id,
    videos,
  ]);

  /*
  |--------------------------------------------------------------------------
  | GENERATE POSTER
  |--------------------------------------------------------------------------
  */

  async function generatePoster() {
    if (
      !listing ||
      loadingPoster ||
      generatingVideo
    ) {
      return;
    }

    try {
      setLoadingPoster(true);
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
      setLoadingPoster(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET FIRST PROPERTY PHOTO
  |--------------------------------------------------------------------------
  */

  function getVideoPhotoUrl() {
    const photos =
      Array.isArray(
        listing?.property_photos
      )
        ? listing.property_photos
        : [];

    const usablePhoto =
      photos.find(
        (photo: any) =>
          typeof photo?.image_url ===
            "string" &&
          photo.image_url.trim() !== ""
      );

    return (
      usablePhoto?.image_url ||
      ""
    );
  }

  /*
  |--------------------------------------------------------------------------
  | GENERATE VIDEO
  |--------------------------------------------------------------------------
  */

  async function generateVideo() {
    if (
      !listing ||
      generatingVideo ||
      loadingPoster
    ) {
      return;
    }

    try {
      setGeneratingVideo(true);
      setError("");

      const imageUrl =
        getVideoPhotoUrl();

      if (!imageUrl) {
        throw new Error(
          "This property does not have a usable property photo."
        );
      }

      const response =
        await fetch(
          "/api/ai/property-video",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              propertyId:
                listing.id,

              imageUrl:
                imageUrl,
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
            "Failed to create AI video."
        );
      }

      await loadVideos();

    } catch (error: any) {
      console.error(
        "AI VIDEO ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to generate AI video."
      );

    } finally {
      setGeneratingVideo(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE VIDEO
  |--------------------------------------------------------------------------
  */

  async function deleteVideo(
    video: AIVideo
  ) {
    const confirmed =
      window.confirm(
        "Delete this AI video?\n\nThis will permanently delete the video from Supabase Storage and remove its database record.\n\nThis cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingVideoId(
        video.id
      );

      setError("");

      console.log(
        "AI VIDEO DELETE:",
        video.id
      );

      const response =
        await fetch(
          "/api/ai/property-video",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: video.id,
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
            "Failed to delete AI video."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | REMOVE FROM UI IMMEDIATELY
      |--------------------------------------------------------------------------
      */

      setVideos(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              video.id
          )
      );

      console.log(
        "AI VIDEO DELETE: SUCCESS"
      );

    } catch (error: any) {
      console.error(
        "AI VIDEO DELETE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to delete AI video."
      );

    } finally {
      setDeletingVideoId(
        null
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD POSTER
  |--------------------------------------------------------------------------
  */

  function downloadPoster(
    imageUrl: string,
    index: number
  ) {
    const link =
      document.createElement("a");

    link.href =
      imageUrl;

    link.download =
      `${listing?.title || "property"}-AI-poster-${index + 1}.png`;

    link.target =
      "_blank";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE DESIGN
  |--------------------------------------------------------------------------
  */

  async function deleteDesign(
    designId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this AI design?\n\nThe poster will be permanently removed."
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response =
        await fetch(
          "/api/ai/property-designs",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: designId,
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
            "Failed to delete AI design."
        );
      }

      setDesigns(
        (current) =>
          current.filter(
            (design) =>
              design.id !==
              designId
          )
      );

    } catch (error: any) {
      console.error(
        "AI DESIGN DELETE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Failed to delete AI design."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold text-black">
              🎨 AI Design
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              AI-generated marketing designs
              and videos for this property.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                generatePoster
              }
              disabled={
                loadingPoster ||
                generatingVideo
              }
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold"
            >
              {loadingPoster
                ? "🎨 AI Designing..."
                : "🎨 Generate AI Poster"}
            </button>

            <button
              type="button"
              onClick={
                generateVideo
              }
              disabled={
                generatingVideo ||
                loadingPoster
              }
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold"
            >
              {generatingVideo
                ? "🎬 Creating Video..."
                : "🎬 Generate AI Video"}
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* POSTER LOADING */}
        {/* ================================================= */}

        {loadingPoster ? (
          <div className="mt-5 p-4 rounded-lg bg-purple-50 border border-purple-200">

            <p className="text-sm font-semibold text-purple-800">
              AI is designing this property...
            </p>

            <p className="text-xs text-purple-600 mt-1">
              Studying the listing information
              and actual property photographs.
            </p>

          </div>
        ) : null}

        {/* ================================================= */}
        {/* VIDEO LOADING */}
        {/* ================================================= */}

        {generatingVideo ? (
          <div className="mt-5 p-4 rounded-lg bg-gray-50 border border-gray-200">

            <p className="text-sm font-semibold text-gray-800">
              🎬 AI is creating the property video...
            </p>

            <p className="text-xs text-gray-600 mt-1">
              MIB is sending the property photo
              to Sora.
            </p>

          </div>
        ) : null}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error ? (
          <div className="mt-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

      </div>

      

      {/* ===================================================== */}
      {/* POSTERS */}
      {/* ===================================================== */}

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

        {loadingDesigns ? (

          <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
            Loading AI designs...
          </div>

        ) : designs.length === 0 ? (

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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {designs.map(
              (
                design,
                index
              ) => (

                <div
                  key={
                    design.id
                  }
                  className="bg-white border rounded-xl shadow-sm overflow-hidden"
                >

                  <div className="bg-gray-100">

                    <img
                      src={
                        design.image_url
                      }
                      alt={`AI property poster ${index + 1}`}
                      className="w-full h-auto block"
                    />

                  </div>

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

                      <div className="flex items-center gap-2">

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

                        <button
                          type="button"
                          onClick={() =>
                            deleteDesign(
                              design.id
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium whitespace-nowrap"
                        >
                          🗑 Delete
                        </button>

                      </div>

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