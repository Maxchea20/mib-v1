// File: src/lib/matching.ts

export type MatchResult = {
  score: number;

  matchedRequirements: string[];

  failedRequirements: string[];
};

export const MATCH_WEIGHTS = {
  CATEGORY: 25,
  PURPOSE: 15,
  LOCATION: 15,
  BUDGET: 15,
  REQUIREMENT: 30,
} as const;

export const MATCH_SETTINGS = {
  BUDGET_TOLERANCE_PERCENT: 10,
} as const;

export function calculateMatchScore(
  buyer: any,
  listing: any,
): MatchResult {

  let score = 0;

  const matchedRequirements: string[] = [];

  const failedRequirements: string[] = [];

  function addMatch(
    title: string,
  ) {

    matchedRequirements.push(title);

  }

  function addFail(
    title: string,
  ) {

    failedRequirements.push(title);

  }

  // =====================================
  // CATEGORY
  // =====================================

  if (
    buyer.category === listing.category
  ) {

    score += MATCH_WEIGHTS.CATEGORY;

    addMatch(
      "Property Category"
    );

  } else {

    addFail(
      "Property Category"
    );

  }

  // =====================================
  // PURPOSE
  // =====================================

  const buyerPurpose =
    buyer.purpose?.toLowerCase();

  const listingPurpose =
    listing.purpose?.toLowerCase();

  const purposeMatched =

    (buyerPurpose === "buy" &&
      listingPurpose === "sale") ||

    (buyerPurpose === "rent" &&
      listingPurpose === "rent");

  if (purposeMatched) {

    score += MATCH_WEIGHTS.PURPOSE;

    addMatch(
      "Purpose"
    );

  } else {

    addFail(
      "Purpose"
    );

  }

  // =====================================
  // BUDGET
  // =====================================

  const buyerBudget =
    Number(buyer.budget);

  const listingPrice =
    Number(listing.price);

  if (
    buyerBudget > 0 &&
    listingPrice > 0
  ) {

    const tolerance =
      buyerBudget *
      (
        MATCH_SETTINGS
          .BUDGET_TOLERANCE_PERCENT /
        100
      );

    const minimum =
      buyerBudget - tolerance;

    const maximum =
      buyerBudget + tolerance;

    if (
      listingPrice >= minimum &&
      listingPrice <= maximum
    ) {

      score +=
        MATCH_WEIGHTS.BUDGET;

      addMatch(
        "Budget"
      );

    } else {

      addFail(
        "Budget"
      );

    }

  }

  // =====================================
  // <<< CONTINUE PASTING PART 2 HERE >>>
  // =====================================

    // =====================================
  // LOCATION
  // =====================================

  const buyerLocation =
    buyer.preferred_location
      ?.trim()
      .toLowerCase();

  const listingLocation = (
    listing.area ||
    listing.address ||
    ""
  )
    .trim()
    .toLowerCase();

  if (
    buyerLocation &&
    listingLocation
  ) {

    if (
      listingLocation.includes(
        buyerLocation
      )
    ) {

      score +=
        MATCH_WEIGHTS.LOCATION;

      addMatch(
        "Preferred Location"
      );

    } else {

      addFail(
        "Preferred Location"
      );

    }

  }

  // =====================================
  // RESIDENTIAL
  // =====================================

  if (
    buyer.category ===
    "Residential"
  ) {

    let matched = 0;

    let total = 0;

    if (
      buyer.residential_type
    ) {

      total++;

      if (
        buyer.residential_type ===
        listing.residential_type
      ) {

        matched++;

        addMatch(
          "Residential Type"
        );

      } else {

        addFail(
          "Residential Type"
        );

      }

    }

    if (
      buyer.residential_storey
    ) {

      total++;

      if (
        buyer.residential_storey ===
        listing.residential_storey
      ) {

        matched++;

        addMatch(
          "Storey"
        );

      } else {

        addFail(
          "Storey"
        );

      }

    }

    if (
      total > 0
    ) {

      score += Math.round(

        (
          matched /
          total
        ) *

        MATCH_WEIGHTS.REQUIREMENT

      );

    }

  }

  // =====================================
  // COMMERCIAL
  // =====================================

  if (
    buyer.category ===
    "Commercial"
  ) {

    let matched = 0;

    let total = 0;

    if (
      buyer.commercial_type
    ) {

      total++;

      if (
        buyer.commercial_type ===
        listing.commercial_type
      ) {

        matched++;

        addMatch(
          "Commercial Type"
        );

      } else {

        addFail(
          "Commercial Type"
        );

      }

    }

    if (
      total > 0
    ) {

      score += Math.round(

        (
          matched /
          total
        ) *

        MATCH_WEIGHTS.REQUIREMENT

      );

    }

  }

  // =====================================
  // <<< CONTINUE PASTING PART 3 HERE >>>
  // =====================================

    // =====================================
  // INDUSTRIAL
  // =====================================

  if (
    buyer.category ===
    "Industrial"
  ) {

    let matched = 0;

    let total = 0;

    // Factory Type

    if (
      buyer.industrial_property_type
    ) {

      total++;

      if (
        buyer.industrial_property_type ===
        listing.industrial_property_type
      ) {

        matched++;

        addMatch(
          "Factory Type"
        );

      } else {

        addFail(
          "Factory Type"
        );

      }

    }

    // Zoning

    if (
      buyer.industrial_zoning
    ) {

      total++;

      if (
        buyer.industrial_zoning ===
        listing.industrial_zoning
      ) {

        matched++;

        addMatch(
          "Industrial Zoning"
        );

      } else {

        addFail(
          "Industrial Zoning"
        );

      }

    }

    // Land Size

    if (
      buyer.industrial_land_size
    ) {

      total++;

      if (

        Number(
          listing.industrial_land_size
        ) >=

        Number(
          buyer.industrial_land_size
        )

      ) {

        matched++;

        addMatch(
          "Land Size"
        );

      } else {

        addFail(
          "Land Size"
        );

      }

    }

    // Built Up

    if (
      buyer.industrial_built_up
    ) {

      total++;

      if (

        Number(
          listing.industrial_built_up
        ) >=

        Number(
          buyer.industrial_built_up
        )

      ) {

        matched++;

        addMatch(
          "Built-up"
        );

      } else {

        addFail(
          "Built-up"
        );

      }

    }

    // Ceiling Height

    if (
      buyer.industrial_ceiling_height
    ) {

      total++;

      if (

        Number(
          listing.industrial_ceiling_height
        ) >=

        Number(
          buyer.industrial_ceiling_height
        )

      ) {

        matched++;

        addMatch(
          "Ceiling Height"
        );

      } else {

        addFail(
          "Ceiling Height"
        );

      }

    }

    // Power Supply

    if (
      buyer.industrial_power_supply
    ) {

      total++;

      if (

        Number(
          listing.industrial_power_supply
        ) >=

        Number(
          buyer.industrial_power_supply
        )

      ) {

        matched++;

        addMatch(
          "Power Supply"
        );

      } else {

        addFail(
          "Power Supply"
        );

      }

    }

    if (
      total > 0
    ) {

      score += Math.round(

        (
          matched /
          total
        ) *

        MATCH_WEIGHTS.REQUIREMENT

      );

    }

  }

  // =====================================
  // LAND
  // =====================================

  if (
    buyer.category ===
    "Land"
  ) {

    let matched = 0;

    let total = 0;

    // Land Type

    if (
      buyer.land_type
    ) {

      total++;

      if (
        buyer.land_type ===
        listing.land_type
      ) {

        matched++;

        addMatch(
          "Land Type"
        );

      } else {

        addFail(
          "Land Type"
        );

      }

    }

    // Land Size

    if (
      buyer.land_size
    ) {

      total++;

      if (

        Number(
          listing.land_size
        ) >=

        Number(
          buyer.land_size
        )

      ) {

        matched++;

        addMatch(
          "Land Size"
        );

      } else {

        addFail(
          "Land Size"
        );

      }

    }

    if (
      total > 0
    ) {

      score += Math.round(

        (
          matched /
          total
        ) *

        MATCH_WEIGHTS.REQUIREMENT

      );

    }

  }

  // =====================================
  // <<< CONTINUE PASTING PART 4 HERE >>>
  // =====================================
  return {

    score,

    matchedRequirements,

    failedRequirements,

  };

}
