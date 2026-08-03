import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import MediaManager from "@/components/media/MediaManager";
import ListingTabs from "@/components/ListingTabs";

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
    .select(`
      *,
      property_photos (
        photo_type,
        image_url
      )
    `)
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

 const coverPhotoMap = {
  Residential: "Front House",
  Commercial: "Shop Front",
  Industrial: "Factory Front",
  Land: "Front View",
};

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
    <div className="max-w-7xl mx-auto p-6">

      {/* Cover */}

      <div className="bg-white border rounded-lg shadow overflow-hidden mb-6">

        <div className="h-[420px] bg-gray-100 flex items-center justify-center">

          {coverPhoto ? (

            <img
              src={coverPhoto.image_url}
              alt={coverPhotoType}
              className="w-full h-full object-cover"
            />

          ) : (

            <p className="text-gray-400 text-xl">
              No {coverPhotoType} Photo
            </p>

          )}

        </div>

        <div className="p-6">

          <h1 className="text-3xl font-bold text-black">
            {listing.title}
          </h1>

          <p className="text-3xl font-bold text-green-600 mt-2">
            RM {Number(listing.price).toLocaleString()}
          </p>

          <div className="flex justify-between items-end mt-5">

            <div className="flex flex-wrap gap-6 text-gray-700">

              <span>
                <strong>Status:</strong> {listing.status}
              </span>

              <span>
                <strong>Category:</strong> {listing.category}
              </span>

              <span>
                <strong>Purpose:</strong> {listing.purpose}
              </span>

              <span>
                <strong>Listing Agent:</strong>{" "}
                {listing.listing_agent || "-"}
              </span>

            </div>

            <div className="flex gap-3">

              <Link
                href={`/listings/${listing.id}/edit`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded"
              >
                Edit Listing
              </Link>

              <Link
                href="/listings"
                className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded"
              >
                Back
              </Link>

            </div>

          </div>

        </div>

      </div>

      <ListingTabs

        details={

          <div className="bg-white border rounded-lg shadow p-6">

            <h2 className="text-2xl font-bold text-black mb-6">
              📋 Property Details
            </h2>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">

              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="text-lg font-semibold text-black">
                  {listing.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Listing Agent</p>
                <p className="text-lg font-semibold text-black">
                  {listing.listing_agent || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-lg font-semibold text-black">
                  {listing.category}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="text-lg font-semibold text-black">
                  {listing.purpose}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-2xl font-bold text-green-600">
                  RM {Number(listing.price).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold text-black">
                  {listing.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-lg font-semibold text-black">
                  {listing.address || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="text-lg font-semibold text-black">
                  {listing.area}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="text-lg font-semibold text-black">
                  {listing.state}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Land Size</p>
                <p className="text-lg font-semibold text-black">
                  {listing.land_size || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Built-up</p>
                <p className="text-lg font-semibold text-black">
                  {listing.built_up || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="text-lg font-semibold text-black">
                  {listing.bedrooms ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="text-lg font-semibold text-black">
                  {listing.bathrooms ?? "-"}
                </p>
              </div>

            </div>

            <div className="mt-8 border-t pt-6">

              <p className="text-sm text-gray-500 mb-2">
                Description
              </p>

              <p className="text-lg text-black whitespace-pre-wrap leading-8">
                {listing.description || "-"}
              </p>

            </div>

          </div>

        }

        gallery={
          <MediaManager
            propertyId={listing.id}
            category={listing.category}
          />
        }

      />

    </div>
  );
}