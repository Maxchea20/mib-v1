// File: src/app/(app)/listings/[id]/page.tsx

export const dynamic = "force-dynamic";

import ListingActionsMenu from "@/components/listings/ListingActionsMenu";
import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import ListingTabs from "@/components/ListingTabs";
import MediaManager from "@/components/media/MediaManager";
import BuyerMatches from "@/components/matching/BuyerMatches";
import AIFacebookContentButton from "@/components/ai/AIFacebookContentButton";
import AIDescriptionButton from "@/components/ai/AIDescriptionButton";
import AIHighlightsButton from "@/components/ai/AIHighlightsButton";
import AIGeneratePropertyPosterButton from "@/components/ai/AIGeneratePropertyPosterButton";
import AIDesignTab from "@/components/ai/AIDesignTab";
import AIVideoTab from "@/components/ai/AIVideoTab";

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

    <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">

      {/* ================================= */}
      {/* COVER */}
      {/* ================================= */}

      <div className="bg-white border rounded-xl shadow-sm overflow-visible mb-4 sm:mb-5 md:mb-6">

        <div className="h-[240px] sm:h-[320px] md:h-[420px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl">

          {coverPhoto ? (

            <img
              src={coverPhoto.image_url}
              alt={coverPhotoType}
              className="w-full h-full object-cover"
            />

          ) : (

            <div className="text-gray-400 text-base sm:text-xl">
              No {coverPhotoType} Photo
            </div>

          )}

        </div>

        <div className="p-4 sm:p-5 md:p-6">

          <h1 className="text-2xl sm:text-3xl font-bold text-black leading-tight break-words">
            {listing.title}
          </h1>

          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
            RM {Number(
              listing.price
            ).toLocaleString()}
          </p>

          <div className="flex flex-col gap-4 mt-5 md:mt-6">

            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-6 text-sm sm:text-base text-gray-700 min-w-0">

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

            <div className="flex items-center justify-end gap-2 w-full min-w-0">

              <ListingActionsMenu
                listing={listing}
              />

              <Link
  href="/listings"
  className="shrink-0 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm"
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

          <div className="space-y-4 sm:space-y-6 md:space-y-8">

            {/* ================================= */}
            {/* GENERAL INFORMATION */}
            {/* ================================= */}

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 md:p-6">

              <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                📋 General Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-4 sm:gap-y-6">

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Title
                  </p>

                  <p className="text-base sm:text-lg font-semibold break-words">
                    {listing.title}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Listing Agent
                  </p>

                  <p className="text-base sm:text-lg font-semibold break-words">
                    {listing.listing_agent || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Category
                  </p>

                  <p className="text-base sm:text-lg font-semibold">
                    {listing.category}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Purpose
                  </p>

                  <p className="text-base sm:text-lg font-semibold">
                    {listing.purpose}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Status
                  </p>

                  <p className="text-base sm:text-lg font-semibold">
                    {listing.status}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Price
                  </p>

                  <p className="text-xl sm:text-2xl font-bold text-green-600">
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

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 md:p-6">

              <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                🏠 Property Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-4 sm:gap-y-6">

                {listing.category === "Residential" && (

                  <>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Residential Type
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.residential_type || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Storey
                      </p>

                      <p className="text-base sm:text-lg font-semibold">
                        {listing.residential_storey || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Bedrooms
                      </p>

                      <p className="text-base sm:text-lg font-semibold">
                        {listing.bedrooms ?? "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Bathrooms
                      </p>

                      <p className="text-base sm:text-lg font-semibold">
                        {listing.bathrooms ?? "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Land Size
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.land_size || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Built-up
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.built_up || "-"}
                      </p>

                    </div>

                  </>

                )}


                {listing.category === "Commercial" && (

                  <>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Commercial Type
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.commercial_type || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Land Size
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.land_size || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Built-up
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.built_up || "-"}
                      </p>

                    </div>

                  </>

                )}


                {listing.category === "Industrial" && (

                  <>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Industrial Property Type
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.industrial_property_type || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Industrial Zoning
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.industrial_zoning || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Ceiling Height
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.industrial_ceiling_height || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Power Supply
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.industrial_power_supply || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Land Size
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.land_size || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Built-up
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.built_up || "-"}
                      </p>

                    </div>

                  </>

                )}


                {listing.category === "Land" && (

                  <>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Land Type
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.land_type || "-"}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs sm:text-sm text-gray-500">
                        Land Size
                      </p>

                      <p className="text-base sm:text-lg font-semibold break-words">
                        {listing.land_size || "-"}
                      </p>

                    </div>

                  </>

                )}

              </div>


              {/* TENURE & FACING */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-4 sm:gap-y-6 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t">

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Tenure
                  </p>

                  <p className="text-base sm:text-lg font-semibold break-words">
                    {listing.tenure || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Facing
                  </p>

                  <p className="text-base sm:text-lg font-semibold break-words">
                    {listing.facing || "-"}
                  </p>

                </div>

              </div>

            </div>


            {/* ================================= */}
            {/* LOCATION */}
            {/* ================================= */}

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 md:p-6">

              <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                📍 Location
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-16 gap-y-4 sm:gap-y-6">

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Area
                  </p>

                  <p className="text-base sm:text-lg font-semibold break-words">
                    {listing.area || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    State
                  </p>

                  <p className="text-base sm:text-lg font-semibold break-words">
                    {listing.state || "-"}
                  </p>

                </div>

              </div>

            </div>


            {/* ================================= */}
            {/* PROPERTY HIGHLIGHTS */}
            {/* ================================= */}

            {Array.isArray(listing.highlights) &&
              listing.highlights.length > 0 && (

                <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 md:p-6">

                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                    ✨ Property Highlights
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-10 gap-y-3 sm:gap-y-4">

                    {listing.highlights.map(
                      (
                        highlight: string,
                        index: number
                      ) => (

                        <div
                          key={index}
                          className="flex items-start gap-3"
                        >

                          <span className="text-yellow-600 font-bold text-lg leading-none shrink-0">
                            ✓
                          </span>

                          <p className="text-sm sm:text-base text-black leading-6 break-words">
                            {highlight}
                          </p>

                        </div>

                      )
                    )}

                  </div>


                  {/* ONE AI BUTTON — OUTSIDE THE MAP */}

                  <div className="mt-5">

                    <AIHighlightsButton
                      listing={listing}
                    />

                  </div>

                </div>

              )}


            {/* ================================= */}
            {/* DESCRIPTION */}
            {/* ================================= */}

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-5 md:p-6">

              <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                📝 Description
              </h2>

              <p className="whitespace-pre-wrap leading-7 sm:leading-8 text-sm sm:text-base text-black break-words">
                {listing.description || "-"}
              </p>

              <div className="mt-5">

                <AIDescriptionButton
                  listing={listing}
                />

              </div>

            </div>

          </div>

        }


        gallery={

          <div className="w-full min-w-0 overflow-hidden">

            <MediaManager
              propertyId={listing.id}
              category={listing.category}
            />

          </div>

        }


        aiDesign={

          <div className="w-full min-w-0 overflow-hidden">

            <AIDesignTab
              key={`ai-design-${listing.id}`}
              listing={listing}
            />

          </div>

        }


        aiVideo={

          <div className="w-full min-w-0 overflow-hidden">

            <AIVideoTab
              key={`ai-video-${listing.id}`}
              listing={listing}
            />

          </div>

        }

      />


      {/* ================================= */}
      {/* MATCHING BUYERS */}
      {/* ================================= */}

      <div className="mt-4 sm:mt-6">

        <AIFacebookContentButton
          listing={listing}
        />

      </div>

      <div className="mt-4 sm:mt-6">

        <BuyerMatches
          listing={listing}
        />

      </div>

    </div>

  );
}