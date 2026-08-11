"use client";

import { useState } from "react";

type Props = {
  onMatched?: (requirements: any) => void;
};

export default function AICobrokeMatcher({
  onMatched,
}: Props) {
  const [inquiry, setInquiry] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [requirements, setRequirements] =
    useState<any>(null);

  const [error, setError] =
    useState("");

    const [matches, setMatches] =
  useState<any[]>([]);

const [matching, setMatching] =
  useState(false);

  async function extractRequirements() {
    if (!inquiry.trim()) {
      setError(
        "Please paste a WhatsApp inquiry first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setRequirements(null);

    try {
      const response = await fetch(
        "/api/ai/match",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            inquiry:
              inquiry.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Failed to process inquiry."
        );
      }

      setRequirements(
        data.requirements
      );

      if (onMatched) {
        onMatched(
          data.requirements
        );
      }

    } catch (err: any) {
      console.error(
        "AI Cobroke Matching Error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  }

  async function findMatches() {
  if (!requirements) {
    setError(
      "Please extract the inquiry requirements first."
    );
    return;
  }

  setMatching(true);
  setError("");
  setMatches([]);

  try {
    const response = await fetch(
      "/api/ai/match/listings",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          requirements,
        }),
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          "Failed to find matching listings."
      );
    }

    setMatches(
      data.matches || []
    );

  } catch (err: any) {
    console.error(
      "AI Listing Match Error:",
      err
    );

    setError(
      err.message ||
        "Something went wrong."
    );

  } finally {
    setMatching(false);
  }
}

 function clearInquiry() {
  setInquiry("");
  setRequirements(null);
  setMatches([]);
  setError("");
}

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">

      {/* HEADER */}

      <div className="mb-6">

        
      </div>


      {/* INPUT */}

      <textarea
        rows={10}
        value={inquiry}
        onChange={(e) =>
          setInquiry(
            e.target.value
          )
        }
        placeholder={`Paste WhatsApp inquiry here...

Example:
Looking for semi-D around Bercham or Tasek.
Budget around RM600k.
Need 4 bedrooms.
Prefer freehold.`}
        className="w-full border rounded-lg px-4 py-3 text-black bg-white leading-7 resize-y"
        disabled={loading}
      />


      {/* ACTIONS */}

      <div className="flex gap-3 mt-4">

        <button
          type="button"
          onClick={
            extractRequirements
          }
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
        >
          {loading
            ? "🤖 Reading..."
            : "🔍 Extract Requirements"}
        </button>


        <button
          type="button"
          onClick={clearInquiry}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
        >
          Clear
        </button>

      </div>


      {/* ERROR */}

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}


      {/* EXTRACTED REQUIREMENTS */}

      {requirements && (

        <div className="mt-6 border rounded-lg bg-gray-50 p-5">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-bold text-black">
              Extracted Requirements
            </h3>

            <span className="text-sm text-gray-500">
              Review before matching
            </span>

          </div>


          <div className="grid md:grid-cols-2 gap-4">

            {Object.entries(
              requirements
            ).map(
              ([key, value]) => {

                if (
                  value === null ||
                  value === "" ||
                  value === undefined
                ) {
                  return null;
                }

                return (
                  <div
                    key={key}
                    className="bg-white border rounded p-3"
                  >

                    <p className="text-xs text-gray-500 uppercase">
                      {key.replace(
                        /_/g,
                        " "
                      )}
                    </p>

                    <p className="text-black font-semibold mt-1">
                      {String(value)}
                    </p>

                  </div>
                );
              }
            )}

          </div>

           {/* FIND MAX MATCHES */}

    <div className="mt-6 flex gap-3">

      <button
        type="button"
        onClick={findMatches}
        disabled={matching}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-5 py-2 rounded font-medium"
      >
        {matching
          ? "🔍 Finding Matches..."
          : "🎯 Find Max's Matches"}
      </button>

    </div>

        </div>

      )}

            {/* ================================= */}
      {/* MATCH RESULTS */}
      {/* ================================= */}

      {requirements &&
        !matching &&
        matches.length === 0 && (
          <div className="mt-8 border rounded-lg bg-white p-8 text-center">

            <div className="text-4xl mb-3">
              ❌
            </div>

            <h3 className="text-xl font-bold text-black">
              No Match Found
            </h3>

            <p className="text-gray-500 mt-2">
              No Max listings matched this inquiry
              at the moment.
            </p>

          </div>
        )}


      {matches.length > 0 && (

        <div className="mt-8 border rounded-lg bg-gray-50 p-5">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h3 className="text-xl font-bold text-black">
                🏡 Matching Max Listings
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {matches.length} matching listing(s)
              </p>

            </div>

          </div>


          <div className="space-y-4">

            {matches.map((match) => (

              <div
                key={match.listing.id}
                className="bg-white border rounded-lg p-5"
              >

                <div className="flex flex-wrap justify-between items-start gap-5">

                  {/* LISTING INFO */}

                  <div>

                    <h4 className="text-xl font-bold text-black">
                      {match.listing.title}
                    </h4>

                    <p className="text-gray-600 mt-2">
                      📍 {match.listing.area || "-"}
                    </p>

                    <p className="text-xl font-bold text-green-600 mt-2">
                      RM{" "}
                      {Number(
                        match.listing.price
                      ).toLocaleString()}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">

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


                  

                </div>


                {/* MATCH DETAILS */}

                <div className="grid md:grid-cols-2 gap-6 mt-5">

                  <div>

                    <h5 className="font-semibold text-green-700 mb-2">
                      ✅ Matched
                    </h5>

                    {match.matchedRequirements
                      .length === 0 ? (

                      <p className="text-gray-500">
                        None
                      </p>

                    ) : (

                      <ul className="space-y-1 text-sm">

                        {match.matchedRequirements.map(
                          (item: string) => (

                            <li key={item}>
                              ✔ {item}
                            </li>

                          )
                        )}

                      </ul>

                    )}

                  </div>


                  <div>

                    <h5 className="font-semibold text-red-600 mb-2">
                      ❌ Not Matched
                    </h5>

                    {match.failedRequirements
                      .length === 0 ? (

                      <p className="text-gray-500">
                        None
                      </p>

                    ) : (

                      <ul className="space-y-1 text-sm">

                        {match.failedRequirements.map(
                          (item: string) => (

                            <li key={item}>
                              ✘ {item}
                            </li>

                          )
                        )}

                      </ul>

                    )}

                  </div>

                </div>


                {/* VIEW LISTING */}

                <div className="mt-5 flex justify-end">

                  <a
                    href={`/listings/${match.listing.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    View Listing
                  </a>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}