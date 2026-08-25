import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function normalize(value: any): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

function numberValue(value: any): number | null {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function containsAny(
  text: string,
  keywords: string[]
): boolean {
  return keywords.some((keyword) =>
    text.includes(normalize(keyword))
  );
}

// =====================================
// PURPOSE
// =====================================

function purposeMatches(
  inquiryPurpose: string | null,
  listingPurpose: string | null
): boolean {

  const inquiry =
    normalize(inquiryPurpose);

  const listing =
    normalize(listingPurpose);

  // BUY inquiry → property FOR SALE
  if (inquiry === "buy") {
    return (
      listing === "sale" ||
      listing === "sell" ||
      listing === "for sale"
    );
  }

  // RENT inquiry → property FOR RENT
  if (inquiry === "rent") {
    return (
      listing === "rent" ||
      listing === "rental" ||
      listing === "for rent"
    );
  }

  return false;
}

// =====================================
// LISTING SEARCH TEXT
// =====================================
//
// We use existing listing information only.
// Nothing is written to Supabase.
//

function getListingSearchText(
  listing: any
): string {

  return normalize(
    [
      listing.title,
      listing.description,
      listing.highlights,
      listing.residential_type,
      listing.residential_storey,
      listing.commercial_type,
      listing.industrial_property_type,
      listing.industrial_zoning,
      listing.land_type,
      listing.facing,
      listing.area,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

// =====================================
// RESIDENTIAL TYPE
// =====================================

function residentialTypeMatches(
  requirements: any,
  listing: any
): boolean {

  const requiredType =
    normalize(
      requirements.residential_type
    );

  if (!requiredType) {
    return true;
  }

  const listingText =
    getListingSearchText(listing);

  // =====================================
  // SEMI-DETACHED
  // =====================================

  const wantsSemiDetached =
    containsAny(requiredType, [
      "semi detached",
      "semi d",
      "semi detach",
    ]);

  if (wantsSemiDetached) {

    const listingIsSemiDetached =
      containsAny(listingText, [
        "semi detached",
        "semi d",
        "semi detach",
      ]);

    if (!listingIsSemiDetached) {
      return false;
    }

    // Corner is only checked if the
    // inquiry explicitly asks for corner.
    if (
      requiredType.includes("corner")
    ) {
      return listingText.includes(
        "corner"
      );
    }

    return true;
  }

  // =====================================
  // TERRACE
  // =====================================

  const wantsTerrace =
    requiredType.includes(
      "terrace"
    ) ||
    requiredType.includes(
      "terrace house"
    );

  if (wantsTerrace) {

    if (
      !listingText.includes(
        "terrace"
      )
    ) {
      return false;
    }

    return true;
  }

  // =====================================
  // BUNGALOW
  // =====================================

  if (
    requiredType.includes(
      "bungalow"
    )
  ) {

    return listingText.includes(
      "bungalow"
    );
  }

  // =====================================
  // CONDO
  // =====================================

  if (
    requiredType.includes("condo") ||
    requiredType.includes(
      "condominium"
    )
  ) {

    return (
      listingText.includes("condo") ||
      listingText.includes(
        "condominium"
      )
    );
  }

  // =====================================
  // APARTMENT
  // =====================================

  if (
    requiredType.includes(
      "apartment"
    )
  ) {

    return listingText.includes(
      "apartment"
    );
  }

  // =====================================
  // DEFAULT
  // =====================================

  return (
    listingText.includes(
      requiredType
    ) ||
    requiredType.includes(
      listingText
    )
  );
}

// =====================================
// STOREY
// =====================================

function storeyMatches(
  requiredStorey: any,
  listing: any
): boolean {

  const required =
    normalize(requiredStorey);

  if (!required) {
    return true;
  }

  const listingText =
    getListingSearchText(listing);

  const wantsDouble =
    required.includes("double") ||
    required.includes("2 storey") ||
    required.includes("2sty") ||
    required === "2";

  const wantsSingle =
    required.includes("single") ||
    required.includes("1 storey") ||
    required.includes("1sty") ||
    required === "1";

  if (wantsDouble) {

    return (
      listingText.includes(
        "double storey"
      ) ||
      listingText.includes(
        "double story"
      ) ||
      listingText.includes(
        "2 storey"
      ) ||
      listingText.includes(
        "2sty"
      )
    );
  }

  if (wantsSingle) {

    return (
      listingText.includes(
        "single storey"
      ) ||
      listingText.includes(
        "single story"
      ) ||
      listingText.includes(
        "1 storey"
      ) ||
      listingText.includes(
        "1sty"
      )
    );
  }

  return (
    listingText.includes(
      required
    )
  );
}

// =====================================
// LOCATION
// =====================================

function locationMatches(
  requirements: any,
  listing: any
): boolean {

  const listingArea =
    normalize(listing.area);

  if (!listingArea) {
    return false;
  }

  const keywords =
    Array.isArray(
      requirements.location_keywords
    )
      ? requirements.location_keywords
      : [];

  if (keywords.length > 0) {

    return keywords.some(
      (keyword: string) => {

        const normalizedKeyword =
          normalize(keyword);

        return (
          normalizedKeyword &&
          (
            listingArea.includes(
              normalizedKeyword
            ) ||
            normalizedKeyword.includes(
              listingArea
            )
          )
        );
      }
    );
  }

  const preferredLocation =
    normalize(
      requirements.preferred_location
    );

  if (!preferredLocation) {
    return true;
  }

  return listingArea.includes(
    preferredLocation
  );
}

// =====================================
// BUDGET
// =====================================

function budgetMatches(
  requirements: any,
  listing: any
): boolean {

  const price =
    numberValue(listing.price);

  if (price === null) {
    return false;
  }

  let minimum =
    numberValue(
      requirements.budget_min
    );

  let maximum =
    numberValue(
      requirements.budget_max
    );

  // Backward compatibility
  if (
    minimum === null &&
    maximum === null
  ) {

    const budget =
      numberValue(
        requirements.budget
      );

    if (budget === null) {
      return true;
    }

    minimum = budget;
    maximum = budget;
  }

  // Current temporary tolerance:
  // ±10%
  if (minimum !== null) {
    minimum *= 0.9;
  }

  if (maximum !== null) {
    maximum *= 1.1;
  }

  if (
    minimum !== null &&
    price < minimum
  ) {
    return false;
  }

  if (
    maximum !== null &&
    price > maximum
  ) {
    return false;
  }

  return true;
}

// =====================================
// GENERIC TEXT
// =====================================

function genericTextMatches(
  requiredValue: any,
  listingValue: any
): boolean {

  const required =
    normalize(requiredValue);

  if (!required) {
    return true;
  }

  const listing =
    normalize(listingValue);

  if (!listing) {
    return false;
  }

  return (
    listing.includes(required) ||
    required.includes(listing)
  );
}

// =====================================
// POST
// =====================================

export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();

    const {
      requirements,
    } = body;

    if (
      !requirements ||
      typeof requirements !== "object"
    ) {

      return NextResponse.json(
        {
          success: false,
          error:
            "Matching requirements are required.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================
    // GET ONLY MAX'S LISTINGS
    // READ ONLY
    // =====================================

    const {
      data: properties,
      error,
    } = await supabase
      .from("properties")
      .select("*")
      .eq(
        "listing_agent",
        "Max"
      );

    if (error) {
      throw error;
    }

    // =====================================
    // BUILD DIAGNOSTIC MATCH RESULTS
    // =====================================

    const matches =
      (properties ?? [])
        .map((listing) => {

          const matchedRequirements: string[] = [];

          const failedRequirements: string[] = [];

          // =====================================
          // PURPOSE
          // =====================================

          if (
            requirements.purpose
          ) {

            if (
              purposeMatches(
                requirements.purpose,
                listing.purpose
              )
            ) {

              matchedRequirements.push(
                "Purpose"
              );

            } else {

              failedRequirements.push(
                "Purpose"
              );
            }
          }

          // =====================================
          // CATEGORY
          // =====================================

          if (
            requirements.category
          ) {

            if (
              normalize(
                requirements.category
              ) ===
              normalize(
                listing.category
              )
            ) {

              matchedRequirements.push(
                "Property Category"
              );

            } else {

              failedRequirements.push(
                "Property Category"
              );
            }
          }

          // =====================================
          // LOCATION
          // =====================================

          if (
            requirements.preferred_location ||
            (
              Array.isArray(
                requirements.location_keywords
              ) &&
              requirements.location_keywords.length > 0
            )
          ) {

            if (
              locationMatches(
                requirements,
                listing
              )
            ) {

              matchedRequirements.push(
                "Preferred Location"
              );

            } else {

              failedRequirements.push(
                "Preferred Location"
              );
            }
          }

          // =====================================
          // BUDGET
          // =====================================

          const hasBudget =
            requirements.budget !== null &&
            requirements.budget !== undefined ||
            requirements.budget_min !== null &&
            requirements.budget_min !== undefined ||
            requirements.budget_max !== null &&
            requirements.budget_max !== undefined;

          if (hasBudget) {

            if (
              budgetMatches(
                requirements,
                listing
              )
            ) {

              matchedRequirements.push(
                "Budget"
              );

            } else {

              failedRequirements.push(
                "Budget"
              );
            }
          }

          // =====================================
          // RESIDENTIAL TYPE
          // =====================================

          if (
            requirements.residential_type
          ) {

            if (
              residentialTypeMatches(
                requirements,
                listing
              )
            ) {

              matchedRequirements.push(
                "Residential Type"
              );

            } else {

              failedRequirements.push(
                "Residential Type"
              );
            }
          }

          // =====================================
          // RESIDENTIAL STOREY
          // =====================================

          if (
            requirements.residential_storey
          ) {

            if (
              storeyMatches(
                requirements.residential_storey,
                listing
              )
            ) {

              matchedRequirements.push(
                "Storey"
              );

            } else {

              failedRequirements.push(
                "Storey"
              );
            }
          }

          // =====================================
          // BEDROOMS
          // =====================================

          if (
            requirements.bedrooms !== null &&
            requirements.bedrooms !== undefined
          ) {

            const requiredBedrooms =
              numberValue(
                requirements.bedrooms
              );

            const listingBedrooms =
              numberValue(
                listing.bedrooms
              );

            if (
              requiredBedrooms !== null &&
              listingBedrooms !== null &&
              listingBedrooms >=
                requiredBedrooms
            ) {

              matchedRequirements.push(
                "Bedrooms"
              );

            } else {

              failedRequirements.push(
                "Bedrooms"
              );
            }
          }

          // =====================================
          // BATHROOMS
          // =====================================

          if (
            requirements.bathrooms !== null &&
            requirements.bathrooms !== undefined
          ) {

            const requiredBathrooms =
              numberValue(
                requirements.bathrooms
              );

            const listingBathrooms =
              numberValue(
                listing.bathrooms
              );

            if (
              requiredBathrooms !== null &&
              listingBathrooms !== null &&
              listingBathrooms >=
                requiredBathrooms
            ) {

              matchedRequirements.push(
                "Bathrooms"
              );

            } else {

              failedRequirements.push(
                "Bathrooms"
              );
            }
          }

          // =====================================
          // COMMERCIAL TYPE
          // =====================================

          if (
            requirements.commercial_type
          ) {

            if (
              genericTextMatches(
                requirements.commercial_type,
                listing.commercial_type
              )
            ) {

              matchedRequirements.push(
                "Commercial Type"
              );

            } else {

              failedRequirements.push(
                "Commercial Type"
              );
            }
          }

          // =====================================
          // INDUSTRIAL PROPERTY TYPE
          // =====================================

          if (
            requirements.industrial_property_type
          ) {

            if (
              genericTextMatches(
                requirements.industrial_property_type,
                listing.industrial_property_type
              )
            ) {

              matchedRequirements.push(
                "Industrial Property Type"
              );

            } else {

              failedRequirements.push(
                "Industrial Property Type"
              );
            }
          }

          // =====================================
          // INDUSTRIAL ZONING
          // =====================================

          if (
            requirements.industrial_zoning
          ) {

            if (
              genericTextMatches(
                requirements.industrial_zoning,
                listing.industrial_zoning
              )
            ) {

              matchedRequirements.push(
                "Industrial Zoning"
              );

            } else {

              failedRequirements.push(
                "Industrial Zoning"
              );
            }
          }

          // =====================================
          // INDUSTRIAL CEILING HEIGHT
          // =====================================

          if (
            requirements.industrial_ceiling_height !==
              null &&
            requirements.industrial_ceiling_height !==
              undefined
          ) {

            const requiredHeight =
              numberValue(
                requirements.industrial_ceiling_height
              );

            const listingHeight =
              numberValue(
                listing.industrial_ceiling_height
              );

            if (
              requiredHeight !== null &&
              listingHeight !== null &&
              listingHeight >=
                requiredHeight
            ) {

              matchedRequirements.push(
                "Ceiling Height"
              );

            } else {

              failedRequirements.push(
                "Ceiling Height"
              );
            }
          }

          // =====================================
          // INDUSTRIAL POWER
          // =====================================

          if (
            requirements.industrial_power_supply !==
              null &&
            requirements.industrial_power_supply !==
              undefined
          ) {

            const requiredPower =
              numberValue(
                requirements.industrial_power_supply
              );

            const listingPower =
              numberValue(
                listing.industrial_power_supply
              );

            if (
              requiredPower !== null &&
              listingPower !== null &&
              listingPower >=
                requiredPower
            ) {

              matchedRequirements.push(
                "Power Supply"
              );

            } else {

              failedRequirements.push(
                "Power Supply"
              );
            }
          }

          // =====================================
          // INDUSTRIAL LAND SIZE
          // =====================================

          if (
            requirements.industrial_land_size_min !==
              null &&
            requirements.industrial_land_size_min !==
              undefined
          ) {

            const requiredLand =
              numberValue(
                requirements.industrial_land_size_min
              );

            const listingLand =
              numberValue(
                listing.industrial_land_size
              ) ??
              numberValue(
                listing.land_size
              );

            if (
              requiredLand !== null &&
              listingLand !== null &&
              listingLand >=
                requiredLand
            ) {

              matchedRequirements.push(
                "Industrial Land Size"
              );

            } else {

              failedRequirements.push(
                "Industrial Land Size"
              );
            }
          }

          // =====================================
          // LAND TYPE
          // =====================================

          if (
            requirements.land_type
          ) {

            if (
              genericTextMatches(
                requirements.land_type,
                listing.land_type
              )
            ) {

              matchedRequirements.push(
                "Land Type"
              );

            } else {

              failedRequirements.push(
                "Land Type"
              );
            }
          }

          // =====================================
          // LAND SIZE
          // =====================================

          if (
            requirements.land_size_min !==
              null &&
            requirements.land_size_min !==
              undefined
          ) {

            const requiredLand =
              numberValue(
                requirements.land_size_min
              );

            const listingLand =
              numberValue(
                listing.land_size
              );

            if (
              requiredLand !== null &&
              listingLand !== null &&
              listingLand >=
                requiredLand
            ) {

              matchedRequirements.push(
                "Land Size"
              );

            } else {

              failedRequirements.push(
                "Land Size"
              );
            }
          }

          // =====================================
          // TENURE
          // =====================================

          if (
            requirements.tenure
          ) {

            if (
              genericTextMatches(
                requirements.tenure,
                listing.tenure
              )
            ) {

              matchedRequirements.push(
                "Tenure"
              );

            } else {

              failedRequirements.push(
                "Tenure"
              );
            }
          }

          // =====================================
          // FACING
          // =====================================

          if (
            requirements.facing
          ) {

            if (
              genericTextMatches(
                requirements.facing,
                listing.facing
              )
            ) {

              matchedRequirements.push(
                "Facing"
              );

            } else {

              failedRequirements.push(
                "Facing"
              );
            }
          }

          return {
            listing,
            matchedRequirements,
            failedRequirements,
          };
        });

    // =====================================
    // DIAGNOSTIC MODE
    // =====================================
    //
    // IMPORTANT:
    // Do NOT filter failed matches yet.
    //
    // We need to see WHY listings fail while
    // we refine the matcher.
    //

    return NextResponse.json({
      success: true,
      count: matches.length,
      matches,
    });

  } catch (error) {

    console.error(
      "AI Listing Match Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to find matching listings.",
      },
      {
        status: 500,
      }
    );
  }
}