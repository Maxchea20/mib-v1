// File: src/app/(app)/buyers/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BuyerProfilePage({
  params,
}: Props) {

  const { id } = await params;

  const { data: buyer } = await supabase
    .from("buyers")
    .select("*")
    .eq("id", id)
    .single();

  if (!buyer) {
    notFound();
  }

  return (

    <div className="max-w-6xl mx-auto p-6">

      <div className="bg-white rounded-lg shadow border overflow-hidden">

        {/* Header */}

        <div className="p-8 border-b">

          <h1 className="text-3xl font-bold text-black">
            {buyer.name}
          </h1>

          <p className="text-3xl font-bold text-green-600 mt-3">
            RM {Number(buyer.budget).toLocaleString()}
          </p>

        </div>

        {/* Details */}

        <div className="p-8">

          <h2 className="text-2xl font-bold mb-6">
            Buyer Details
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

        {/* Requirements */}

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
                  {buyer.residential_type}
                </p>

              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Storey
                </p>

                <p className="text-lg font-semibold">
                  {buyer.residential_storey}
                </p>

              </div>

            </div>

          )}

          {buyer.category === "Commercial" && (

            <div>

              <p className="text-sm text-gray-500">
                Property Type
              </p>

              <p className="text-lg font-semibold">
                {buyer.commercial_type}
              </p>

            </div>

          )}

          {buyer.category === "Industrial" && (

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">
                  Property Type
                </p>
                <p className="text-lg font-semibold">
                  {buyer.industrial_property_type}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Zoning
                </p>
                <p className="text-lg font-semibold">
                  {buyer.industrial_zoning}
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
                  {buyer.land_type}
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

        {/* Remarks */}

        <div className="border-t p-8">

          <h2 className="text-2xl font-bold mb-4">
            Remarks
          </h2>

          <p className="whitespace-pre-wrap">
            {buyer.remarks || "-"}
          </p>

        </div>

        {/* Buttons */}

        <div className="border-t p-6 flex justify-end gap-3">

          <Link
            href={`/buyers/${buyer.id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded"
          >
            Edit Buyer
          </Link>

          <Link
            href="/buyers"
            className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded"
          >
            Back
          </Link>

        </div>

      </div>

    </div>

  );

}