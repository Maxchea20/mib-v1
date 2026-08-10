// File: src/components/pdf/ListingBrochure.tsx

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Circle,
  Polyline,
} from "@react-pdf/renderer";

type Props = {
  listing: any;
};

/* =========================================================
   COLOUR PALETTE
========================================================= */

const C = {
  navy: "#09233D",
  navyDark: "#051A2E",
  gold: "#D9A62E",
  goldLight: "#E7B94D",
  white: "#FFFFFF",
  black: "#111827",
  slate: "#374151",
  gray: "#6B7280",
  light: "#E5E7EB",
  soft: "#F8FAFC",
  cardBg: "#EEF2F6",
};

/* =========================================================
   VECTOR ICONS (Native @react-pdf/renderer SVG)
========================================================= */

const IconHouse = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const IconCategory = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.8" fill="none" />
    <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="1.8" fill="none" />
    <Rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="1.8" fill="none" />
    <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);

const IconTag = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx="7" cy="7" r="1.5" fill={color} />
  </Svg>
);

const IconBed = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M2 4v16M2 8h20v12M2 12h20M7 8v4M12 8v4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const IconBath = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h1M4 21v1M20 21v1"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const IconRuler = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M3 10h18M7 5v5M12 5v3M17 5v5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconBuilding = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6 22V4a1 1 0 011-1h10a1 1 0 011 1v18M2 22h20M10 7h4M10 11h4M10 15h4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const IconTenure = ({ color = C.navy, size = 15 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Polyline points="14 2 14 8 20 8" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);

