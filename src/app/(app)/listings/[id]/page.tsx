// File: src/app/(app)/listings/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MediaManager from "@/components/media/MediaManager";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingProfilePage({
  params,
}: Props) {
  const { id } = await params;

  const { data: listing } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-black">
          Listing Profile
        </h1>

        <div className="flex gap-3">

          <Link
            href={`/listings/${listing.id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Edit Listing
          </Link>

          <Link
            href="/listings"
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
          >
            Back
          </Link>

        </div>

      </div>

      {/* Listing Details */}

      <div className="bg-white border rounded-lg shadow p-6">

        <h2 className="text-2xl font-semibold text-black mb-6">
          Listing Details
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="font-semibold text-gray-500">Title</p>
            <p className="text-black">{listing.title}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Listing Agent</p>
            <p className="text-black">
              {listing.listing_agent || "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Category</p>
            <p className="text-black">{listing.category}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Purpose</p>
            <p className="text-black">{listing.purpose}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Price</p>
            <p className="text-green-600 font-semibold">
              RM {Number(listing.price).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Status</p>
            <p className="text-black">{listing.status}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Address</p>
            <p className="text-black">
              {listing.address || "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Area</p>
            <p className="text-black">{listing.area}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">State</p>
            <p className="text-black">{listing.state}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Land Size</p>
            <p className="text-black">
              {listing.land_size || "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Built-up</p>
            <p className="text-black">
              {listing.built_up || "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Bedrooms</p>
            <p className="text-black">
              {listing.bedrooms ?? "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-500">Bathrooms</p>
            <p className="text-black">
              {listing.bathrooms ?? "-"}
            </p>
          </div>

        </div>

        <div className="mt-6">

          <p className="font-semibold text-gray-500 mb-2">
            Description
          </p>

          <p className="text-black whitespace-pre-wrap">
            {listing.description || "-"}
          </p>

        </div>

      </div>

      {/* Property Media Manager */}

      <MediaManager
  propertyId={listing.id}
  category={listing.category}
/>

    </div>
  );
}