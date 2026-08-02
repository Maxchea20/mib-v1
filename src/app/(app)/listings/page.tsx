// File: src/app/(app)/listings/page.tsx
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

      <div className="space-y-4">

        {listings?.map((listing) => {

  const frontPhoto =
    listing.property_photos?.find(
      (photo: any) =>
        photo.photo_type === "Front House"
    );

  return (

          <div
            key={listing.id}
            className="bg-white border rounded-lg shadow-sm p-5"
          >

            <div className="flex items-start gap-5">

              <div className="w-48 h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">

  {frontPhoto ? (

    <img
      src={frontPhoto.image_url}
      alt="Front House"
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

    </div>
  );
}