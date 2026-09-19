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

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ListingProfilePage({ params }: Props) {
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

  if (!listing) notFound();

  const coverPhotoMap = {
    Residential: "Front House",
    Commercial: "Shop Front",
    Industrial: "Factory Front",
    Land: "Front View",
  };

  const coverPhotoType =
    coverPhotoMap[listing.category as keyof typeof coverPhotoMap] ?? "Front House";

  const coverPhoto = listing.property_photos?.find(
    (photo: any) => photo.photo_type === coverPhotoType
  );

  return (
    <div className="page-wrap">
      <div className="surface overflow-visible mb-4">
        <div className="h-[240px] sm:h-[320px] md:h-[420px] bg-[#e8dfd0] flex items-center justify-center overflow-hidden rounded-t-[1.25rem]">
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
          <h1 className="text-2xl sm:text-4xl font-display leading-tight break-words">
            {listing.headline || listing.title || "-"}
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-[var(--forest)] mt-2">
            RM{" "}
            {listing.price !== null && listing.price !== undefined
              ? Number(listing.price).toLocaleString()
              : "-"}
          </p>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {listing.city || listing.area || "-"}
            {listing.state ? `, ${listing.state}` : ""}
          </p>

          <div className="flex flex-col gap-4 mt-5 md:mt-6">
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-6 text-sm sm:text-base text-gray-700 min-w-0">
              <span><strong>Status:</strong> {listing.status || "-"}</span>
              <span><strong>Category:</strong> {listing.category || "-"}</span>
              <span><strong>Purpose:</strong> {listing.purpose || "-"}</span>
              <span><strong>Listing Agent:</strong> {listing.listing_agent || "-"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full min-w-0">
              <ShareListingSheet listing={listing} />
              <ListingActionsMenu listing={listing} />
              <Link href="/listings" className="btn-secondary shrink-0">Back</Link>
            </div>
          </div>
        </div>
      </div>

      <ListingTabs
        details={
          <div className="space-y-4">
            <div className="surface p-4 sm:p-6">
              <h2 className="text-xl font-display mb-4">General Information</h2>
              <p className="text-sm text-[var(--ink-soft)]">Headline</p>
              <p className="text-lg font-semibold break-words mb-4">{listing.headline || listing.title || "-"}</p>
              <p className="text-sm text-[var(--ink-soft)]">Category</p>
              <p className="text-lg font-semibold mb-4">{listing.category || "-"}</p>
              <p className="text-sm text-[var(--ink-soft)]">Purpose</p>
              <p className="text-lg font-semibold mb-4">{listing.purpose || "-"}</p>
              <p className="text-sm text-[var(--ink-soft)]">Status</p>
              <p className="text-lg font-semibold mb-4">{listing.status || "-"}</p>
              <AIDescriptionButton listing={listing} />
              <AIHighlightsButton listing={listing} />
              <AIFacebookContentButton listing={listing} />
            </div>
            <BuyerMatches listing={listing} />
          </div>
        }
        gallery={
          <MediaManager propertyId={listing.id} category={listing.category} />
        }
        aiDesign={<AIDesignTab listing={listing} />}
        aiVideo={<AIVideoTab listing={listing} />}
      />
    </div>
  );
}
