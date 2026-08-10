// File: src/app/(app)/listings/[id]/page.tsx
export const dynamic = "force-dynamic";
import ListingActionsMenu from "@/components/listings/ListingActionsMenu";
import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import ListingTabs from "@/components/ListingTabs";
import MediaManager from "@/components/media/MediaManager";
import BuyerMatches from "@/components/matching/BuyerMatches";
import AIDescriptionButton from "@/components/ai/AIDescriptionButton";
import AIHighlightsButton from "@/components/ai/AIHighlightsButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ListingProfilePage({
  params,
}: Props) {

  const { id } = await params;

  const { data: listing } =
    await supabase

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
    ] ??

    "Front House";

  const coverPhoto =

    listing.property_photos?.find(

      (photo: any) =>

        photo.photo_type ===
        coverPhotoType

    );

  return (

    <div className="max-w-7xl mx-auto p-6">

      {/* ================================= */}
      {/* COVER */}
      {/* ================================= */}

      <div className="bg-white border rounded-lg shadow overflow-visible mb-6">

        <div className="h-[420px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">

          {coverPhoto ? (

            <img
              src={coverPhoto.image_url}
              alt={coverPhotoType}
              className="w-full h-full object-cover"
            />

          ) : (

            <div className="text-gray-400 text-xl">

              No {coverPhotoType} Photo

            </div>

          )}

        </div>

        <div className="p-6">

          <h1 className="text-3xl font-bold text-black">

            {listing.title}

          </h1>

          <p className="text-3xl font-bold text-green-600 mt-2">

            RM {Number(
              listing.price
            ).toLocaleString()}

          </p>

          <div className="flex justify-between items-end mt-6">

            <div className="flex flex-wrap gap-6 text-gray-700">

              <span>

                <strong>Status:</strong>{" "}

                {listing.status}

              </span>

              <span>

                <strong>Category:</strong>{" "}

                {listing.category}

              </span>

              <span>

                <strong>Purpose:</strong>{" "}

                {listing.purpose}

              </span>

              <span>

                <strong>Listing Agent:</strong>{" "}

                {listing.listing_agent || "-"}

              </span>

            </div>

            <div className="flex items-center gap-2">

  <ListingActionsMenu
    listing={listing}
  />

  <Link
    href="/listings"
    className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-sm"
  >
    Back
  </Link>

</div>

          </div>

        </div>

      </div>

      {/* ================================= */}
      {/* TABS */}
      {/* ================================= */}

      <ListingTabs

// ======================================
// Continue Here Part 2
// ======================================
        details={

          <div className="space-y-8">

            {/* ================================= */}
            {/* GENERAL INFORMATION */}
            {/* ================================= */}

            <div className="bg-white border rounded-lg shadow p-6">

              <h2 className="text-2xl font-bold text-black mb-6">

                📋 General Information

              </h2>

              <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">

                <div>

                  <p className="text-sm text-gray-500">

                    Title

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.title}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    Listing Agent

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.listing_agent || "-"}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    Category

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.category}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    Purpose

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.purpose}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    Status

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.status}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    Price

                  </p>

                  <p className="text-2xl font-bold text-green-600">

                    RM {Number(
                      listing.price
                    ).toLocaleString()}

                  </p>

                </div>

              </div>

            </div>

            {/* ================================= */}
            {/* PROPERTY INFORMATION */}
            {/* ================================= */}

            <div className="bg-white border rounded-lg shadow p-6">

              <h2 className="text-2xl font-bold text-black mb-6">

                🏠 Property Information

              </h2>

              <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">

                {listing.category === "Residential" && (

                  <>

                    <div>

                      <p className="text-sm text-gray-500">

                        Residential Type

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.residential_type || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Storey

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.residential_storey || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Bedrooms

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.bedrooms ?? "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Bathrooms

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.bathrooms ?? "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Land Size

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.land_size || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Built-up

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.built_up || "-"}

                      </p>

                    </div>

                    

                  </>

                )}


                {listing.category === "Commercial" && (

                  <>

                    <div>

                      <p className="text-sm text-gray-500">

                        Commercial Type

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.commercial_type || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Land Size

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.land_size || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Built-up

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.built_up || "-"}

                      </p>

                    </div>

                  </>

                )}

                {listing.category === "Industrial" && (

                  <>

                    <div>

                      <p className="text-sm text-gray-500">

                        Industrial Property Type

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.industrial_property_type || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Industrial Zoning

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.industrial_zoning || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Ceiling Height

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.industrial_ceiling_height || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Power Supply

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.industrial_power_supply || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Land Size

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.land_size || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Built-up

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.built_up || "-"}

                      </p>

                    </div>

                  </>

                )}

                {listing.category === "Land" && (

                  <>

                    <div>

                      <p className="text-sm text-gray-500">

                        Land Type

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.land_type || "-"}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">

                        Land Size

                      </p>

                      <p className="text-lg font-semibold">

                        {listing.land_size || "-"}

                      </p>

                    </div>

                  </>

                )}

              </div>

              {/* TENURE & FACING */}

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 mt-6">

              <div>

                <p className="text-sm text-gray-500">
                  Tenure
                </p>

                <p className="text-lg font-semibold">
                  {listing.tenure || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Facing
                </p>

                <p className="text-lg font-semibold">
                  {listing.facing || "-"}
                </p>

              </div>

            </div>

            </div>
  
            {/* ================================= */}
            {/* LOCATION */}
            {/* ================================= */}

            <div className="bg-white border rounded-lg shadow p-6">

              <h2 className="text-2xl font-bold text-black mb-6">

                📍 Location

              </h2>

              <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">

                <div>

                  <p className="text-sm text-gray-500">

                    Area

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.area || "-"}

                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    State

                  </p>

                  <p className="text-lg font-semibold">

                    {listing.state || "-"}

                  </p>

                </div>

              </div>

            </div>

            {/* ================================= */}
            {/* Continue Here Part 4 */}
            {/* ================================= */}

                        {/* ================================= */}
            {/* PROPERTY HIGHLIGHTS */}
            {/* ================================= */}

            {Array.isArray(listing.highlights) &&
              listing.highlights.length > 0 && (

                <div className="bg-white border rounded-lg shadow p-6">

                  <h2 className="text-2xl font-bold text-black mb-6">
                    ✨ Property Highlights
                  </h2>

                  <div className="grid md:grid-cols-2 gap-x-10 gap-y-4">

                    {listing.highlights.map(
                      (highlight: string, index: number) => (

                        <div
                          key={index}
                          className="flex items-start gap-3"
                        >

                          <span className="text-yellow-600 font-bold text-lg leading-none">
                            ✓
                          </span>

                          <p className="text-black leading-6">
                            {highlight}
                          </p>

                          
                        </div>

                      )
                    )}

                  </div>

                  {/* ONE AI BUTTON — OUTSIDE THE MAP */}
  <AIHighlightsButton
    listing={listing}
  />

                </div>

              )}

            {/* ================================= */}
            {/* DESCRIPTION */}
            {/* ================================= */}

            <div className="bg-white border rounded-lg shadow p-6">

              <h2 className="text-2xl font-bold text-black mb-6">

                📝 Description

              </h2>

              <p className="whitespace-pre-wrap leading-8 text-black">

                {listing.description || "-"}

              </p>

              <AIDescriptionButton
    listing={listing}
  />

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

      {/* ================================= */}
      {/* MATCHING BUYERS */}
      {/* ================================= */}

      <BuyerMatches
        listing={listing}
      />

    </div>

  );

}