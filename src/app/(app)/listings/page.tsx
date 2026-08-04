// File: src/app/(app)/listings/page.tsx
export const dynamic = "force-dynamic";

import ListingList from "@/components/listings/ListingList";
import DeleteListingButton from "@/components/DeleteListingButton";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ListingsPage() {
  const { data: listings } = await supabase
  .from("properties")
  .select(`
    *,
    property_photos (
      photo_type,
      image_url
    )
  `)
  .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-black">
          Listings
        </h1>

        <Link
          href="/listings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add Listing
        </Link>

      </div>

      {listings?.length === 0 && (
        <p className="text-gray-500">
          No listings found.
        </p>
      )}

      <ListingList
  listings={listings ?? []}
/>

    </div>
  );
}