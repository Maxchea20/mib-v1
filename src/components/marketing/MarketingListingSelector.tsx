"use client";

import { useMemo, useState } from "react";
import { coverPhotoMap } from "@/lib/photoTemplates";

type FacebookGroup = {
  id: string;
  name: string;
  group_url: string;
  language: "chinese" | "non_chinese";
  region: string;
  is_active: boolean;
};

type Props = {
  listings: any[];
  facebookGroups: FacebookGroup[];
};

export default function MarketingListingSelector({
  listings,
  facebookGroups,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [platform, setPlatform] =
    useState("page");

  const [selectedGroupIds, setSelectedGroupIds] =
    useState<string[]>([]);

  const [groupSearch, setGroupSearch] =
    useState("");

  const [languageFilter, setLanguageFilter] =
    useState<"all" | "chinese" | "non_chinese">(
      "all"
    );

  const [regionFilter, setRegionFilter] =
    useState<"all" | "ipoh" | "malaysia" | "perak" | "other">(
      "all"
    );

  const [postingMode, setPostingMode] =
    useState<"now" | "schedule">("now");

  const [scheduledAt, setScheduledAt] =
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

  /*
  |--------------------------------------------------------------------------
  | LISTING SEARCH
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | SELECTED LISTING
  |--------------------------------------------------------------------------
  */

  const selectedListing =
    listings.find(
      (listing: any) =>
        listing.id === selectedId
    );

  /*
  |--------------------------------------------------------------------------
  | COVER PHOTO
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | ALL PHOTOS
  |--------------------------------------------------------------------------
  */

  const getAllPhotos = (
  listing: any
): string[] => {
  const photos =
    listing?.property_photos || [];

  return [...photos]
    .filter(
      (photo: any) =>
        typeof photo.image_url === "string" &&
        photo.image_url.trim() !== ""
    )
    .sort(
      (a: any, b: any) => {
        const sortA =
          Number.isFinite(
            Number(a.sort_order)
          )
            ? Number(a.sort_order)
            : 999999;

        const sortB =
          Number.isFinite(
            Number(b.sort_order)
          )
            ? Number(b.sort_order)
            : 999999;

        if (sortA !== sortB) {
          return sortA - sortB;
        }

        const timeA =
          new Date(
            a.created_at || 0
          ).getTime();

        const timeB =
          new Date(
            b.created_at || 0
          ).getTime();

        return timeA - timeB;
      }
    )
    .map(
      (photo: any): string =>
        photo.image_url
    );
};

  /*
  |--------------------------------------------------------------------------
  | SELECT LISTING
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | PHOTO CONTROLS
  |--------------------------------------------------------------------------
  */

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
  | FACEBOOK GROUP FILTERING
  |--------------------------------------------------------------------------
  */

  const filteredGroups = useMemo(() => {
    const keyword =
      groupSearch.trim().toLowerCase();

    return facebookGroups.filter(
      (group) => {
        if (
          languageFilter !== "all" &&
          group.language !== languageFilter
        ) {
          return false;
        }

        if (
          regionFilter !== "all" &&
          group.region !== regionFilter
        ) {
          return false;
        }

        if (!keyword) {
          return true;
        }

        return (
          group.name
            .toLowerCase()
            .includes(keyword) ||
          group.group_url
            .toLowerCase()
            .includes(keyword)
        );
      }
    );
  }, [
    facebookGroups,
    groupSearch,
    languageFilter,
    regionFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | GROUP SELECTION
  |--------------------------------------------------------------------------
  */

  const toggleGroup = (
    groupId: string
  ) => {
    setSelectedGroupIds(
      (current) => {
        if (
          current.includes(groupId)
        ) {
          return current.filter(
            (id) => id !== groupId
          );
        }

        return [
          ...current,
          groupId,
        ];
      }
    );
  };

  const selectAllGroups = () => {
    const ids =
      filteredGroups.map(
        (group) => group.id
      );

    setSelectedGroupIds(
      (current) => {
        const merged = new Set([
          ...current,
          ...ids,
        ]);

        return Array.from(merged);
      }
    );
  };

  const clearGroups = () => {
    setSelectedGroupIds([]);
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
  | POST / SCHEDULE FACEBOOK GROUPS
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
      selectedGroupIds.length === 0
    ) {
      setError(
        "Please select at least one Facebook Group."
      );

      return;
    }

    if (
      platform === "group" &&
      postingMode === "schedule" &&
      !scheduledAt
    ) {
      setError(
        "Please select a schedule date and time."
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

      const selectedGroups =
        facebookGroups.filter(
          (group) =>
            selectedGroupIds.includes(
              group.id
            )
        );

        const orderedSelectedPhotos =
  [...selectedPhotos].sort(
    (urlA, urlB) => {
      const photoA =
        selectedListing?.property_photos?.find(
          (photo: any) =>
            photo.image_url === urlA
        );

      const photoB =
        selectedListing?.property_photos?.find(
          (photo: any) =>
            photo.image_url === urlB
        );

      const orderA =
        Number.isFinite(
          Number(photoA?.sort_order)
        )
          ? Number(photoA.sort_order)
          : 999999;

      const orderB =
        Number.isFinite(
          Number(photoB?.sort_order)
        )
          ? Number(photoB.sort_order)
          : 999999;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      const timeA =
        new Date(
          photoA?.created_at || 0
        ).getTime();

      const timeB =
        new Date(
          photoB?.created_at || 0
        ).getTime();

      return timeA - timeB;
    }
  );

      const body =
        platform === "group"
          ? {
              listingId:
                selectedListing.id,

              groupUrls:
                selectedGroups.map(
                  (group) =>
                    group.group_url
                ),

              message:
                content,

              imageUrls:
  orderedSelectedPhotos,

              scheduledAt:
                postingMode === "schedule"
                  ? new Date(
                      scheduledAt
                    ).toISOString()
                  : null,
            }
          : {
              message:
                content,

              imageUrls:
  orderedSelectedPhotos,
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
          postingMode === "schedule"
            ? `✅ ${data.jobCount} Facebook Group post(s) scheduled successfully.`
            : `✅ ${data.jobCount} Facebook Group post(s) queued successfully.`
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

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="max-w-4xl">

      {/* SELECT LISTING */}

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

      {/* FACEBOOK MARKETING */}

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
                  setSelectedGroupIds(
                    []
                  );
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

          </div>

          {/* FACEBOOK GROUP SELECTOR */}

          {platform === "group" && (
            <div className="mb-6 border rounded-xl p-5 bg-gray-50">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h3 className="font-semibold text-black">
                    Facebook Groups
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Select the groups where this listing should be posted.
                  </p>

                </div>

                <div className="text-sm font-semibold text-blue-600">
                  Selected:{" "}
                  {selectedGroupIds.length}
                </div>

              </div>

              {/* SEARCH */}

              <input
                type="text"
                value={groupSearch}
                onChange={(e) =>
                  setGroupSearch(
                    e.target.value
                  )
                }
                placeholder="🔎 Search groups..."
                disabled={
                  generating ||
                  posting
                }
                className="w-full border rounded-lg px-3 py-2.5 text-sm text-black bg-white outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              {/* LANGUAGE FILTER */}

              <div className="mb-4">

                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Language
                </p>

                <div className="flex flex-wrap gap-2">

                  {[
                    ["all", "All"],
                    ["chinese", "Chinese"],
                    [
                      "non_chinese",
                      "Non-Chinese",
                    ],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setLanguageFilter(
                            value as any
                          )
                        }
                        disabled={posting}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                          languageFilter ===
                          value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* REGION FILTER */}

              <div className="mb-4">

                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Region
                </p>

                <div className="flex flex-wrap gap-2">

                  {[
                    ["all", "All"],
                    ["ipoh", "Ipoh"],
                    [
                      "malaysia",
                      "Malaysia",
                    ],
                    ["perak", "Perak"],
                    ["other", "Other"],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setRegionFilter(
                            value as any
                          )
                        }
                        disabled={posting}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                          regionFilter ===
                          value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* GROUP ACTIONS */}

              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">

                <span className="text-xs text-gray-500">
                  Showing{" "}
                  {
                    filteredGroups.length
                  }{" "}
                  groups
                </span>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={
                      selectAllGroups
                    }
                    disabled={
                      posting ||
                      filteredGroups.length ===
                        0
                    }
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearGroups
                    }
                    disabled={
                      posting ||
                      selectedGroupIds.length ===
                        0
                    }
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded"
                  >
                    Clear
                  </button>

                </div>

              </div>

              {/* GROUP LIST */}

              <div className="border rounded-lg bg-white max-h-[420px] overflow-y-auto">

                {filteredGroups.length ===
                0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No Facebook groups found.
                  </div>
                ) : (
                  filteredGroups.map(
                    (group) => {

                      const checked =
                        selectedGroupIds.includes(
                          group.id
                        );

                      return (
                        <label
                          key={
                            group.id
                          }
                          className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-blue-50 ${
                            checked
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >

                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleGroup(
                                group.id
                              )
                            }
                            disabled={
                              posting
                            }
                            className="w-4 h-4"
                          />

                          <div className="flex-1 min-w-0">

                            <p className="text-sm font-medium text-black">
                              {group.name}
                            </p>

                            <p className="text-xs text-gray-400 mt-0.5">
                              {group.language ===
                              "chinese"
                                ? "Chinese"
                                : "Non-Chinese"}{" "}
                              •{" "}
                              {group.region
                                .charAt(0)
                                .toUpperCase() +
                                group.region.slice(
                                  1
                                )}
                            </p>

                          </div>

                        </label>
                      );
                    }
                  )
                )}

              </div>

            </div>
          )}

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
                        imageUrl,
                        index
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

              {/* SCHEDULING */}

              {platform === "group" && (
                <div className="mt-6 border rounded-xl bg-white p-5">

                  <h3 className="font-semibold text-black mb-3">
                    Facebook Group Posting
                  </h3>

                  <div className="flex gap-3 mb-4">

                    <button
                      type="button"
                      onClick={() =>
                        setPostingMode(
                          "now"
                        )
                      }
                      disabled={
                        posting
                      }
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        postingMode ===
                        "now"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      Post Now
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPostingMode(
                          "schedule"
                        )
                      }
                      disabled={
                        posting
                      }
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        postingMode ===
                        "schedule"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      Schedule
                    </button>

                  </div>

                  {postingMode ===
                    "schedule" && (
                    <div>

                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Malaysia Date & Time
                      </label>

                      <input
                        type="datetime-local"
                        value={
                          scheduledAt
                        }
                        onChange={(e) =>
                          setScheduledAt(
                            e.target.value
                          )
                        }
                        disabled={
                          posting
                        }
                        className="border rounded-lg px-4 py-3 text-black bg-white"
                      />

                      <p className="text-xs text-gray-500 mt-2">
                        The selected time is treated as Malaysia local time (UTC+8).
                      </p>

                    </div>
                  )}

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">

                    <p className="text-sm text-blue-700">
                      {selectedGroupIds.length ===
                      0
                        ? "No groups selected."
                        : `${selectedGroupIds.length} group(s) selected.`}
                    </p>

                    <p className="text-xs text-blue-600 mt-1">
                      MIB Desktop processes the queued groups one at a time.
                    </p>

                  </div>

                </div>
              )}

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
                    (platform ===
                      "group" &&
                      selectedGroupIds.length ===
                        0)
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  {posting
                    ? "🚀 Queuing..."
                    : platform ===
                      "group"
                    ? postingMode ===
                      "schedule"
                      ? `📅 Schedule ${selectedGroupIds.length} Group Posts`
                      : `🚀 Queue ${selectedGroupIds.length} Group Posts`
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
                          selectedPhotos.length ===
                          1
                            ? ""
                            : "grid grid-cols-2 gap-1"
                        }
                      >

                        {selectedPhotos.map(
                          (
                            imageUrl,
                            index
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
                                selectedPhotos.length ===
                                1
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