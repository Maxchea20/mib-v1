// File: src/app/(app)/contacts/[id]/matches/page.tsx

export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import {
  calculateMatchScore,
} from "@/lib/matching";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MatchingListingsPage({
  params,
}: Props) {

  const { id } = await params;

  // =====================================
  // GET BUYER
  // =====================================

  const { data: buyer } =
    await supabase
      .from("buyers")
      .select("*")
      .eq("id", id)
      .single();

  if (!buyer) {
    notFound();
  }

  // =====================================
  // GET LISTINGS
  // =====================================

  const { data: properties } =
    await supabase
      .from("properties")
      .select("*");

  // =====================================
  // CALCULATE MATCHES
  // =====================================

  const matches = (properties ?? [])
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

  return (

    <div className="max-w-6xl mx-auto p-6">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">

        <div>

          <h1 className="text-3xl font-bold text-black">

            🏡 Matching Listings

          </h1>

          <p className="text-gray-500 mt-2">

            Buyers: {buyer.name}

          </p>

        </div>

        <Link
          href={`/contacts/${buyer.id}`}
          className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded"
        >
          ← Back to Buyer
        </Link>

      </div>

      {/* ================================= */}
      {/* MATCH COUNT */}
      {/* ================================= */}

      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">

        <p className="text-sm text-gray-500">

          Matching Listings

        </p>

        <p className="text-3xl font-bold text-green-600">

          {matches.length}

        </p>

      </div>

      {/* ================================= */}
      {/* NO MATCH */}
      {/* ================================= */}

      {matches.length === 0 && (

        <div className="bg-white border rounded-lg p-10 text-center text-gray-500">

          No matching listings found.

        </div>

      )}

      {/* ================================= */}
      {/* MATCHING LISTINGS */}
      {/* ================================= */}

      <div className="space-y-5">

        {matches.map((match) => (

          <div
            key={match.listing.id}
            className="bg-white border rounded-lg shadow-sm p-6"
          >

            <div className="flex flex-wrap justify-between items-start gap-6">

              {/* LISTING INFO */}

              <div>

                <h2 className="text-2xl font-bold text-black">

                  {match.listing.title}

                </h2>

                <p className="text-gray-600 mt-2">

                  📍 {match.listing.area || "-"}

                </p>

                <p className="text-2xl font-bold text-green-600 mt-3">

                  RM{" "}
                  {Number(
                    match.listing.price
                  ).toLocaleString()}

                </p>

                <div className="flex flex-wrap gap-4 mt-3 text-gray-600">

                  <span>
                    {match.listing.category}
                  </span>

                  <span>
                    {match.listing.purpose}
                  </span>

                  <span>
                    {match.listing.status}
                  </span>

                </div>

              </div>

              {/* MATCH SCORE */}

              <div className="text-right">

                <div
                  className={`text-4xl font-bold ${
                    match.score >= 90
                      ? "text-green-600"
                      : match.score >= 80
                      ? "text-blue-600"
                      : match.score >= 70
                      ? "text-orange-500"
                      : "text-red-600"
                  }`}
                >

                  {match.score}%

                </div>

                <div className="w-56 bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">

                  <div
                    className={`h-3 rounded-full ${
                      match.score >= 90
                        ? "bg-green-600"
                        : match.score >= 80
                        ? "bg-blue-600"
                        : match.score >= 70
                        ? "bg-orange-500"
                        : "bg-red-600"
                    }`}
                    style={{
                      width: `${match.score}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* ================================= */}
            {/* MATCH DETAILS */}
            {/* ================================= */}

            <div className="grid md:grid-cols-2 gap-8 mt-6">

              <div>

                <h3 className="font-semibold text-green-700 mb-2">

                  ✅ Matched

                </h3>

                {match.matchedRequirements.length === 0 ? (

                  <p className="text-gray-500">
                    None
                  </p>

                ) : (

                  <ul className="space-y-1">

                    {match.matchedRequirements.map(
                      (item) => (

                        <li key={item}>

                          ✔ {item}

                        </li>

                      )
                    )}

                  </ul>

                )}

              </div>

              <div>

                <h3 className="font-semibold text-red-600 mb-2">

                  ❌ Not Matched

                </h3>

                {match.failedRequirements.length === 0 ? (

                  <p className="text-gray-500">
                    None
                  </p>

                ) : (

                  <ul className="space-y-1">

                    {match.failedRequirements.map(
                      (item) => (

                        <li key={item}>

                          ✘ {item}

                        </li>

                      )
                    )}

                  </ul>

                )}

              </div>

            </div>

            {/* ================================= */}
            {/* VIEW LISTING */}
            {/* ================================= */}

            <div className="mt-6 flex justify-end">

              <Link
                href={`/listings/${match.listing.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
              >
                View Listing
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}