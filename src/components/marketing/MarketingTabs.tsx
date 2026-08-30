"use client";

import {
  useEffect,
  useState,
} from "react";

import MarketingListingSelector from "@/components/marketing/MarketingListingSelector";

type FacebookGroup = {
  id: string;
  name: string;
  group_url: string;
  language:
    | "chinese"
    | "non_chinese";
  region: string;
  is_active: boolean;
};

type PropertyPhoto = {
  photo_type?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
};

type Listing = {
  id: number;
  title?: string | null;
  price?: number | string | null;
  area?: string | null;
  address?: string | null;
  category?: string | null;
  property_photos?:
    | PropertyPhoto[]
    | null;

  [key: string]: any;
};

type Props = {
  listings: Listing[];
  facebookGroups: FacebookGroup[];
};

/*
|--------------------------------------------------------------------------
| GET LISTING THUMBNAIL
|--------------------------------------------------------------------------
|
| Priority:
|
| 1. Front House photo
| 2. Photo marked as Main
| 3. Lowest sort_order
|
|--------------------------------------------------------------------------
*/

function getListingThumbnail(
  listing: Listing
) {
  const photos =
    Array.isArray(
      listing.property_photos
    )
      ? listing.property_photos
      : [];

  const validPhotos =
    photos.filter(
      (photo) =>
        typeof photo.image_url ===
          "string" &&
        photo.image_url.trim() !== ""
    );

  if (
    validPhotos.length === 0
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | 1. FRONT HOUSE
  |--------------------------------------------------------------------------
  */

  const frontPhoto =
    validPhotos.find(
      (photo) => {
        const photoType =
          String(
            photo.photo_type ?? ""
          )
            .trim()
            .toLowerCase();

        return (
          photoType ===
            "front house" ||
          photoType === "front" ||
          photoType.includes(
            "front house"
          ) ||
          photoType.includes(
            "front"
          )
        );
      }
    );

  if (
    frontPhoto?.image_url
  ) {
    return frontPhoto.image_url;
  }

  /*
  |--------------------------------------------------------------------------
  | 2. MAIN PHOTO
  |--------------------------------------------------------------------------
  */

  const mainPhoto =
    validPhotos.find(
      (photo) => {
        const photoType =
          String(
            photo.photo_type ?? ""
          )
            .trim()
            .toLowerCase();

        return (
          photoType === "main" ||
          photoType ===
            "main photo"
        );
      }
    );

  if (
    mainPhoto?.image_url
  ) {
    return mainPhoto.image_url;
  }

  /*
  |--------------------------------------------------------------------------
  | 3. LOWEST SORT ORDER
  |--------------------------------------------------------------------------
  */

  const sortedPhotos =
    [...validPhotos].sort(
      (a, b) =>
        Number(
          a.sort_order ?? 999
        ) -
        Number(
          b.sort_order ?? 999
        )
    );

  return (
    sortedPhotos[0]
      ?.image_url || null
  );
}

/*
|--------------------------------------------------------------------------
| MAIN MARKETING TABS
|--------------------------------------------------------------------------
*/

export default function MarketingTabs({
  listings,
  facebookGroups,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<
      "facebook" | "iproperty"
    >("facebook");

  return (
    <div>
      {/* MARKETING TABS */}

      <div className="flex gap-2 mb-6 border-b">
        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "facebook"
            )
          }
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "facebook"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Facebook
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "iproperty"
            )
          }
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "iproperty"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          iProperty
        </button>
      </div>

      {/* FACEBOOK */}

      {activeTab === "facebook" && (
        <MarketingListingSelector
          listings={listings}
          facebookGroups={
            facebookGroups
          }
        />
      )}

      {/* IPROPERTY */}

      {activeTab === "iproperty" && (
        <IpropertyMarketing
          listings={listings}
        />
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| IPROPERTY MARKETING
|--------------------------------------------------------------------------
*/

function IpropertyMarketing({
  listings,
}: {
  listings: Listing[];
}) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<number | null>(
      null
    );

  const [posting, setPosting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          "[data-iproperty-dropdown]"
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | FILTER LISTINGS
  |--------------------------------------------------------------------------
  */

  const filteredListings =
    listings.filter(
      (listing) => {
        const keyword =
          search
            .trim()
            .toLowerCase();

        if (!keyword) {
          return true;
        }

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
      }
    );

  /*
  |--------------------------------------------------------------------------
  | SELECTED LISTING
  |--------------------------------------------------------------------------
  */

  const selectedListing =
    listings.find(
      (listing) =>
        listing.id ===
        selectedId
    );

  /*
  |--------------------------------------------------------------------------
  | POST TO IPROPERTY
  |--------------------------------------------------------------------------
  */

  async function postToIproperty() {
    if (!selectedListing) {
      setError(
        "Please select a listing."
      );

      return;
    }

    setPosting(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/marketing/iproperty/create-listing",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                listingId:
                  selectedListing.id,
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
            "Failed to queue iProperty listing."
        );
      }

      setSuccess(
        `✅ iProperty listing queued successfully. Job ID: ${data.jobId}`
      );
    } catch (err: any) {
      console.error(
        "iProperty Post Error:",
        err
      );

      setError(
        err?.message ||
          "Failed to queue iProperty listing."
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

      <div
        className="bg-white border rounded-xl shadow-sm p-6"
      >

        {/* HEADER */}

        <h2 className="text-lg font-semibold text-black mb-2">
          Select Listing
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Choose a listing to publish to iProperty.
        </p>

        {/* DROPDOWN AREA */}

        <div
          className="relative"
          data-iproperty-dropdown
        >

          {/* SELECT BUTTON */}

          <button
            type="button"
            onClick={() =>
              setOpen(
                !open
              )
            }
            disabled={posting}
            className="w-full border rounded-xl bg-white hover:border-blue-500 transition text-left"
          >

            {selectedListing ? (
              <div className="flex items-center justify-between px-4 py-3">

                <div className="flex items-center gap-4 min-w-0">

                  {/* THUMBNAIL */}

                  {getListingThumbnail(
                    selectedListing
                  ) ? (
                    <img
                      src={
                        getListingThumbnail(
                          selectedListing
                        ) as string
                      }
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">
                      🏠
                    </div>
                  )}

                  {/* DETAILS */}

                  <div className="min-w-0">

                    <p className="font-semibold text-black truncate">
                      {
                        selectedListing.title
                      }
                    </p>

                    <p className="text-sm text-green-600 font-semibold mt-1">
                      RM{" "}
                      {Number(
                        selectedListing.price ??
                          0
                      ).toLocaleString()}
                    </p>

                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {selectedListing.area ||
                        selectedListing.address ||
                        selectedListing.category ||
                        "Property"}
                    </p>

                  </div>

                </div>

                <span className="text-gray-400 text-lg ml-4">
                  {open
                    ? "▲"
                    : "▼"}
                </span>

              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-4">

                <span className="text-gray-400">
                  🏠 Select a listing...
                </span>

                <span className="text-gray-400">
                  {open
                    ? "▲"
                    : "▼"}
                </span>

              </div>
            )}

          </button>

          {/* DROPDOWN */}

          {open && (
            <div className="absolute z-50 left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl overflow-hidden">

              {/* SEARCH */}

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

              {/* RESULTS */}

              <div className="max-h-[420px] overflow-y-auto">

                {filteredListings.length ===
                0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No listings found.
                  </div>
                ) : (
                  filteredListings.map(
                    (listing) => {

                      const thumbnail =
                        getListingThumbnail(
                          listing
                        );

                      return (
                        <button
                          key={
                            listing.id
                          }
                          type="button"
                          onClick={() => {
                            setSelectedId(
                              listing.id
                            );

                            setOpen(
                              false
                            );

                            setSearch(
                              ""
                            );

                            setError(
                              ""
                            );

                            setSuccess(
                              ""
                            );
                          }}
                          className="w-full p-3 text-left hover:bg-blue-50 transition border-b last:border-b-0"
                        >

                          <div className="flex items-center gap-4">

                            {/* THUMBNAIL */}

                            {thumbnail ? (
                              <img
                                src={
                                  thumbnail
                                }
                                alt=""
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-2xl">
                                🏠
                              </div>
                            )}

                            {/* LISTING DETAILS */}

                            <div className="min-w-0 flex-1">

                              <p className="font-semibold text-black truncate">
                                {
                                  listing.title
                                }
                              </p>

                              <p className="text-sm text-green-600 font-semibold mt-1">
                                RM{" "}
                                {Number(
                                  listing.price ??
                                    0
                                ).toLocaleString()}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {listing.area ||
                                  listing.address ||
                                  listing.category ||
                                  "Property"}
                              </p>

                            </div>

                          </div>

                        </button>
                      );
                    }
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* SELECTED LISTING PREVIEW */}

        {selectedListing && (
          <div className="mt-6 border rounded-xl bg-gray-50 p-5">

            <div className="flex items-center gap-4">

              {getListingThumbnail(
                selectedListing
              ) ? (
                <img
                  src={
                    getListingThumbnail(
                      selectedListing
                    ) as string
                  }
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-white border flex items-center justify-center text-2xl flex-shrink-0">
                  🏠
                </div>
              )}

              <div className="min-w-0">

                <p className="text-sm font-medium text-gray-700">
                  Selected Listing
                </p>

                <p className="text-lg font-bold text-black mt-1 truncate">
                  {
                    selectedListing.title
                  }
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Listing ID:{" "}
                  {
                    selectedListing.id
                  }
                </p>

              </div>

            </div>

          </div>
        )}

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

        {/* ACTION */}

        <div className="mt-6">

          <button
            type="button"
            onClick={
              postToIproperty
            }
            disabled={
              posting ||
              !selectedListing
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold"
          >
            {posting
              ? "🚀 Queuing..."
              : "🚀 Post to iProperty"}
          </button>

        </div>

      </div>

    </div>
  );
}