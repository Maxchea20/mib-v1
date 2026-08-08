// File: src/components/pdf/ListingBrochure.tsx

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

type Props = {
  listing: any;
};

/* =========================================================
   COLOURS
========================================================= */

const C = {
  navy: "#09233D",
  navyDark: "#061A2D",
  gold: "#D9A62E",
  goldLight: "#E7B94D",
  white: "#FFFFFF",
  black: "#111827",
  gray: "#667085",
  light: "#E5E7EB",
  soft: "#F5F7F9",
  green: "#D9A62E",
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  page: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    padding: 0,
  },

  /* =====================================================
     PAGE 1
  ===================================================== */

  pageOne: {
    padding: 0,
    backgroundColor: C.white,
  },

  hero: {
    height: 350,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },

  heroImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  /*
    Left-side dark overlay.
    This is what creates the same visual effect
    as the reference brochure.
  */

  heroOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "62%",
    backgroundColor: "rgba(4, 25, 44, 0.58)",
  },

  heroOverlayBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 125,
    backgroundColor: "rgba(4, 25, 44, 0.42)",
  },

  heroContent: {
    position: "absolute",
    left: 32,
    top: 25,
    right: 32,
    bottom: 20,
  },

  logoBox: {
    width: 74,
    height: 64,
    borderWidth: 1,
    borderColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    color: C.white,
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  logoSub: {
    color: C.white,
    fontSize: 6,
    marginTop: 3,
    letterSpacing: 0.8,
  },

  logoTagline: {
    color: C.white,
    fontSize: 4.5,
    marginTop: 5,
  },

  /* =====================================================
     SALE RIBBON
  ===================================================== */

  ribbon: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 62,
    minHeight: 82,
    backgroundColor: C.gold,
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
  },

  ribbonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.05,
  },

  ribbonPoint: {
    position: "absolute",
    bottom: -13,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 31,
    borderRightWidth: 31,
    borderTopWidth: 13,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: C.gold,
  },

  /* =====================================================
     HERO TEXT
  ===================================================== */

  heroText: {
    position: "absolute",
    left: 0,
    bottom: 76,
    width: "86%",
  },

  heroTitle: {
    color: C.white,
    fontSize: 25,
    fontWeight: "bold",
    lineHeight: 1.08,
    textTransform: "uppercase",
  },

  heroSubtitle: {
    color: C.goldLight,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 5,
    textTransform: "uppercase",
  },

  heroLocation: {
    color: C.white,
    fontSize: 8.5,
    marginTop: 10,
  },

  /* =====================================================
     PRICE BAND
  ===================================================== */

  priceBand: {
    height: 94,
    backgroundColor: C.navyDark,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 32,
    paddingRight: 32,
  },

  priceBlock: {
    width: "40%",
  },

  priceLabel: {
    color: C.white,
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 4,
  },

  price: {
    color: C.goldLight,
    fontSize: 25,
    fontWeight: "bold",
  },

  negotiable: {
    color: C.white,
    fontSize: 8,
    marginTop: 2,
  },

  keyFacts: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  fact: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },

  factIcon: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },

  factIconText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "bold",
  },

  factLabel: {
  color: C.white,
  fontSize: 7,
  fontWeight: "bold",
  textAlign: "center",
  textTransform: "uppercase",
},

  factValue: {
  color: C.white,
  fontSize: 8.5,
  marginTop: 3,
  textAlign: "center",
},

  /* =====================================================
     OVERVIEW
  ===================================================== */

  overview: {
    paddingTop: 15,
    paddingLeft: 32,
    paddingRight: 32,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: C.navy,
  },

  shortGoldLine: {
    width: 28,
    height: 2,
    backgroundColor: C.gold,
    marginRight: 8,
    marginTop: 4,
  },

  longGoldLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.gold,
    marginLeft: 12,
  },

  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  overviewItem: {
    width: "20%",
    height: 63,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.light,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  overviewIcon: {
    fontSize: 15,
    color: C.navy,
    marginBottom: 4,
  },

  overviewLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: C.navy,
    textAlign: "center",
    textTransform: "uppercase",
  },

  overviewValue: {
    fontSize: 7.5,
    color: C.black,
    marginTop: 3,
    textAlign: "center",
  },

  /* =====================================================
     HIGHLIGHTS
  ===================================================== */

  highlights: {
    paddingTop: 13,
    paddingLeft: 32,
    paddingRight: 32,
  },

  highlightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  highlight: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 5,
    paddingRight: 10,
  },

  check: {
    color: C.gold,
    fontSize: 10,
    width: 14,
    fontWeight: "bold",
  },

  highlightText: {
    flex: 1,
    fontSize: 7.5,
    color: C.black,
    lineHeight: 1.25,
  },

  /* =====================================================
     FOOTER
  ===================================================== */

  pageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 35,
    backgroundColor: C.navyDark,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  footerBrand: {
    color: C.white,
    fontSize: 8,
    fontWeight: "bold",
  },

  footerText: {
    color: "#D5DEE8",
    fontSize: 6.5,
  },

  /* =====================================================
     PAGE 2
  ===================================================== */

  pageTwo: {
    padding: 30,
    backgroundColor: C.white,
  },

  galleryHeader: {
    marginBottom: 10,
  },

  galleryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.navy,
  },

  galleryUnderline: {
    width: 32,
    height: 2,
    backgroundColor: C.gold,
    marginTop: 5,
  },

  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  galleryPhoto: {
    width: "32%",
    height: 128,
    objectFit: "cover",
    marginRight: "2%",
    marginBottom: 8,
  },

  galleryPhotoLast: {
    marginRight: 0,
  },

  /* =====================================================
     PAGE 2 INFO
  ===================================================== */

  infoArea: {
    flexDirection: "row",
    marginTop: 7,
  },

  descriptionArea: {
    width: "57%",
    paddingRight: 15,
  },

  locationArea: {
    width: "43%",
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: C.light,
  },

  infoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.navy,
  },

  infoGoldLine: {
    width: 28,
    height: 2,
    backgroundColor: C.gold,
    marginTop: 5,
    marginBottom: 8,
  },

  description: {
    fontSize: 8,
    color: "#374151",
    lineHeight: 1.45,
  },

  locationBox: {
    backgroundColor: C.soft,
    padding: 10,
  },

  locationText: {
    fontSize: 8,
    color: C.black,
    lineHeight: 1.5,
  },

  /* =====================================================
     AGENT
  ===================================================== */

  agentPanel: {
    marginTop: 14,
    minHeight: 78,
    backgroundColor: "#EEF1F4",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  agentLeft: {
    width: "65%",
    flexDirection: "row",
    alignItems: "center",
  },

  agentAvatar: {
    width: 52,
    height: 52,
    objectFit: "cover",
    marginRight: 10,
  },

  agentNoPhoto: {
    width: 52,
    height: 52,
    backgroundColor: C.navy,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  agentNoPhotoText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  agentLabel: {
    fontSize: 6,
    color: C.gray,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 3,
  },

  agentName: {
    fontSize: 11,
    color: C.navy,
    fontWeight: "bold",
  },

  agentReg: {
    fontSize: 6.5,
    color: C.gray,
    marginTop: 2,
  },

  agentContact: {
    fontSize: 7,
    color: C.black,
    marginTop: 4,
  },

  agentRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#C7CDD4",
    paddingLeft: 15,
    justifyContent: "center",
  },

  interested: {
    fontSize: 7,
    fontWeight: "bold",
    color: C.navy,
    marginBottom: 4,
  },

  contactToday: {
    fontSize: 7.5,
    color: C.black,
    lineHeight: 1.4,
  },

  mibLogo: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "bold",
    color: C.navy,
  },

  disclaimer: {
    fontSize: 5.8,
    color: C.gray,
    textAlign: "center",
    marginTop: 6,
  },

});

