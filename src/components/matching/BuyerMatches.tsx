// File: src/components/matching/BuyerMatches.tsx

import Link from "next/link";

import { supabase } from "@/lib/supabase";

import {
  calculateMatchScore,
} from "@/lib/matching";

type Props = {
  listing: any;
};

export default async function BuyerMatches({
  listing,
}: Props) {

  const { data: buyers } =
    await supabase
      .from("buyers")
      .select("*");

  if (!buyers || buyers.length === 0) {

    return (

      <div className="border rounded-lg p-6 bg-white">

        <h2 className="text-2xl font-bold mb-4">
          Matching Buyers
        </h2>

        <p className="text-gray-500">
          No buyers found.
        </p>

      </div>

    );

  }

  const matches = buyers

    .map((buyer) => {

      const result =
        calculateMatchScore(
          buyer,
          listing
        );

      return {

        buyer,

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

    <div className="bg-white border rounded-lg shadow-sm p-6 mt-8">

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold">

          🔥 Matching Buyers

        </h2>

        <span className="text-gray-500">

          {matches.length} Match(es)

        </span>

      </div>

      {matches.length === 0 && (

        <div className="text-gray-500">

          No matching buyers found.

        </div>

      )}

      {matches.map((match) => (

        <div
          key={match.buyer.id}
          className="border rounded-lg p-5 mb-5"
        >

          <div className="flex justify-between items-start">

            <div>

              <h3 className="text-xl font-bold">

                {match.buyer.name}

              </h3>

              <p className="text-gray-600 mt-1">

                📞 {match.buyer.phone}

              </p>

              <p className="mt-2">

                RM{" "}

                {Number(
                  match.buyer.budget
                ).toLocaleString()}

              </p>

            </div>

            <div className="text-right">

              <div className="text-lg font-bold text-green-600">

                {match.score}%

              </div>

              <div className="w-56 bg-gray-200 rounded-full h-3 mt-2 overflow-hidden">

                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{
                    width: `${match.score}%`,
                  }}
                />

              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-5">

            <div>

              <h4 className="font-semibold text-green-700 mb-2">

                ✅ Matched

              </h4>

              <ul className="space-y-1">

                {match.matchedRequirements.map(
                  (item) => (

                    <li key={item}>
                      ✔ {item}
                    </li>

                  )
                )}

              </ul>

            </div>

            <div>

              <h4 className="font-semibold text-red-600 mb-2">

                ❌ Not Matched

              </h4>

              <ul className="space-y-1">

                {match.failedRequirements.map(
                  (item) => (

                    <li key={item}>
                      ✘ {item}
                    </li>

                  )
                )}

              </ul>

            </div>

          </div>

          <div className="mt-6 flex justify-end">

            <Link
              href={`/buyers/${match.buyer.id}?from=listing&listingId=${listing.id}&listingTitle=${encodeURIComponent(listing.title)}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              View Buyer
            </Link>

          </div>

        </div>

      ))}

    </div>

  );

}