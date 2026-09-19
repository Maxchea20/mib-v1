export const dynamic = "force-dynamic";

import ListingActionsMenu from "@/components/listings/ListingActionsMenu";
import ShareListingSheet from "@/components/listings/ShareListingSheet";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ListingTabs from "@/components/ListingTabs";
import MediaManager from "@/components/media/MediaManager";
import BuyerMatches from "@/components/matching/BuyerMatches";
import AIFacebookContentButton from "@/components/ai/AIFacebookContentButton";
import AIDescriptionButton from "@/components/ai/AIDescriptionButton";
import AIHighlightsButton from "@/components/ai/AIHighlightsButton";
import AIDesignTab from "@/components/ai/AIDesignTab";
import AIVideoTab from "@/components/ai/AIVideoTab";

type Props = { params: Promise<{ id: string }> };

export default async function ListingProfilePage({ params }: Props) {
  const { id } = await params;
  const { data: listing } = await supabase
    .from("properties")
    .select(`*, property_photos ( photo_type, image_url )`)
    .eq("id", id)
    .single();

  if (!listing) notFound();

  const coverPhotoMap = {
    Residential: "Front House",
    Commercial: "Shop Front",
    Industrial: "Factory Front",
    Land: "Front View",
  } as const;
  const coverPhotoType =
    coverPhotoMap[listing.category as keyof typeof coverPhotoMap] ?? "Front House";
  const coverPhoto = listing.property_photos?.find(
    (photo: any) => photo.photo_type === coverPhotoType
  );

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p className="text-xs sm:text-sm text-stone-500">{label}</p>
      <p className="text-base sm:text-lg font-semibold text-stone-900 break-words">{value ?? "-"}</p>
    </div>
  );

  return (
    <div className="page-wrap">
      <div className="bg-white border rounded-xl shadow-sm overflow-visible mb-4 sm:mb-5 md:mb-6">
        <div className="h-[240px] sm:h-[320px] md:h-[420px] bg-stone-100 flex items-center justify-center overflow-hidden rounded-t-xl">
          {coverPhoto ? (
            <img src={coverPhoto.image_url} alt={coverPhotoType} className="w-full h-full object-cover" />
          ) : (
            <div className="text-stone-400 text-base sm:text-xl">No {coverPhotoType} Photo</div>
          )}
        </div>
        <div className="p-4 sm:p-5 md:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight break-words">
            {listing.headline || listing.title || "-"}
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">
            RM {listing.price !== null && listing.price !== undefined ? Number(listing.price).toLocaleString() : "-"}
          </p>
          <p className="text-stone-600 mt-2 text-sm sm:text-base">
            {listing.city || listing.area || "-"}{listing.state ? `, ${listing.state}` : ""}
          </p>
          <div className="flex flex-col gap-4 mt-5 md:mt-6">
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-6 text-sm sm:text-base text-stone-700">
              <span><strong>Status:</strong> {listing.status || "-"}</span>
              <span><strong>Category:</strong> {listing.category || "-"}</span>
              <span><strong>Purpose:</strong> {listing.purpose || "-"}</span>
              <span><strong>Listing Agent:</strong> {listing.listing_agent || "-"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
              <ShareListingSheet listing={listing} />
              <ListingActionsMenu listing={listing} />
              <Link href="/listings" className="shrink-0 bg-stone-800 text-white px-4 py-2 rounded text-sm text-center">Back</Link>
            </div>
          </div>
        </div>
      </div>

      <ListingTabs
        details={
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">General Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Headline" value={listing.headline || listing.title} />
                <Field label="Listing Agent" value={listing.listing_agent} />
                <Field label="Category" value={listing.category} />
                <Field label="Purpose" value={listing.purpose} />
                <Field label="Status" value={listing.status} />
                <Field label="Price" value={listing.price !== null && listing.price !== undefined ? `RM ${Number(listing.price).toLocaleString()}` : "-"} />
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">Property Classification</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Category" value={listing.category} />
                <Field label="Property Type" value={listing.property_type} />
                <Field label="Property Sub Type" value={listing.property_sub_type} />
                <Field label="Property Unit Type" value={listing.unit_type} />
                {listing.category === "Commercial" && <Field label="Commercial Type" value={listing.commercial_type} />}
                {listing.category === "Industrial" && <Field label="Industrial Zoning" value={listing.industrial_zoning} />}
                {listing.category === "Land" && <Field label="Land Type" value={listing.land_type} />}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">Property Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {listing.category === "Residential" && (
                  <>
                    <Field label="Bedrooms" value={listing.bedrooms} />
                    <Field label="Bathrooms" value={listing.bathrooms} />
                    <Field label="Parking" value={listing.parking_spaces} />
                    <Field label="Built-up" value={listing.built_up} />
                    <Field label="Land Size" value={listing.land_size} />
                    <Field label="Furnishing" value={listing.furnishing ? String(listing.furnishing).replace(/_/g, " ") : "-"} />
                    {listing.furnishing_details && <Field label="Furnishing Details" value={listing.furnishing_details} />}
                  </>
                )}
                {listing.category === "Commercial" && (
                  <>
                    <Field label="Bathrooms" value={listing.bathrooms} />
                    <Field label="Built-up" value={listing.built_up} />
                    <Field label="Condition" value={listing.condition} />
                    <Field label="Electricity Phase" value={listing.electricity_phase} />
                    <Field label="Power Supply" value={listing.industrial_power_supply} />
                  </>
                )}
                {listing.category === "Industrial" && (
                  <>
                    <Field label="Bathrooms" value={listing.bathrooms} />
                    <Field label="Parking" value={listing.parking_spaces} />
                    <Field label="Built-up" value={listing.built_up} />
                    <Field label="Land Size" value={listing.land_size} />
                    <Field label="Condition" value={listing.condition} />
                    <Field label="Ceiling Height" value={listing.industrial_ceiling_height} />
                    <Field label="Electricity Phase" value={listing.electricity_phase} />
                    <Field label="Power Supply" value={listing.industrial_power_supply} />
                  </>
                )}
                {listing.category === "Land" && <Field label="Land Size" value={listing.land_size} />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-6 pt-6 border-t">
                <Field label="Tenure" value={listing.tenure} />
                <Field label="Title Type" value={listing.title_type} />
                <Field label="Facing" value={listing.facing} />
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Area" value={listing.area} />
                <Field label="City" value={listing.city} />
                <Field label="State" value={listing.state} />
                <Field label="Postal Code" value={listing.postal_code} />
                <Field label="Address" value={listing.address} />
              </div>
            </div>

            {Array.isArray(listing.highlights) && listing.highlights.length > 0 && (
              <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">Property Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.highlights.map((highlight: string, index: number) => (
                    <p key={index} className="text-sm sm:text-base text-stone-900">✓ {highlight}</p>
                  ))}
                </div>
                <div className="mt-5"><AIHighlightsButton listing={listing} /></div>
              </div>
            )}

            <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4">Description</h2>
              <p className="whitespace-pre-wrap leading-7 text-sm sm:text-base text-stone-900 break-words">
                {listing.description || "-"}
              </p>
              <div className="mt-5"><AIDescriptionButton listing={listing} /></div>
            </div>
          </div>
        }
        gallery={<MediaManager propertyId={listing.id} category={listing.category} />}
        aiDesign={<AIDesignTab key={`ai-design-${listing.id}`} listing={listing} />}
        aiVideo={<AIVideoTab key={`ai-video-${listing.id}`} listing={listing} />}
      />

      <div className="mt-4 sm:mt-6"><AIFacebookContentButton listing={listing} /></div>
      <div className="mt-4 sm:mt-6"><BuyerMatches listing={listing} /></div>
    </div>
  );
}
