// File: src/components/listings/ListingList.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bed, Bath, Car, Ruler, Sofa, ImageOff } from "lucide-react";
import ListingMenu from "./ListingMenu";
import { coverPhotoMap } from "@/lib/photoTemplates";
import Badge from "@/components/ui/Badge";

type Props = {
  listings: any[];
};

export default function ListingList({ listings }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [purpose, setPurpose] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredListings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesSearch =
        listing.title?.toLowerCase().includes(keyword) ||
        listing.listing_agent?.toLowerCase().includes(keyword) ||
        listing.area?.toLowerCase().includes(keyword) ||
        listing.address?.toLowerCase().includes(keyword);

      const matchesCategory = category === "All" || listing.category === category;
      const matchesPurpose = purpose === "All" || listing.purpose === purpose;
      const matchesStatus = status === "All" || listing.status === status;

      return matchesSearch && matchesCategory && matchesPurpose && matchesStatus;
    });
  }, [listings, search, category, purpose, status]);

  const hasActiveFilters =
    search || category !== "All" || purpose !== "All" || status !== "All";

  return (
    <div className="space-y-5">
      {/* FILTER PANEL */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search title, agent, area or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900"
          >
            <option>All</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Industrial</option>
            <option>Land</option>
          </select>

          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900"
          >
            <option>All</option>
            <option>For Sale</option>
            <option>For Rent</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900"
          >
            <option>All</option>
            <option>Available</option>
            <option>Booked</option>
            <option>Sold</option>
            <option>Rented</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="flex justify-between items-center pt-1">
          <p className="text-sm text-slate-500">
            Total listings
            <span className="font-semibold text-slate-900 ml-1">
              {filteredListings.length}
            </span>
          </p>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setPurpose("All");
                setStatus("All");
              }}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center text-slate-500 text-sm">
          No listings found.
        </div>
      )}

      {filteredListings.map((listing) => {
        const coverPhotoType =
          coverPhotoMap[listing.category as keyof typeof coverPhotoMap] ?? "Front House";

        const coverPhoto = listing.property_photos?.find(
          (photo: any) => photo.photo_type === coverPhotoType
        );

        return (
          <div
            key={listing.id}
            onClick={() => router.push(`/listings/${listing.id}`)}
            className="cursor-pointer bg-white border border-slate-200/80 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5"
          >
            <div className="flex flex-col md:flex-row gap-5">
              {/* COVER PHOTO */}
              <div className="w-full md:w-48 h-52 md:h-36 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                {coverPhoto ? (
                  <img
                    src={coverPhoto.image_url}
                    alt={coverPhotoType}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff size={22} className="text-slate-300" />
                )}
              </div>

              {/* LISTING INFORMATION */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-900">
                        {listing.headline || listing.title || "-"}
                      </h2>
                      {listing.status && <Badge status={listing.status}>{listing.status}</Badge>}
                    </div>

                    <p className="text-xl font-bold text-slate-900 mt-2">
                      RM{" "}
                      {listing.price !== null && listing.price !== undefined
                        ? Number(listing.price).toLocaleString()
                        : "-"}
                    </p>

                    <p className="text-slate-500 mt-1.5 text-sm">
                      {listing.city || listing.area || "-"}
                      {listing.state ? `, ${listing.state}` : ""}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {listing.property_sub_type && (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                          {listing.property_sub_type}
                        </span>
                      )}
                      {listing.property_unit_type && (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                          {listing.property_unit_type}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-slate-600 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Bed size={15} className="text-slate-400" />
                        {listing.bedrooms ?? "-"} beds
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bath size={15} className="text-slate-400" />
                        {listing.bathrooms ?? "-"} baths
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Car size={15} className="text-slate-400" />
                        {listing.parking ?? "-"} parking
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Ruler size={15} className="text-slate-400" />
                        {listing.built_up ?? "-"} sqft
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sofa size={15} className="text-slate-400" />
                        {listing.furnishing ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="relative z-20 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ListingMenu id={listing.id} title={listing.headline || listing.title} />
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
