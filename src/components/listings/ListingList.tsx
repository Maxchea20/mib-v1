// File: src/components/listings/ListingList.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteListingButton from "@/components/DeleteListingButton";
import { coverPhotoMap } from "@/lib/photoTemplates";

type Props = {
  listings: any[];
};

export default function ListingList({
  listings,
}: Props) {

  const [search, setSearch] = useState("");

  const filteredListings = listings.filter((listing) => {

    const keyword = search.trim().toLowerCase();

    return (
      listing.title?.toLowerCase().includes(keyword) ||
      listing.listing_agent?.toLowerCase().includes(keyword) ||
      listing.area?.toLowerCase().includes(keyword) ||
      listing.address?.toLowerCase().includes(keyword)
    );

  });

  return (
    <div className="space-y-4">

      <input
        type="text"
        placeholder="🔍 Search title, agent, area or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-3 text-black"
      />

      <p className="text-gray-500">
        Total Listings: {filteredListings.length}
      </p>

      {filteredListings.length === 0 && (

        <div className="bg-white rounded-lg border p-8 text-center text-gray-500">

          No listings found.

        </div>

      )}

      {filteredListings.map((listing) => {

        const coverPhotoType =
          coverPhotoMap[
            listing.category as keyof typeof coverPhotoMap
          ] ?? "Front House";

        const coverPhoto =
          listing.property_photos?.find(
            (photo: any) =>
              photo.photo_type === coverPhotoType
          );

        return (

          <div
            key={listing.id}
            className="bg-white border rounded-lg shadow-sm p-5"
          >

            <div className="flex items-start gap-5">

              <div className="w-48 h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">

                {coverPhoto ? (

                  <img
                    src={coverPhoto.image_url}
                    alt={coverPhotoType}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <span className="text-gray-400">
                    No Photo
                  </span>

                )}

              </div>

              <div className="flex-1">

                <div className="flex justify-between items-start">

                  <div>

                    <h2 className="text-2xl font-bold text-black">
                      {listing.title}
                    </h2>

                    <p className="text-sm text-blue-600 mt-1">
                      👤 Listing Agent: {listing.listing_agent || "-"}
                    </p>

                    <div className="mt-3 space-y-1">

                      <p className="text-gray-700">
                        {listing.category}
                      </p>

                      <p className="text-gray-700">
                        {listing.purpose}
                      </p>

                      <p className="text-2xl font-bold text-green-600">
                        RM {Number(listing.price).toLocaleString()}
                      </p>

                      <p className="text-gray-500">
                        {listing.status}
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-col gap-2">

                    <Link
                      href={`/listings/${listing.id}`}
                      className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded text-center"
                    >
                      View
                    </Link>

                    <DeleteListingButton
                      id={listing.id}
                      title={listing.title}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        );

      })}

    </div>
  );
}