const IconCheck = ({ color = C.navy }: { color?: string }) => (
  <Svg width="15" height="15" viewBox="0 0 24 24">
    <Polyline
      points="20 6 9 17 4 12"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const IconCompass = ({ color = C.navy }: { color?: string }) => (
  <Svg width="15" height="15" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
    <Path
      d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

const IconPin = ({ color = C.white }: { color?: string }) => (
  <Svg width="10" height="10" viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
);

const IconCar = ({ color = C.navy }: { color?: string }) => (
  <Svg width="12" height="12" viewBox="0 0 24 24">
    <Path
      d="M5 17h14M5 11l2-5h10l2 5M3 11h18v6H3v-6z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Circle cx="7.5" cy="16.5" r="1.5" fill={color} />
    <Circle cx="16.5" cy="16.5" r="1.5" fill={color} />
  </Svg>
);

const IconGlobe = ({ color = C.white }: { color?: string }) => (
  <Svg width="10" height="10" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
    <Path d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  pageOne: {
    padding: 0,
    backgroundColor: C.white,
    fontFamily: "Helvetica",
  },

  pageTwo: {
    padding: 28,
    backgroundColor: C.white,
    fontFamily: "Helvetica",
  },

  /* HERO SECTION */
  hero: {
    height: 325,
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

  heroContent: {
    position: "absolute",
    left: 28,
    top: 22,
    right: 28,
    bottom: 16,
    justifyContent: "space-between",
  },

  logoBox: {
    width: 82,
    height: 68,
    borderWidth: 1.5,
    borderColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    backgroundColor: "rgba(5, 26, 46, 0.85)",
  },

  logoText: {
    color: C.white,
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },

  logoSub: {
    color: C.white,
    fontSize: 6.5,
    marginTop: 2,
    letterSpacing: 1,
  },

  logoTagline: {
    color: C.white,
    fontSize: 4.5,
    marginTop: 4,
  },

  /* SALE RIBBON */
  ribbon: {
    position: "absolute",
    right: 28,
    top: 0,
    width: 60,
    height: 75,
    backgroundColor: C.gold,
    justifyContent: "center",
    alignItems: "center",
  },

  ribbonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 1.1,
  },

  ribbonPoint: {
    position: "absolute",
    bottom: -12,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: C.gold,
  },

  /* HERO TEXT */
  heroText: {
    marginTop: "auto",
    width: "88%",
  },

  heroTitle: {
    color: C.white,
    fontSize: 34,
    fontWeight: "bold",
    lineHeight: 1.15,
    textTransform: "uppercase",
  },

  heroSubtitle: {
    color: C.goldLight,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  heroLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  heroLocation: {
    color: C.white,
    fontSize: 13,
    marginLeft: 4,
  },

  /* PRICE BAND */
  priceBand: {
    height: 92,
    backgroundColor: C.navyDark,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  priceBlock: {
    width: "38%",
  },

  priceLabel: {
    color: C.white,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
    letterSpacing: 0.8,
  },

  price: {
    color: C.goldLight,
    fontSize: 24,
    fontWeight: "bold",
  },

  negotiable: {
    color: C.white,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.9,
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

  factIconBox: {
    width: 34,
    height: 34,
    borderWidth: 1.2,
    borderColor: C.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    backgroundColor: "transparent",
  },

  factLabel: {
    color: C.white,
    fontSize: 6.5,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
  },

  factValue: {
    color: C.white,
    fontSize: 8.5,
    marginTop: 2,
    textAlign: "center",
  },

  /* SECTION HEADERS */
  section: {
    paddingTop: 16,
    paddingHorizontal: 28,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  shortGoldLine: {
    width: 28,
    height: 2.5,
    backgroundColor: C.gold,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.navy,
    letterSpacing: 0.5,
  },

  longGoldLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.gold,
    marginLeft: 12,
  },

  /* OVERVIEW GRID */
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: C.light,
  },

  overviewItem: {
    width: "20%",
    height: 58,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.light,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  overviewIconWrapper: {
    marginBottom: 3,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  overviewLabel: {
    fontSize: 6,
    fontWeight: "bold",
    color: C.navy,
    textAlign: "center",
    textTransform: "uppercase",
  },

  overviewValue: {
    fontSize: 7.5,
    color: C.black,
    marginTop: 2,
    textAlign: "center",
  },

  /* HIGHLIGHTS */
  highlightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  highlight: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 10,
  },

  check: {
    color: C.gold,
    fontSize: 10,
    width: 14,
    fontWeight: "bold",
    marginTop: -1,
  },

  highlightText: {
    flex: 1,
    fontSize: 7.5,
    color: C.black,
    lineHeight: 1.3,
  },

  /* FOOTER */
  pageOneFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    backgroundColor: C.navyDark,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  footerLink: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerLinkText: {
    color: C.white,
    fontSize: 7,
    marginLeft: 4,
  },

  /* PAGE 2 GALLERY */
  galleryHeader: {
    marginBottom: 10,
  },

  galleryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: C.navy,
    letterSpacing: 0.5,
  },

  galleryUnderline: {
    width: 32,
    height: 2.5,
    backgroundColor: C.gold,
    marginTop: 4,
  },

  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  galleryPhoto: {
    width: "32%",
    height: 125,
    objectFit: "cover",
    marginRight: "2%",
    marginBottom: 8,
  },

  galleryPhotoLast: {
    marginRight: 0,
  },

  /* PAGE 2 INFO AREA */
  infoArea: {
    flexDirection: "row",
    marginTop: 6,
  },

  descriptionArea: {
    width: "56%",
    paddingRight: 16,
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
    marginTop: 4,
    marginBottom: 8,
  },

  description: {
    fontSize: 10,
    color: C.slate,
    lineHeight: 1.45,
  },

  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  locationItemText: {
    fontSize: 10,
    color: C.black,
    marginLeft: 6,
    flex: 1,
    lineHeight: 1.3,
  },

  /* AGENT PANEL */
  agentPanel: {
    marginTop: 14,
    minHeight: 80,
    backgroundColor: C.cardBg,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  agentLeft: {
    width: "62%",
    flexDirection: "row",
    alignItems: "center",
  },

  agentAvatar: {
    width: 54,
    height: 54,
    objectFit: "cover",
    marginRight: 10,
  },

  agentNoPhoto: {
    width: 54,
    height: 54,
    backgroundColor: C.navy,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  agentNoPhotoText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  agentName: {
    fontSize: 14,
    color: C.navy,
    fontWeight: "bold",
  },

  agentReg: {
    fontSize: 10,
    color: C.gray,
    marginTop: 2,
  },

  agentContact: {
    fontSize: 10,
    color: C.black,
    marginTop: 3,
  },

  agentRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#CBD5E1",
    paddingLeft: 12,
  },

  interested: {
    fontSize: 7,
    fontWeight: "bold",
    color: C.navy,
    marginBottom: 3,
  },

  contactToday: {
    fontSize: 7.5,
    color: C.black,
    lineHeight: 1.35,
  },

  mibLogoBox: {
    width: 50,
    height: 42,
    backgroundColor: C.navy,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  mibLogoText: {
    color: C.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  mibLogoSub: {
    color: C.white,
    fontSize: 3.5,
    marginTop: 1,
  },

  disclaimer: {
    fontSize: 5.5,
    color: C.gray,
    textAlign: "center",
    marginTop: 6,
  },

  pageTwoFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 30,
    backgroundColor: C.navyDark,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  footerBrand: {
    color: C.white,
    fontSize: 7.5,
    fontWeight: "bold",
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 6.5,
  },
});

/* =========================================================
   HELPERS
========================================================= */

function clean(value: any): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
}

function price(value: any): string {
  const number = Number(value);
  if (!number) {
    return "Price Upon Request";
  }
  return `RM ${number.toLocaleString()}`;
}

function wrapTitle(title: string): string[] {
  const words = title.toUpperCase().trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current.length > 0 ? `${current} ${word}` : word;

    if (test.length <= 18) {
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
    icon: React.ReactNode;
  }[],
  label: string,
  value: any,
  icon: React.ReactNode
) {
  const cleaned = clean(value);
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

export default function ListingBrochure({ listing }: Props) {
  /* PHOTOS */
  const photos = Array.isArray(listing.property_photos)
    ? listing.property_photos.filter((photo: any) => photo?.image_url)
    : [];

  const coverMap: Record<string, string> = {
    Residential: "Front House",
    Commercial: "Shop Front",
    Industrial: "Factory Front",
    Land: "Front View",
  };

  const coverType = coverMap[listing.category];

  const coverPhoto =
    photos.find((photo: any) => photo.photo_type === coverType) ?? photos[0];

  const galleryPhotos = photos
    .filter((photo: any) => photo.image_url !== coverPhoto?.image_url)
    .slice(0, 8);

  /* LOCATION */
  const locationParts = [
    listing.address,
    listing.area,
    listing.state,
  ].filter(Boolean);

  const location = locationParts.join(", ");

  /* TITLE & SUBTITLE SPLIT */
  const rawTitle = String(listing.title || "Property Listing");

  let mainTitleString = rawTitle;
  let subTitleString = listing.area ? String(listing.area) : "";

  if (rawTitle.includes("@")) {
    const parts = rawTitle.split("@");
    mainTitleString = parts[0].trim();
    subTitleString = parts[1].trim();
  } else if (rawTitle.toUpperCase().includes(" IN ")) {
    const parts = rawTitle.split(/ in /i);
    mainTitleString = parts[0].trim();
    subTitleString = parts[1].trim();
  }

  const titleLines = wrapTitle(mainTitleString);

  /* OVERVIEW */
  const overview: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[] = [];

  if (listing.category === "Residential") {
    add(overview, "Property Type", listing.residential_type, <IconHouse />);
    add(overview, "Category", listing.category, <IconCategory />);
    add(overview, "Purpose", listing.purpose, <IconTag />);
    add(overview, "Bedrooms", listing.bedrooms, <IconBed />);
    add(overview, "Bathrooms", listing.bathrooms, <IconBath />);
    add(overview, "Land Area", listing.land_size, <IconRuler />);
    add(overview, "Built-up", listing.built_up, <IconBuilding />);
    add(overview, "Tenure", listing.tenure, <IconTenure />);
    add(overview, "Status", listing.status, <IconCheck />);
    add(overview, "Facing", listing.facing, <IconCompass />);
  } else if (listing.category === "Commercial") {
    add(overview, "Property Type", listing.commercial_type, <IconBuilding />);
    add(overview, "Category", listing.category, <IconCategory />);
    add(overview, "Purpose", listing.purpose, <IconTag />);
    add(overview, "Land Area", listing.land_size, <IconRuler />);
    add(overview, "Built-up", listing.built_up, <IconBuilding />);
    add(overview, "Tenure", listing.tenure, <IconTenure />);
    add(overview, "Status", listing.status, <IconCheck />);
  } else if (listing.category === "Industrial") {
    add(overview, "Factory Type", listing.industrial_property_type, <IconBuilding />);
    add(overview, "Category", listing.category, <IconCategory />);
    add(overview, "Purpose", listing.purpose, <IconTag />);
    add(overview, "Zoning", listing.industrial_zoning, <IconHouse />);
    add(overview, "Land Area", listing.land_size, <IconRuler />);
    add(overview, "Built-up", listing.built_up, <IconBuilding />);
    add(overview, "Tenure", listing.tenure, <IconTenure />);
    add(overview, "Status", listing.status, <IconCheck />);
  } else if (listing.category === "Land") {
    add(overview, "Land Type", listing.land_type, <IconHouse />);
    add(overview, "Category", listing.category, <IconCategory />);
    add(overview, "Purpose", listing.purpose, <IconTag />);
    add(overview, "Land Area", listing.land_size, <IconRuler />);
    add(overview, "Tenure", listing.tenure, <IconTenure />);
    add(overview, "Status", listing.status, <IconCheck />);
  }

  /* HIGHLIGHTS */
  const highlights: string[] = [];

  if (Array.isArray(listing.highlights)) {
    listing.highlights.forEach((item: any) => {
      if (item) {
        highlights.push(String(item));
      }
    });
  }

  if (highlights.length === 0 && listing.remarks) {
    String(listing.remarks)
      .split("\n")
      .map((line) => line.replace(/^[-•*✓]+\s*/, "").trim())
      .filter(Boolean)
      .forEach((line) => highlights.push(line));
  }

  const finalHighlights = highlights.slice(0, 8);

  /* KEY FACTS */
  const keyFacts: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }[] = [];

  const category = listing.category;

  if (category === "Residential") {
    add(keyFacts, "Tenure", listing.tenure, <IconTenure color={C.white} size={22} />);
    add(keyFacts, "Land Area", listing.land_size, <IconRuler color={C.white} size={22} />);
    add(keyFacts, "Built-up", listing.built_up, <IconBuilding color={C.white} size={22} />);
  } else if (category === "Commercial") {
    add(keyFacts, "Tenure", listing.tenure, <IconTenure color={C.white} size={22} />);
    add(keyFacts, "Land Area", listing.land_size, <IconRuler color={C.white} size={22} />);
    add(keyFacts, "Built-up", listing.built_up, <IconBuilding color={C.white} size={22} />);
  } else if (category === "Industrial") {
    add(keyFacts, "Tenure", listing.tenure, <IconTenure color={C.white} size={22} />);
    add(keyFacts, "Land Area", listing.land_size, <IconRuler color={C.white} size={22} />);
    add(keyFacts, "Built-up", listing.built_up, <IconBuilding color={C.white} size={22} />);
  } else if (category === "Land") {
    add(keyFacts, "Tenure", listing.tenure, <IconTenure color={C.white} size={22} />);
    add(keyFacts, "Land Area", listing.land_size, <IconRuler color={C.white} size={22} />);
    add(keyFacts, "Category", listing.category, <IconCategory color={C.white} size={22} />);
  }

  /* AGENT & BADGE */
  const agentPhoto = listing.agent_photo || listing.agent_photo_url || null;
  const purpose = String(listing.purpose || "Sell").toLowerCase();
  const badge = purpose === "rent" ? "FOR RENT" : "FOR SALE";

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.pageOne}>
        {/* HERO */}
        <View style={styles.hero}>
          {coverPhoto?.image_url ? (
            <Image src={coverPhoto.image_url} style={styles.heroImage} />
          ) : (
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: C.navy,
              }}
            />
          )}

          

          <View style={styles.heroContent}>
            {/* LOGO */}
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>MIB</Text>
              <Text style={styles.logoSub}>PROPERTIES</Text>
              <Text style={styles.logoTagline}>Your Vision. Our Mission.</Text>
            </View>

            {/* TITLE & LOCATION */}
            <View style={styles.heroText}>
              {titleLines.map((line, index) => (
                <Text key={index} style={styles.heroTitle}>
                  {line}
                </Text>
              ))}

              {subTitleString && (
                <Text style={styles.heroSubtitle}>{subTitleString.toUpperCase()}</Text>
              )}

              {location && (
                <View style={styles.heroLocationRow}>
                  <IconPin color={C.white} />
                  <Text style={styles.heroLocation}>{location}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* PRICE BAND */}
        <View style={styles.priceBand}>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>
              {purpose === "rent" ? "ASKING RENT" : "ASKING PRICE"}
            </Text>
            <Text style={styles.price}>{price(listing.price)}</Text>
            <Text style={styles.negotiable}>(Negotiable)</Text>
          </View>

          <View style={styles.keyFacts}>
            {keyFacts.slice(0, 3).map((fact, index) => (
              <View key={index} style={styles.fact}>
                <View style={styles.factIconBox}>{fact.icon}</View>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* PROPERTY OVERVIEW */}
        {overview.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.shortGoldLine} />
              <Text style={styles.sectionTitle}>PROPERTY OVERVIEW</Text>
              <View style={styles.longGoldLine} />
            </View>

            <View style={styles.overviewGrid}>
              {overview.slice(0, 10).map((item, index) => (
                <View key={index} style={styles.overviewItem}>
                  <View style={styles.overviewIconWrapper}>{item.icon}</View>
                  <Text style={styles.overviewLabel}>{item.label}</Text>
                  <Text style={styles.overviewValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PROPERTY HIGHLIGHTS */}
        {finalHighlights.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.shortGoldLine} />
              <Text style={styles.sectionTitle}>PROPERTY HIGHLIGHTS</Text>
              <View style={styles.longGoldLine} />
            </View>

            <View style={styles.highlightGrid}>
              {finalHighlights.map((item, index) => (
                <View key={index} style={styles.highlight}>
                  <Text style={styles.check}>✓</Text>
                  <Text style={styles.highlightText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.pageOneFooter}>
          <View style={styles.footerLink}>
            <IconGlobe color={C.white} />
            <Text style={styles.footerLinkText}>maxzchea@gmail.com</Text>
          </View>
          <View style={styles.footerLink}>
            <Text style={styles.footerLinkText}>f Max Property</Text>
          </View>
          <View style={styles.footerLink}>
            <Text style={styles.footerLinkText}>📷 MaxProperty</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.pageTwo}>
        {/* GALLERY */}
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>PHOTO GALLERY</Text>
          <View style={styles.galleryUnderline} />
        </View>

        <View style={styles.galleryGrid}>
          {galleryPhotos.map((photo: any, index: number) => {
            const last = index % 3 === 2;
            return (
              <Image
                key={index}
                src={photo.image_url}
                style={[
                  styles.galleryPhoto,
                  last ? styles.galleryPhotoLast : {},
                ]}
              />
            );
          })}
        </View>

        {/* DESCRIPTION + LOCATION */}
        <View style={styles.infoArea}>
          <View style={styles.descriptionArea}>
            <Text style={styles.infoTitle}>DESCRIPTION</Text>
            <View style={styles.infoGoldLine} />
            <Text style={styles.description}>
              {listing.description ||
                "Property information available upon request."}
            </Text>
          </View>

          <View style={locationAreaStyle}>
            <Text style={styles.infoTitle}>LOCATION</Text>
            <View style={styles.infoGoldLine} />

            {location && (
              <View style={styles.locationItem}>
                <IconPin color={C.navy} />
                <Text style={styles.locationItemText}>{location}</Text>
              </View>
            )}

            {listing.area && (
              <View style={styles.locationItem}>
                <IconCar color={C.navy} />
                <Text style={styles.locationItemText}>
                  Convenient access to local amenities and city centre
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* AGENT PANEL */}
        <View style={styles.agentPanel}>
          <View style={styles.agentLeft}>
            {agentPhoto ? (
              <Image src={agentPhoto} style={styles.agentAvatar} />
            ) : (
              <View style={styles.agentNoPhoto}>
                <Text style={styles.agentNoPhotoText}>M</Text>
              </View>
            )}

            <View>
              <Text style={styles.agentName}>
                {listing.listing_agent || "MAX CHEA"}
              </Text>
              <Text style={styles.agentReg}>
                {listing.agent_reg_no || "REN 31953"}
              </Text>
              <Text style={styles.agentContact}>
                ☎ {listing.agent_phone || "016-521 0993"}
              </Text>
              {listing.agent_email && (
                <Text style={styles.agentContact}>
                  ✉ {listing.agent_email || "maxzchea@gmail.com"}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.agentRight}>
            <Text style={styles.interested}>INTERESTED IN THIS PROPERTY?</Text>
            <Text style={styles.contactToday}>
              Contact us today{"\n"}for viewing arrangement.
            </Text>
          </View>

          <View style={styles.mibLogoBox}>
            <Text style={styles.mibLogoText}>MAX</Text>
            <Text style={styles.mibLogoSub}>PROPERTY</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          All information contained herein is deemed reliable but not guaranteed.
          All measurements are approximate and subject to final verification.
        </Text>

        {/* PAGE 2 FOOTER */}
        <View style={styles.pageTwoFooter}>
          <Text style={styles.footerBrand}>MAX PROPERTY</Text>
          <Text style={styles.footerText}>Property Information • Page 2</Text>
        </View>
      </Page>
    </Document>
  );
}

const locationAreaStyle = {
  width: "44%",
  paddingLeft: 16,
};