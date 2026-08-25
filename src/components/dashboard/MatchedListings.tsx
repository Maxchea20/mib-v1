import Link from "next/link";

import { supabase } from "@/lib/supabase";

import {
  calculateMatchScore,
} from "@/lib/matching";

export default async function MatchedListings() {

  /*
   * Get buyers
   */

  const { data: buyers } =
    await supabase
      .from("buyers")
      .select("*")
      .eq("purpose", "Buy");


  /*
   * Get listings
   */

  const { data: listings } =
    await supabase
      .from("properties")
      .select("*");


  if (
    !buyers ||
    buyers.length === 0 ||
    !listings ||
    listings.length === 0
  ) {

    return (
      <div className="bg-white rounded-xl shadow">

        <div className="border-b px-6 py-4">

          <h2 className="text-xl font-bold">
            Matched Listings & Buyers
          </h2>

        </div>

        <div className="px-6 py-8 text-gray-500">

          No buyers or listings available
          for matching.

        </div>

      </div>
    );

  }


  /*
   * Calculate all buyer → listing matches
   */

  const matches: any[] = [];

  buyers.forEach((buyer) => {

    listings.forEach((listing) => {

      const result =
        calculateMatchScore(
          buyer,
          listing
        );

      if (result.score >= 60) {

        matches.push({

          buyer,

          listing,

          score: result.score,

        });

      }

    });

  });


  /*
   * Highest score first
   */

  matches.sort(
    (a, b) =>
      b.score - a.score
  );


  /*
   * Dashboard only shows top 5
   */

  const topMatches =
    matches.slice(0, 5);


  return (

    <div className="bg-white rounded-xl shadow">

      {/* Header */}

      <div className="border-b px-6 py-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold">
              Matched Listings & Buyers
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Top property matches based on buyer requirements
            </p>

          </div>

          <span className="text-sm text-gray-500">
            {matches.length} total matches
          </span>

        </div>

      </div>


      {/* Matches */}

      <div className="divide-y">

        {topMatches.length === 0 ? (

          <div className="px-6 py-8 text-gray-500">
            No matching listings found.
          </div>

        ) : (

          topMatches.map((match) => (

            <div
              key={`${match.buyer.id}-${match.listing.id}`}
              className="px-6 py-5 hover:bg-gray-50"
            >

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">


                {/* BUYER */}

                <div className="md:col-span-4">

                  <p className="text-xs text-gray-500 uppercase">
                    Buyer
                  </p>

                  <Link
                    href={`/buyers/${match.buyer.id}`}
                    className="font-semibold text-black hover:underline"
                  >
                    {match.buyer.name}
                  </Link>

                  <p className="text-sm text-gray-500 mt-1">
                    Budget RM{" "}
                    {Number(
                      match.buyer.budget
                    ).toLocaleString()}
                  </p>

                </div>


                {/* ARROW */}

                <div className="hidden md:block md:col-span-1 text-center text-gray-400 text-xl">
                  →
                </div>


                {/* LISTING */}

                <div className="md:col-span-4">

                  <p className="text-xs text-gray-500 uppercase">
                    Listing
                  </p>

                  <Link
                    href={`/listings/${match.listing.id}`}
                    className="font-semibold text-black hover:underline"
                  >
                    {match.listing.title}
                  </Link>

                  <p className="text-sm text-gray-500 mt-1">
                    {match.listing.area || "-"}
                  </p>

                </div>


                {/* SCORE */}

                <div className="md:col-span-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-gray-500">
                      Match Score
                    </span>

                    <span className="font-bold text-black">
                      {match.score}%
                    </span>

                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">

                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${match.score}%`,
                      }}
                    />

                  </div>

                </div>


              </div>

            </div>

          ))

        )}

      </div>


      {/* Footer */}

      {matches.length > 5 && (

        <div className="border-t px-6 py-4">

          <Link
            href="/match"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all matches →
          </Link>

        </div>

      )}

    </div>

  );

}