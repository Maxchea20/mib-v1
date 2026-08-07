// File: src/components/listings/ListingList.tsx

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ListingMenu from "./ListingMenu";
import { coverPhotoMap } from "@/lib/photoTemplates";

type Props = {
  listings: any[];
};

export default function ListingList({
  listings,
}: Props) {

  const router = useRouter();

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  const [purpose, setPurpose] =
    useState("All");

  const [status, setStatus] =
    useState("All");

  const filteredListings = useMemo(() => {

    const keyword =
      search.trim().toLowerCase();

    return listings.filter((listing) => {

      const matchesSearch =
        listing.title
          ?.toLowerCase()
          .includes(keyword) ||

        listing.listing_agent
          ?.toLowerCase()
          .includes(keyword) ||

        listing.area
          ?.toLowerCase()
          .includes(keyword) ||

        listing.address
          ?.toLowerCase()
          .includes(keyword);

      const matchesCategory =
        category === "All" ||
        listing.category === category;

      const matchesPurpose =
        purpose === "All" ||
        listing.purpose === purpose;

      const matchesStatus =
        status === "All" ||
        listing.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPurpose &&
        matchesStatus
      );

    });

  }, [
    listings,
    search,
    category,
    purpose,
    status,
  ]);

  return (

    <div className="space-y-5">

      <input
        type="text"
        placeholder="🔍 Search title, agent, area or address..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full border rounded-lg px-4 py-3 text-black"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="border rounded-lg px-3 py-3 text-black"
        >
          <option>All</option>
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Land</option>
        </select>

        <select
          value={purpose}
          onChange={(e) =>
            setPurpose(e.target.value)
          }
          className="border rounded-lg px-3 py-3 text-black"
        >
          <option>All</option>
          <option>For Sale</option>
          <option>For Rent</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="border rounded-lg px-3 py-3 text-black"
        >
          <option>All</option>
          <option>Available</option>
          <option>Booked</option>
          <option>Sold</option>
          <option>Rented</option>
          <option>Inactive</option>
        </select>

      </div>

      <div className="flex justify-between items-center">

        <p className="text-gray-500">

          Total Listings:
          <span className="font-semibold ml-1">
            {filteredListings.length}
          </span>

        </p>

        {(search ||
          category !== "All" ||
          purpose !== "All" ||
          status !== "All") && (

          <button
            onClick={() => {

              setSearch("");
              setCategory("All");
              setPurpose("All");
              setStatus("All");

            }}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Clear Filters
          </button>

        )}

      </div>

      {filteredListings.length === 0 && (

        <div className="bg-white border rounded-lg p-10 text-center text-gray-500">

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
  onClick={() => router.push(`/listings/${listing.id}`)}
  className="cursor-pointer bg-white border rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 p-5"
>

            <div className="flex flex-col md:flex-row gap-5">

              <div className="w-full md:w-48 h-52 md:h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">

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

              <div className="flex-1 min-w-0">

                <div className="flex justify-between items-start gap-4">

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

                  <div
  className="relative z-20 flex-shrink-0"
  onClick={(e) => e.stopPropagation()}
>

  <ListingMenu
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