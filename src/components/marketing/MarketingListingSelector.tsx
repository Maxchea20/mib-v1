"use client";

import { useMemo, useState } from "react";
import { coverPhotoMap } from "@/lib/photoTemplates";

type Props = {
  listings: any[];
};

export default function MarketingListingSelector({
  listings,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [platform, setPlatform] =
    useState("page");

  const [groupUrl, setGroupUrl] =
    useState("");

  const [content, setContent] =
    useState("");

  const [generating, setGenerating] =
    useState(false);

  const [posting, setPosting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  const [selectedPhotos, setSelectedPhotos] =
    useState<string[]>([]);

  const filteredListings = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return listings;
    }

    return listings.filter((listing: any) => {
      return (
        listing.title
          ?.toLowerCase()
          .includes(keyword) ||
        listing.area
          ?.toLowerCase()
          .includes(keyword) ||
        listing.address
          ?.toLowerCase()
          .includes(keyword) ||
        listing.category
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [listings, search]);

  const selectedListing =
    listings.find(
      (listing: any) =>
        listing.id === selectedId
    );

  const getCoverPhoto = (
    listing: any
  ): any | undefined => {
    const coverPhotoType =
      coverPhotoMap[
        listing.category as keyof typeof coverPhotoMap
      ] ?? "Front House";

    return listing.property_photos?.find(
      (photo: any) =>
        photo.photo_type ===
        coverPhotoType
    );
  };

  const getAllPhotos = (
    listing: any
  ): string[] => {
    const photos =
      listing?.property_photos || [];

    return photos
      .filter(
        (photo: any) =>
          typeof photo.image_url === "string" &&
          photo.image_url.trim() !== ""
      )
      .map(
        (photo: any): string =>
          photo.image_url
      );
  };

  const handleSelect = (
    listing: any
  ) => {
    setSelectedId(listing.id);
    setOpen(false);
    setSearch("");

    setContent("");
    setError("");
    setSuccess("");
    setShowPreview(false);

    const cover =
      getCoverPhoto(listing);

    const allPhotos =
      getAllPhotos(listing);

    if (cover?.image_url) {
      setSelectedPhotos([
        cover.image_url,
      ]);
    } else if (
      allPhotos.length > 0
    ) {
      setSelectedPhotos([
        allPhotos[0],
      ]);
    } else {
      setSelectedPhotos([]);
    }
  };

  const togglePhoto = (
    imageUrl: string
  ) => {
    setSelectedPhotos(
      (current: string[]) => {
        if (
          current.includes(imageUrl)
        ) {
          return current.filter(
            (url: string) =>
              url !== imageUrl
          );
        }

        return [
          ...current,
          imageUrl,
        ];
      }
    );
  };

  const selectAllPhotos = () => {
    if (!selectedListing) {
      return;
    }

    setSelectedPhotos(
      getAllPhotos(
        selectedListing
      )
    );
  };

  const clearPhotos = () => {
    setSelectedPhotos([]);
  };

  /*
  |--------------------------------------------------------------------------
  | GENERATE FACEBOOK CONTENT
  |--------------------------------------------------------------------------
  */

  async function generateContent() {
    if (!selectedListing) {
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");
    setContent("");
    setShowPreview(false);

    try {
      const response =
        await fetch(
          "/api/ai/facebook",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              platform,

              title:
                selectedListing.title,

              category:
                selectedListing.category,

              purpose:
                selectedListing.purpose,

              price:
                selectedListing.price,

              area:
                selectedListing.area,

              state:
                selectedListing.state,

              land_size:
                selectedListing.land_size,

              built_up:
                selectedListing.built_up,

              bedrooms:
                selectedListing.bedrooms,

              bathrooms:
                selectedListing.bathrooms,

              residential_type:
                selectedListing.residential_type,

              residential_storey:
                selectedListing.residential_storey,

              commercial_type:
                selectedListing.commercial_type,

              industrial_property_type:
                selectedListing.industrial_property_type,

              industrial_zoning:
                selectedListing.industrial_zoning,

              industrial_ceiling_height:
                selectedListing.industrial_ceiling_height,

              industrial_power_supply:
                selectedListing.industrial_power_supply,

              land_type:
                selectedListing.land_type,

              tenure:
                selectedListing.tenure,

              facing:
                selectedListing.facing,

              highlights:
                selectedListing.highlights,

              description:
                selectedListing.description,
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
        err?.message ||
          "Failed to generate marketing content."
      );

    } finally {
      setGenerating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | POST TO FACEBOOK
  |--------------------------------------------------------------------------
  */

  async function postToFacebook() {
    if (
      !selectedListing ||
      !content.trim()
    ) {
      return;
    }

    if (
      selectedPhotos.length === 0
    ) {
      setError(
        "Please select at least one photo."
      );

      return;
    }

    if (
      platform === "group" &&
      !groupUrl.trim()
    ) {
      setError(
        "Please enter a Facebook Group URL."
      );

      return;
    }

    setPosting(true);
    setError("");
    setSuccess("");

    try {
      const endpoint =
        platform === "group"
          ? "/api/marketing/facebook/group-post"
          : "/api/marketing/facebook/post";

      const body =
        platform === "group"
          ? {
              groupUrl:
                groupUrl.trim(),

              message:
                content,

              imageUrls:
                selectedPhotos,
            }
          : {
              message:
                content,

              imageUrls:
                selectedPhotos,
            };

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(body),
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
            "Facebook publishing failed."
        );
      }

      if (
        platform === "group"
      ) {
        setSuccess(
          `✅ Facebook Group posting job queued successfully. ${
            data.imageCount ??
            selectedPhotos.length
          } photo(s) included.`
        );
      } else {
        setSuccess(
          `✅ Posted successfully to Maxchea Property with ${
            data.photoCount ||
            selectedPhotos.length
          } photo(s)!`
        );
      }

    } catch (err: any) {
      console.error(
        "Facebook Post Error:",
        err
      );

      setError(
        err?.message ||
          "Failed to publish to Facebook."
      );

    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-3xl">

      {/* ================================= */}
      {/* SELECT LISTING */}
      {/* ================================= */}

      <div className="bg-white border rounded-xl shadow-sm p-6">

        <h2 className="text-lg font-semibold text-black mb-2">
          Select Listing
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Choose a listing to create marketing content.
        </p>

        <button
          type="button"
          onClick={() =>
            setOpen(!open)
          }
          className="w-full border rounded-xl bg-white hover:border-blue-500 transition text-left"
        >

          {selectedListing ? (

            <div className="flex items-center gap-4 p-3">

              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

                {getCoverPhoto(
                  selectedListing
                ) ? (

                  <img
                    src={
                      getCoverPhoto(
                        selectedListing
                      ).image_url
                    }
                    alt={
                      selectedListing.title
                    }
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Photo
                  </div>

                )}

              </div>

              <div className="flex-1 min-w-0">

                <p className="font-semibold text-black truncate">
                  {
                    selectedListing.title
                  }
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  RM{" "}
                  {Number(
                    selectedListing.price
                  ).toLocaleString()}

                  {selectedListing.area
                    ? ` • ${selectedListing.area}`
                    : ""}
                </p>

              </div>

              <span className="text-gray-400 text-lg">
                {open
                  ? "▲"
                  : "▼"}
              </span>

            </div>

          ) : (

            <div className="flex items-center justify-between px-4 py-4">

              <span className="text-gray-400">
                🖼️ Select a listing...
              </span>

              <span className="text-gray-400">
                {open
                  ? "▲"
                  : "▼"}
              </span>

            </div>

          )}

        </button>

        {/* ================================= */}
        {/* LISTING DROPDOWN */}
        {/* ================================= */}

        {open && (

          <div className="relative">

            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl overflow-hidden">

              <div className="p-3 border-b bg-gray-50">

                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="🔍 Search listings..."
                  className="w-full border rounded-lg px-3 py-2 text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                />

              </div>

              <div className="max-h-[420px] overflow-y-auto">

                {filteredListings.length ===
                0 ? (

                  <div className="p-8 text-center text-gray-500">
                    No listings found.
                  </div>

                ) : (

                  filteredListings.map(
                    (listing: any) => {

                      const coverPhoto =
                        getCoverPhoto(
                          listing
                        );

                      return (

                        <button
                          key={
                            listing.id
                          }
                          type="button"
                          onClick={() =>
                            handleSelect(
                              listing
                            )
                          }
                          className="w-full flex items-center gap-4 p-3 text-left hover:bg-blue-50 transition border-b last:border-b-0"
                        >

                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">

                            {coverPhoto ? (

                              <img
                                src={
                                  coverPhoto.image_url
                                }
                                alt={
                                  listing.title
                                }
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Photo
                              </div>

                            )}

                          </div>

                          <div className="flex-1 min-w-0">

                            <p className="font-semibold text-black truncate">
                              {
                                listing.title
                              }
                            </p>

                            <p className="text-sm text-green-600 font-semibold mt-1">
                              RM{" "}
                              {Number(
                                listing.price
                              ).toLocaleString()}
                            </p>

                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {listing.area ||
                                listing.address ||
                                listing.category ||
                                "Property"}
                            </p>

                          </div>

                        </button>

                      );
                    }
                  )

                )}

              </div>

            </div>

          </div>

        )}

      </div>

      {/* ================================= */}
      {/* FACEBOOK MARKETING */}
      {/* ================================= */}

      {selectedListing && (

        <div className="mt-6 bg-white border rounded-xl shadow-sm p-6">

          <h2 className="text-lg font-semibold text-black mb-2">
            Facebook Marketing
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Create and publish marketing content for this listing.
          </p>

          {/* DESTINATION */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post To
            </label>

            <select
              value={platform}
              onChange={(e) => {

                const nextPlatform =
                  e.target.value;

                setPlatform(
                  nextPlatform
                );

                if (
                  nextPlatform !==
                  "group"
                ) {
                  setGroupUrl("");
                }

                setContent("");
                setError("");
                setSuccess("");
                setShowPreview(false);

              }}
              disabled={
                generating ||
                posting
              }
              className="w-full border rounded-lg px-4 py-3 text-black bg-white"
            >

              <option value="page">
                Facebook Page — Maxchea Property
              </option>

              <option value="profile">
                Facebook Profile — Manual
              </option>

              <option value="group">
                Facebook Group — Desktop Worker
              </option>

              <option value="marketplace">
                Facebook Marketplace — Manual
              </option>

            </select>

            {platform === "group" && (

              <div className="mt-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Group URL
                </label>

                <input
                  type="url"
                  value={groupUrl}
                  onChange={(e) =>
                    setGroupUrl(
                      e.target.value
                    )
                  }
                  placeholder="https://www.facebook.com/groups/..."
                  disabled={
                    generating ||
                    posting
                  }
                  className="w-full border rounded-lg px-4 py-3 text-black bg-white outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  MIB Desktop will publish this listing to the selected Group.
                </p>

              </div>

            )}

          </div>

          {/* GENERATE */}

          <button
            type="button"
            onClick={
              generateContent
            }
            disabled={
              generating ||
              posting
            }
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold transition"
          >

            {generating
              ? "✨ Generating..."
              : "🤖 Generate Marketing Post"}

          </button>

          {/* ERROR */}

          {error && (

            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">

              <p className="text-sm text-red-600">
                ❌ {error}
              </p>

            </div>

          )}

          {/* SUCCESS */}

          {success && (

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">

              <p className="text-sm text-green-700">
                {success}
              </p>

            </div>

          )}

          {/* GENERATED CONTENT */}

          {content && (

            <div className="mt-6 border rounded-xl bg-gray-50 p-5">

              {/* PHOTOS */}

              <div className="mb-6">

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-3">

                  <div>

                    <p className="text-sm font-medium text-gray-700">
                      Photos
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Select the property photos you want to publish.
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="text-sm font-semibold text-blue-600">
                      Selected:{" "}
                      {
                        selectedPhotos.length
                      }
                    </span>

                    <button
                      type="button"
                      onClick={
                        selectAllPhotos
                      }
                      disabled={
                        posting
                      }
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearPhotos
                      }
                      disabled={
                        posting
                      }
                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded"
                    >
                      Clear
                    </button>

                  </div>

                </div>

                {getAllPhotos(
                  selectedListing
                ).length === 0 ? (

                  <div className="border rounded-lg bg-white p-8 text-center text-gray-500">
                    No property photos available.
                  </div>

                ) : (

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                    {getAllPhotos(
                      selectedListing
                    ).map(
                      (
                        imageUrl: string,
                        index: number
                      ) => {

                        const isSelected =
                          selectedPhotos.includes(
                            imageUrl
                          );

                        return (

                          <button
                            key={
                              imageUrl
                            }
                            type="button"
                            onClick={() =>
                              togglePhoto(
                                imageUrl
                              )
                            }
                            disabled={
                              posting
                            }
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                              isSelected
                                ? "border-blue-600 ring-2 ring-blue-200"
                                : "border-transparent hover:border-gray-400"
                            }`}
                          >

                            <img
                              src={
                                imageUrl
                              }
                              alt={`Property photo ${
                                index + 1
                              }`}
                              className="w-full h-full object-cover"
                            />

                            <div className="absolute top-2 left-2">

                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow ${
                                  isSelected
                                    ? "bg-blue-600"
                                    : "bg-black/50"
                                }`}
                              >

                                {isSelected
                                  ? "✓"
                                  : ""}

                              </div>

                            </div>

                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">

                              {index + 1}

                            </div>

                          </button>

                        );

                      }
                    )}

                  </div>

                )}

              </div>

              {/* CAPTION */}

              <div>

                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-3">

                  <h3 className="text-lg font-bold text-black">
                    Facebook Caption
                  </h3>

                  <span className="text-sm text-gray-500">
                    Review and edit before posting
                  </span>

                </div>

                <textarea
                  rows={16}
                  value={content}
                  onChange={(e) =>
                    setContent(
                      e.target.value
                    )
                  }
                  disabled={
                    posting
                  }
                  className="w-full border rounded-lg px-4 py-3 text-black bg-white leading-7 resize-y"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3 mt-4">

                <button
                  type="button"
                  onClick={
                    generateContent
                  }
                  disabled={
                    generating ||
                    posting
                  }
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
                >

                  {generating
                    ? "Generating..."
                    : "↻ Regenerate"}

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(
                      !showPreview
                    )
                  }
                  disabled={
                    posting
                  }
                  className="bg-white hover:bg-gray-100 border text-gray-800 px-4 py-2 rounded-lg font-medium"
                >

                  👁{" "}
                  {showPreview
                    ? "Hide Preview"
                    : "Preview"}

                </button>

                <button
                  type="button"
                  onClick={
                    postToFacebook
                  }
                  disabled={
                    posting ||
                    generating ||
                    !content.trim() ||
                    selectedPhotos.length ===
                      0 ||
                    (platform === "group" &&
                      !groupUrl.trim())
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold"
                >

                  {posting
                    ? "🚀 Posting..."
                    : platform === "group"
                    ? "🚀 Queue Facebook Group Post"
                    : "🚀 Post to Facebook"}

                </button>

              </div>

              {/* PREVIEW */}

              {showPreview && (

                <div className="mt-6">

                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Facebook Preview
                  </p>

                  <div className="bg-white border rounded-xl shadow-sm overflow-hidden max-w-xl">

                    {selectedPhotos.length >
                      0 && (

                      <div
                        className={
                          selectedPhotos.length === 1
                            ? ""
                            : "grid grid-cols-2 gap-1"
                        }
                      >

                        {selectedPhotos.map(
                          (
                            imageUrl: string,
                            index: number
                          ) => (

                            <img
                              key={
                                imageUrl
                              }
                              src={
                                imageUrl
                              }
                              alt={`Preview ${
                                index + 1
                              }`}
                              className={
                                selectedPhotos.length === 1
                                  ? "w-full max-h-[500px] object-cover"
                                  : "w-full aspect-square object-cover"
                              }
                            />

                          )
                        )}

                      </div>

                    )}

                    <div className="p-5">

                      <p className="text-black whitespace-pre-wrap leading-7">
                        {content}
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

          )}

        </div>

      )}

    </div>
  );
}