/* =========================================================
   HELPERS
========================================================= */

function clean(
  value: any
): string | null {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return String(value);
}

function price(
  value: any
): string {

  const number =
    Number(value);

  if (!number) {
    return "Price Upon Request";
  }

  return `RM ${number.toLocaleString()}`;
}


// =========================================
// NEW HELPER — TITLE WRAPPING
// =========================================

function wrapTitle(title: string): string[] {

  const words =
    title
      .toUpperCase()
      .trim()
      .split(/\s+/);

  const lines: string[] = [];

  let current = "";

  for (const word of words) {

    const test =
      current.length > 0
        ? `${current} ${word}`
        : word;

    if (test.length <= 28) {

      current = test;

    } else {

      if (current) {
        lines.push(current);
      }

      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 2);
}

function add(
  array: {
    label: string;
    value: string;
    icon: string;
  }[],
  label: string,
  value: any,
  icon: string
) {

  const cleaned =
    clean(value);

  if (cleaned) {
    array.push({
      label,
      value: cleaned,
      icon,
    });
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ListingBrochure({
  listing,
}: Props) {

  /* =====================================================
     PHOTOS
  ===================================================== */

  const photos =
    Array.isArray(
      listing.property_photos
    )
      ? listing.property_photos.filter(
          (photo: any) =>
            photo?.image_url
        )
      : [];

  const coverMap: Record<
    string,
    string
  > = {
    Residential: "Front House",
    Commercial: "Shop Front",
    Industrial: "Factory Front",
    Land: "Front View",
  };

  const coverType =
    coverMap[
      listing.category
    ];

  const coverPhoto =
    photos.find(
      (photo: any) =>
        photo.photo_type ===
        coverType
    ) ??
    photos[0];

  /*
    Maximum 9 total:
    1 hero + 8 gallery.
  */

  const galleryPhotos =
    photos
      .filter(
        (photo: any) =>
          photo.image_url !==
          coverPhoto?.image_url
      )
      .slice(0, 8);

  /* =====================================================
     LOCATION
  ===================================================== */

  const locationParts = [
    listing.address,
    listing.area,
    listing.state,
  ].filter(Boolean);

  const location =
    locationParts.join(", ");

  /* =====================================================
     TITLE
  ===================================================== */

  const title =
    String(
      listing.title ||
      "PROPERTY LISTING"
    );

  /*
    Split title for stronger hierarchy.

    Example:
    Double Storey Semi Detached Corner @ Sunway, Ipoh

    becomes approximately:
    DOUBLE STOREY SEMI DETACHED
    CORNER @ SUNWAY, IPOH
  */

  const titleLines =
  wrapTitle(
    String(
      listing.title ||
      "PROPERTY LISTING"
    )
  );

  

  /* =====================================================
     OVERVIEW
  ===================================================== */

  const overview: {
    label: string;
    value: string;
    icon: string;
  }[] = [];

  if (
    listing.category ===
    "Residential"
  ) {

    add(
      overview,
      "Property Type",
      listing.residential_type,
      "⌂"
    );

    add(
      overview,
      "Category",
      listing.category,
      "▦"
    );

    add(
      overview,
      "Purpose",
      listing.purpose,
      "◇"
    );

    add(
      overview,
      "Bedrooms",
      listing.bedrooms,
      "▱"
    );

    add(
      overview,
      "Bathrooms",
      listing.bathrooms,
      "◊"
    );

    add(
      overview,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      overview,
      "Built-up",
      listing.built_up,
      "▥"
    );

    add(
      overview,
      "Tenure",
      listing.tenure,
      "▤"
    );

    add(
      overview,
      "Status",
      listing.status,
      "✓"
    );

    add(
      overview,
      "Facing",
      listing.facing,
      "↗"
    );

  } else if (
    listing.category ===
    "Commercial"
  ) {

    add(
      overview,
      "Property Type",
      listing.commercial_type,
      "▦"
    );

    add(
      overview,
      "Category",
      listing.category,
      "▤"
    );

    add(
      overview,
      "Purpose",
      listing.purpose,
      "◇"
    );

    add(
      overview,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      overview,
      "Built-up",
      listing.built_up,
      "▥"
    );

    add(
      overview,
      "Tenure",
      listing.tenure,
      "▤"
    );

    add(
      overview,
      "Status",
      listing.status,
      "✓"
    );

  } else if (
    listing.category ===
    "Industrial"
  ) {

    add(
      overview,
      "Factory Type",
      listing.industrial_property_type,
      "▦"
    );

    add(
      overview,
      "Category",
      listing.category,
      "▤"
    );

    add(
      overview,
      "Purpose",
      listing.purpose,
      "◇"
    );

    add(
      overview,
      "Zoning",
      listing.industrial_zoning,
      "⌂"
    );

    add(
      overview,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      overview,
      "Built-up",
      listing.built_up,
      "▥"
    );

    add(
      overview,
      "Ceiling Height",
      listing.industrial_ceiling_height,
      "↕"
    );

    add(
      overview,
      "Power Supply",
      listing.industrial_power_supply,
      "⚡"
    );

    add(
      overview,
      "Tenure",
      listing.tenure,
      "▤"
    );

    add(
      overview,
      "Status",
      listing.status,
      "✓"
    );

  } else if (
    listing.category ===
    "Land"
  ) {

    add(
      overview,
      "Land Type",
      listing.land_type,
      "⌂"
    );

    add(
      overview,
      "Category",
      listing.category,
      "▤"
    );

    add(
      overview,
      "Purpose",
      listing.purpose,
      "◇"
    );

    add(
      overview,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      overview,
      "Tenure",
      listing.tenure,
      "▤"
    );

    add(
      overview,
      "Status",
      listing.status,
      "✓"
    );

  }

  /* =====================================================
     HIGHLIGHTS
  ===================================================== */

  const highlights: string[] = [];

  if (
    Array.isArray(
      listing.highlights
    )
  ) {

    listing.highlights.forEach(
      (item: any) => {

        if (item) {
          highlights.push(
            String(item)
          );
        }

      }
    );

  }

  if (
    highlights.length === 0 &&
    listing.remarks
  ) {

    String(
      listing.remarks
    )
      .split("\n")
      .map(
        (line) =>
          line
            .replace(
              /^[-•*✓]+\s*/,
              ""
            )
            .trim()
      )
      .filter(Boolean)
      .forEach(
        (line) =>
          highlights.push(line)
      );

  }

  const finalHighlights =
    highlights.slice(0, 8);

  /* =====================================================
     KEY FACTS
  ===================================================== */

  const keyFacts: {
    label: string;
    value: string;
    icon: string;
  }[] = [];

  const category =
    listing.category;

  if (
    category ===
    "Residential"
  ) {

    add(
      keyFacts,
      "Property Type",
      listing.residential_type,
      "⌂"
    );

    add(
      keyFacts,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      keyFacts,
      "Built-up",
      listing.built_up,
      "▥"
    );

  } else if (
    category ===
    "Commercial"
  ) {

    add(
      keyFacts,
      "Property Type",
      listing.commercial_type,
      "▦"
    );

    add(
      keyFacts,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      keyFacts,
      "Built-up",
      listing.built_up,
      "▥"
    );

  } else if (
    category ===
    "Industrial"
  ) {

    add(
      keyFacts,
      "Factory Type",
      listing.industrial_property_type,
      "▦"
    );

    add(
      keyFacts,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      keyFacts,
      "Built-up",
      listing.built_up,
      "▥"
    );

  } else if (
    category ===
    "Land"
  ) {

    add(
      keyFacts,
      "Land Type",
      listing.land_type,
      "⌂"
    );

    add(
      keyFacts,
      "Land Area",
      listing.land_size,
      "⌁"
    );

    add(
      keyFacts,
      "Tenure",
      listing.tenure,
      "▤"
    );

  }

  /* =====================================================
     AGENT PHOTO
  ===================================================== */

  const agentPhoto =
    listing.agent_photo ||
    listing.agent_photo_url ||
    null;

  const purpose =
    String(
      listing.purpose ||
      "Sell"
    ).toLowerCase();

  const badge =
    purpose === "rent"
      ? "FOR RENT"
      : "FOR SALE";

  /* =====================================================
     DOCUMENT
  ===================================================== */

  return (

    <Document>

      {/* =================================================
          PAGE 1
      ================================================= */}

      <Page
        size="A4"
        style={
          styles.pageOne
        }
      >

        {/* HERO */}

        <View style={styles.hero}>

          {coverPhoto?.image_url ? (

            <Image
              src={
                coverPhoto.image_url
              }
              style={
                styles.heroImage
              }
            />

          ) : (

            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor:
                  C.navy,
              }}
            />

          )}

          <View
            style={
              styles.heroOverlay
            }
          />

          <View
            style={
              styles.heroOverlayBottom
            }
          />

          <View
            style={
              styles.heroContent
            }
          >

            {/* LOGO */}

            <View
              style={
                styles.logoBox
              }
            >

              <Text
                style={
                  styles.logoText
                }
              >
                MIB
              </Text>

              <Text
                style={
                  styles.logoSub
                }
              >
                PROPERTIES
              </Text>

              <Text
                style={
                  styles.logoTagline
                }
              >
                Your Vision. Our Mission.
              </Text>

            </View>

            {/* RIBBON */}

            <View
              style={
                styles.ribbon
              }
            >

              <Text
                style={
                  styles.ribbonText
                }
              >
                {badge.replace(
                  " ",
                  "\n"
                )}
              </Text>

              <View
                style={
                  styles.ribbonPoint
                }
              />

            </View>

            {/* TITLE */}

            <View
              style={
                styles.heroText
              }
            >

              {titleLines.map(
  (line, index) => (

    <Text
      key={index}
      style={
        styles.heroTitle
      }
    >
      {line}
    </Text>

  )
)}

              {location && (

                <Text
                  style={
                    styles.heroLocation
                  }
                >
                  ● {location}
                </Text>

              )}

            </View>

          </View>

        </View>

        {/* PRICE BAND */}

        <View
          style={
            styles.priceBand
          }
        >

          <View
            style={
              styles.priceBlock
            }
          >

            <Text
              style={
                styles.priceLabel
              }
            >
              {purpose === "rent"
                ? "ASKING RENT"
                : "ASKING PRICE"}
            </Text>

            <Text
              style={
                styles.price
              }
            >
              {price(
                listing.price
              )}
            </Text>

            {listing.negotiable && (

              <Text
                style={
                  styles.negotiable
                }
              >
                (Negotiable)
              </Text>

            )}

          </View>

          <View
            style={
              styles.keyFacts
            }
          >

            {keyFacts
              .slice(0, 3)
              .map(
                (
                  fact,
                  index
                ) => (

                  <View
                    key={index}
                    style={
                      styles.fact
                    }
                  >

                    <View
                      style={
                        styles.factIcon
                      }
                    >

                      <Text
                        style={
                          styles.factIconText
                        }
                      >
                        {fact.icon}
                      </Text>

                    </View>

                    <Text
                      style={
                        styles.factLabel
                      }
                    >
                      {fact.label}
                    </Text>

                    <Text
                      style={
                        styles.factValue
                      }
                    >
                      {fact.value}
                    </Text>

                  </View>

                )
              )}

          </View>

        </View>

        {/* PROPERTY OVERVIEW */}

        {overview.length > 0 && (

          <View
            style={
              styles.overview
            }
          >

            <View
              style={
                styles.sectionTitleRow
              }
            >

              <View
                style={
                  styles.shortGoldLine
                }
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                PROPERTY OVERVIEW
              </Text>

              <View
                style={
                  styles.longGoldLine
                }
              />

            </View>

            <View
              style={
                styles.overviewGrid
              }
            >

              {overview
                .slice(0, 10)
                .map(
                  (
                    item,
                    index
                  ) => (

                    <View
                      key={index}
                      style={
                        styles.overviewItem
                      }
                    >

                      <Text
                        style={
                          styles.overviewIcon
                        }
                      >
                        {item.icon}
                      </Text>

                      <Text
                        style={
                          styles.overviewLabel
                        }
                      >
                        {item.label}
                      </Text>

                      <Text
                        style={
                          styles.overviewValue
                        }
                      >
                        {item.value}
                      </Text>

                    </View>

                  )
                )}

            </View>

          </View>

        )}

        {/* HIGHLIGHTS */}

        {finalHighlights.length > 0 && (

          <View
            style={
              styles.highlights
            }
          >

            <View
              style={
                styles.sectionTitleRow
              }
            >

              <View
                style={
                  styles.shortGoldLine
                }
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                PROPERTY HIGHLIGHTS
              </Text>

              <View
                style={
                  styles.longGoldLine
                }
              />

            </View>

            <View
              style={
                styles.highlightGrid
              }
            >

              {finalHighlights.map(
                (
                  item,
                  index
                ) => (

                  <View
                    key={index}
                    style={
                      styles.highlight
                    }
                  >

                    <Text
                      style={
                        styles.check
                      }
                    >
                      ✓
                    </Text>

                    <Text
                      style={
                        styles.highlightText
                      }
                    >
                      {item}
                    </Text>

                  </View>

                )
              )}

            </View>

          </View>

        )}

        {/* FOOTER */}

        <View
          style={
            styles.pageFooter
          }
        >

          <Text
            style={
              styles.footerBrand
            }
          >
            MIB PROPERTIES
          </Text>

          <Text
            style={
              styles.footerText
            }
          >
            Property Information • Page 1
          </Text>

        </View>

      </Page>

      {/* =================================================
          PAGE 2
      ================================================= */}

      <Page
        size="A4"
        style={
          styles.pageTwo
        }
      >

        {/* GALLERY */}

        <View
          style={
            styles.galleryHeader
          }
        >

          <Text
            style={
              styles.galleryTitle
            }
          >
            PHOTO GALLERY
          </Text>

          <View
            style={
              styles.galleryUnderline
            }
          />

        </View>

        <View
          style={
            styles.gallery
          }
        >

          {galleryPhotos.map(
            (
              photo: any,
              index: number
            ) => {

              const last =
                index % 3 === 2;

              return (

                <Image
                  key={index}
                  src={
                    photo.image_url
                  }
                  style={[
                    styles.galleryPhoto,
                    last
                      ? styles.galleryPhotoLast
                      : {},
                  ]}
                />

              );

            }
          )}

        </View>

        {/* DESCRIPTION + LOCATION */}

        <View
          style={
            styles.infoArea
          }
        >

          <View
            style={
              styles.descriptionArea
            }
          >

            <Text
              style={
                styles.infoTitle
              }
            >
              DESCRIPTION
            </Text>

            <View
              style={
                styles.infoGoldLine
              }
            />

            <Text
              style={
                styles.description
              }
            >
              {listing.description ||
                "Property information available upon request."}
            </Text>

          </View>

          <View
            style={
              styles.locationArea
            }
          >

            <Text
              style={
                styles.infoTitle
              }
            >
              LOCATION
            </Text>

            <View
              style={
                styles.infoGoldLine
              }
            />

            <View
              style={
                styles.locationBox
              }
            >

              <Text
                style={
                  styles.locationText
                }
              >
                {location ||
                  "Location information available upon request."}
              </Text>

            </View>

          </View>

        </View>

        {/* AGENT */}

        <View
          style={
            styles.agentPanel
          }
        >

          <View
            style={
              styles.agentLeft
            }
          >

            {agentPhoto ? (

              <Image
                src={agentPhoto}
                style={
                  styles.agentAvatar
                }
              />

            ) : (

              <View
                style={
                  styles.agentNoPhoto
                }
              >

                <Text
                  style={
                    styles.agentNoPhotoText
                  }
                >
                  M
                </Text>

              </View>

            )}

            <View>

              <Text
                style={
                  styles.agentLabel
                }
              >
                LISTING AGENT
              </Text>

              <Text
                style={
                  styles.agentName
                }
              >
                {listing.listing_agent ||
                  "MIB PROPERTY AGENT"}
              </Text>

              {listing.agent_reg_no && (

                <Text
                  style={
                    styles.agentReg
                  }
                >
                  {listing.agent_reg_no}
                </Text>

              )}

              {listing.agent_phone && (

                <Text
                  style={
                    styles.agentContact
                  }
                >
                  ☎ {listing.agent_phone}
                </Text>

              )}

              {listing.agent_email && (

                <Text
                  style={
                    styles.agentContact
                  }
                >
                  ✉ {listing.agent_email}
                </Text>

              )}

            </View>

          </View>

          <View
            style={
              styles.agentRight
            }
          >

            <Text
              style={
                styles.interested
              }
            >
              INTERESTED IN THIS PROPERTY?
            </Text>

            <Text
              style={
                styles.contactToday
              }
            >
              Contact us today{"\n"}
              for viewing arrangement.
            </Text>

            <Text
              style={
                styles.mibLogo
              }
            >
              MIB
            </Text>

          </View>

        </View>

        <Text
          style={
            styles.disclaimer
          }
        >
          All information contained herein is deemed reliable but not guaranteed.
          All measurements are approximate and subject to final verification.
        </Text>

        {/* PAGE 2 FOOTER */}

        <View
          style={
            styles.pageFooter
          }
        >

          <Text
            style={
              styles.footerBrand
            }
          >
            MIB PROPERTIES
          </Text>

          <Text
            style={
              styles.footerText
            }
          >
            Property Information • Page 2
          </Text>

        </View>

      </Page>

    </Document>

  );
}