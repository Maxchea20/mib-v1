// File: src/app/(app)/contacts/[id]/page.tsx
export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OwnerPropertiesSection from "@/components/buyers/OwnerPropertiesSection";

import {
  calculateMatchScore,
} from "@/lib/matching";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    from?: string;
    listingId?: string;
    listingTitle?: string;
  }>;
};

export default async function BuyerProfilePage({
  params,
  searchParams,
}: Props) {

  const { id } = await params;

  const {
    from,
    listingId,
    listingTitle,
  } = await searchParams;

  const { data: buyer } =
    await supabase

      .from("buyers")

      .select("*")

      .eq("id", id)

      .single();

  if (!buyer) {

    notFound();

  }

  const { data: properties } =
    await supabase

      .from("properties")

      .select("*");

  const { data: ownerProperties } =
  await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", buyer.id);

    const isBuyer =
  buyer.is_buyer;

const isOwner =
  buyer.is_owner;

const isTenant =
  buyer.is_tenant;

    console.log("Buyer ID:", buyer.id);
console.log("Owner Properties:", ownerProperties);


  const matches =
    (properties ?? [])

      .map((listing) => {

        const result =
          calculateMatchScore(
            buyer,
            listing
          );

        return {

          listing,

          ...result,

        };

      })

      .filter(
        (match) =>
          match.score >= 60
      )

      .sort(
        (a, b) =>
          b.score - a.score
      );

  const matchedCount =
    matches.length;

  const bestMatch =
    matches.length > 0
      ? matches[0]
      : null;

  const MAX_TITLE_LENGTH = 15;

  const shortListingTitle =

    listingTitle

      ? listingTitle.length >
        MAX_TITLE_LENGTH

        ? listingTitle.substring(
            0,
            MAX_TITLE_LENGTH
          ) + "..."

        : listingTitle

      : "";

  return (

    <div className="max-w-6xl mx-auto p-6">

      <div className="bg-white rounded-lg shadow border overflow-hidden">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="grid md:grid-cols-2">

          {/* LEFT */}

          <div className="p-8 border-b md:border-b-0 md:border-r">

            <h1 className="text-3xl font-bold text-black">

              {buyer.name}

            </h1>

            <p className="text-red-500">
  Purpose: {buyer.purpose}
</p>

<p className="text-red-500">
  isBuyer: {String(isBuyer)}
</p>

<p className="text-red-500">
  isOwner: {String(isOwner)}
</p>

            <p className="text-3xl font-bold text-green-600 mt-3">

              RM {Number(
                buyer.budget
              ).toLocaleString()}

            </p>

          </div>

          {/* RIGHT */}

          <div className="p-8">

            <h2 className="text-xl font-bold text-black mb-6">

              🏡 Matching Listings

            </h2>

            <div className="space-y-5">

              <div>

                <p className="text-sm text-gray-500">

                  Listings Matched

                </p>

                <p className="text-3xl font-bold text-green-600">

                  {matchedCount}

                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">

                  Best Match

                </p>

                <p
                  className={`text-4xl font-bold ${
                    !bestMatch
                      ? "text-gray-400"
                      : bestMatch.score >= 90
                      ? "text-green-600"
                      : bestMatch.score >= 80
                      ? "text-blue-600"
                      : bestMatch.score >= 70
                      ? "text-orange-500"
                      : "text-red-600"
                  }`}
                >

                  {bestMatch
                    ? `${bestMatch.score}%`
                    : "--"}

                </p>

              </div>

              <div className="pt-3">

                <Link
                  href={`/buyers/${buyer.id}/matches`}
                  className={`inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold text-white transition ${
                    matchedCount === 0
                      ? "bg-gray-400 pointer-events-none"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >

                  View Matching Listings

                </Link>

              </div>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* GENERAL INFORMATION */}
        {/* ================================= */}

        <div className="p-8">

          <h2 className="text-2xl font-bold mb-6">

            Contact Information

          </h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">

            <div>

              <p className="text-sm text-gray-500">

                Phone

              </p>

              <p className="text-lg font-semibold">

                {buyer.phone}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">

                Status

              </p>

              <p className="text-lg font-semibold">

                {buyer.status}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">

                Lead Source

              </p>

              <p className="text-lg font-semibold">

                {buyer.lead_source}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">

                Purpose

              </p>

              <p className="text-lg font-semibold">

                {buyer.purpose}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">

                Category

              </p>

              <p className="text-lg font-semibold">

                {buyer.category}

              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">

                Preferred Location

              </p>

              <p className="text-lg font-semibold">

                {buyer.preferred_location || "-"}

              </p>

            </div>

          </div>

        </div>

        {/* ================================= */}
        {/* BUYER REQUIREMENT */}
        {/* ================================= */}

        {isBuyer && (

<div className="border-t p-8">

          <h2 className="text-2xl font-bold mb-6">

            Buyer Requirement

          </h2>

          {buyer.category === "Residential" && (

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <p className="text-sm text-gray-500">
                  Property Type
                </p>

                <p className="text-lg font-semibold">
                  {buyer.residential_type || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Storey
                </p>

                <p className="text-lg font-semibold">
                  {buyer.residential_storey || "-"}
                </p>

              </div>

            </div>

          )}

          {buyer.category === "Commercial" && (

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <p className="text-sm text-gray-500">
                  Commercial Type
                </p>

                <p className="text-lg font-semibold">
                  {buyer.commercial_type || "-"}
                </p>

              </div>

            </div>

          )}

          {buyer.category === "Industrial" && (

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <p className="text-sm text-gray-500">
                  Property Type
                </p>

                <p className="text-lg font-semibold">
                  {buyer.industrial_property_type || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Industrial Zoning
                </p>

                <p className="text-lg font-semibold">
                  {buyer.industrial_zoning || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Land Size
                </p>

                <p className="text-lg font-semibold">
                  {buyer.industrial_land_size || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Built-up
                </p>

                <p className="text-lg font-semibold">
                  {buyer.industrial_built_up || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Ceiling Height
                </p>

                <p className="text-lg font-semibold">
                  {buyer.industrial_ceiling_height || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Power Supply
                </p>

                <p className="text-lg font-semibold">
                  {buyer.industrial_power_supply || "-"}
                </p>

              </div>

            </div>

          )}

          {buyer.category === "Land" && (

            <div className="grid md:grid-cols-2 gap-6">

              <div>

                <p className="text-sm text-gray-500">
                  Land Type
                </p>

                <p className="text-lg font-semibold">
                  {buyer.land_type || "-"}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Land Size
                </p>

                <p className="text-lg font-semibold">
                  {buyer.land_size || "-"}
                </p>

              </div>

            </div>

          )}

        </div>

        )}

        {isOwner && (
  <OwnerPropertiesSection
    buyer={buyer}
    properties={ownerProperties ?? []}
  />
)}

        

        {/* ================================= */}
        {/* REMARKS */}
        {/* ================================= */}

        <div className="border-t p-8">

          <h2 className="text-2xl font-bold mb-4">

            Remarks

          </h2>

          <p className="whitespace-pre-wrap">

            {buyer.remarks || "-"}

          </p>

        </div>

        {/* ================================= */}
        {/* ACTION BUTTONS */}
        {/* ================================= */}

        <div className="border-t p-6">

          <div className="flex flex-wrap justify-end gap-3">

            <Link
              href={`/contacts/${buyer.id}/edit`}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded"
            >
              ✏ Edit Contact
            </Link>

            {from === "listing" &&
              listingId && (

                <Link
                  href={`/listings/${listingId}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
                >
                  ← Back to {shortListingTitle}
                </Link>

              )}

            <Link
              href="/contacts"
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded"
            >
              📋 Back to Contacts
            </Link>

          </div>

        </div>

      </div>

    </div>

  );

}