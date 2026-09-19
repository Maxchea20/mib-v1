import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Polyline,
} from "@react-pdf/renderer";

type Props = {
  listing: any;
  aiPlan?: any;
};

const C = {
  navy: "#09233D",
  navyDark: "#051A2E",
  gold: "#D9A62E",
  goldLight: "#E7B94D",
  white: "#FFFFFF",
  black: "#111827",
  slate: "#374151",
  gray: "#6B7280",
  line: "#E5E7EB",
  card: "#EEF2F6",
};

function Pin({ color }: { color: string }) {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={2} fill="none" />
      <Circle cx={12} cy={9} r={2.2} fill={color} />
    </Svg>
  );
}

function CarIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Path d="M5 17h14M5 11l2-5h10l2 5M3 11h18v6H3v-6z" stroke={C.navy} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24">
      <Polyline points="20 6 9 17 4 12" stroke={C.gold} strokeWidth={2.4} fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica" },
  hero: { height: 268, width: "100%", position: "relative" },
  heroImage: { position: "absolute", width: "100%", height: "100%", objectFit: "cover" },
  heroShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 150, backgroundColor: "rgba(5,26,46,0.62)" },
  heroContent: { position: "absolute", left: 22, right: 22, top: 16, bottom: 14, justifyContent: "space-between" },
  logo: { width: 62, height: 48, backgroundColor: "rgba(5,26,46,0.88)", borderWidth: 1.2, borderColor: C.white, alignItems: "center", justifyContent: "center" },
  logoText: { color: C.white, fontSize: 16, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  logoSub: { color: C.white, fontSize: 5.5, letterSpacing: 0.8, marginTop: 1 },
  heroTitle: { color: C.white, fontSize: 26, fontFamily: "Helvetica-Bold", lineHeight: 1.12 },
  heroSub: { color: C.goldLight, fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 4 },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  locText: { color: C.white, fontSize: 9, marginLeft: 4 },
  priceBand: { height: 72, backgroundColor: C.navyDark, flexDirection: "row", alignItems: "center", paddingHorizontal: 22 },
  priceLabel: { color: C.white, fontSize: 8, fontFamily: "Helvetica-Bold", letterSpacing: 0.8 },
  price: { color: C.goldLight, fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 2 },
  negotiable: { color: C.white, fontSize: 8, marginTop: 2 },
  facts: { flex: 1, flexDirection: "row", justifyContent: "flex-end" },
  fact: { width: 78, alignItems: "center" },
  factLabel: { color: C.white, fontSize: 6.5, fontFamily: "Helvetica-Bold" },
  factValue: { color: C.white, fontSize: 8, marginTop: 2, textAlign: "center" },
  body: { paddingHorizontal: 22, paddingTop: 12 },
  sectionHead: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  goldTick: { width: 18, height: 2, backgroundColor: C.gold, marginRight: 6 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.navy, letterSpacing: 0.6 },
  goldLine: { flex: 1, height: 1, backgroundColor: C.gold, marginLeft: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.line },
  cell: { width: "20%", height: 44, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  cellLabel: { fontSize: 5.5, fontFamily: "Helvetica-Bold", color: C.navy },
  cellValue: { fontSize: 7.5, color: C.black, marginTop: 2, textAlign: "center" },
  hlGrid: { flexDirection: "row", flexWrap: "wrap" },
  hlItem: { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 5, paddingRight: 8 },
  hlText: { flex: 1, fontSize: 8.5, color: C.black, marginLeft: 4, lineHeight: 1.25 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, height: 24, backgroundColor: C.navyDark, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 22 },
  footerText: { color: C.white, fontSize: 6.5 },
  pageTwo: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 36, backgroundColor: C.white, fontFamily: "Helvetica" },
  galleryGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, marginBottom: 12 },
  galleryPhoto: { width: "49%", height: 148, objectFit: "cover", marginBottom: 8 },
  galleryPhotoOdd: { width: "49%", height: 148, objectFit: "cover", marginBottom: 8, marginRight: "2%" },
  cols: { flexDirection: "row" },
  colLeft: { width: "58%", paddingRight: 14 },
  colRight: { width: "42%" },
  infoTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.navy, letterSpacing: 0.5 },
  goldMini: { width: 20, height: 2, backgroundColor: C.gold, marginTop: 3, marginBottom: 7 },
  desc: { fontSize: 8.5, color: C.slate, lineHeight: 1.4 },
  locItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 7 },
  locItemText: { fontSize: 8.5, color: C.black, marginLeft: 5, flex: 1, lineHeight: 1.3 },
  agent: { marginTop: 14, backgroundColor: C.card, flexDirection: "row", alignItems: "center", padding: 10 },
  avatar: { width: 42, height: 42, backgroundColor: C.navy, alignItems: "center", justifyContent: "center", marginRight: 8 },
  avatarText: { color: C.white, fontSize: 14, fontFamily: "Helvetica-Bold" },
  agentName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.navy },
  agentMeta: { fontSize: 8, color: C.gray, marginTop: 1 },
  agentRight: { marginLeft: "auto", borderLeftWidth: 1, borderLeftColor: "#CBD5E1", paddingLeft: 10, width: 130 },
  interested: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 2 },
  contact: { fontSize: 7.5, color: C.black, lineHeight: 1.3 },
  brandBox: { width: 46, height: 36, backgroundColor: C.navy, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  brandText: { color: C.white, fontSize: 9, fontFamily: "Helvetica-Bold" },
  brandSub: { color: C.white, fontSize: 4 },
  fallbackHero: { position: "absolute", width: "100%", height: "100%", backgroundColor: C.navy },
});

function clean(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function money(value: any): string {
  const number = Number(value);
  if (!number) return "Price Upon Request";
  return `RM ${number.toLocaleString()}`;
}

function wrapTitle(title: string): string[] {
  const words = title.toUpperCase().trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= 18) current = test;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export default function ListingBrochure({ listing, aiPlan }: Props) {
  const photos = Array.isArray(listing?.property_photos)
    ? listing.property_photos.filter((photo: any) => photo?.image_url)
    : [];

  const coverType = aiPlan?.hero?.photo_type || null;
  const coverPhoto = coverType
    ? photos.find((photo: any) => photo.photo_type === coverType) ?? photos[0]
    : photos[0];

  const galleryPhotos = (
    aiPlan?.gallery?.enabled === false
      ? []
      : photos.filter((photo: any) => photo.image_url !== coverPhoto?.image_url)
  ).slice(0, 4);

  const location = [listing?.address, listing?.area, listing?.state].filter(Boolean).join(", ");
  const rawTitle = String(listing?.title || listing?.headline || "Property Listing");
  let mainTitle = rawTitle;
  let subTitle = listing?.area ? String(listing.area) : "";
  if (rawTitle.includes("@")) {
    const parts = rawTitle.split("@");
    mainTitle = parts[0].trim();
    subTitle = parts[1].trim();
  }
  const titleLines = wrapTitle(mainTitle);
  const purpose = String(listing?.purpose || "Sell").toLowerCase();

  const overview = [
    { label: "Property Type", value: clean(listing?.property_type || listing?.commercial_type || listing?.residential_type || listing?.land_type) },
    { label: "Built-up", value: clean(listing?.built_up) },
    { label: "Bathrooms", value: clean(listing?.bathrooms) },
    { label: "Tenure", value: clean(listing?.tenure) },
    { label: "Facing", value: clean(listing?.facing) },
    { label: "Power Supply", value: clean(listing?.industrial_power_supply || listing?.electricity_phase) },
    { label: "Status", value: clean(listing?.status) },
    { label: "Purpose", value: clean(listing?.purpose) },
    { label: "Category", value: clean(listing?.category) },
    { label: "Land Area", value: clean(listing?.land_size) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value)).slice(0, 10);

  const keyFacts = [
    { label: "Built-up", value: clean(listing?.built_up) },
    { label: "Type", value: clean(listing?.property_type || listing?.commercial_type || listing?.residential_type) },
    { label: "Tenure", value: clean(listing?.tenure) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  let highlights: string[] = [];
  if (Array.isArray(listing?.highlights)) {
    highlights = listing.highlights.map((item: any) => String(item)).filter(Boolean);
  } else if (listing?.remarks) {
    highlights = String(listing.remarks)
      .split("\n")
      .map((line) => line.replace(/^[-*]+\s*/, "").trim())
      .filter(Boolean);
  }
  const aiIndexes = Array.isArray(aiPlan?.highlight_indexes) ? aiPlan.highlight_indexes : [];
  const selected: string[] = aiIndexes.map((index: any) => highlights[Number(index)]).filter(Boolean);
  const finalHighlights = (selected.length ? selected : highlights).slice(0, 8);
  const agentName =
    listing?.listing_agent === "Cobroke Agent" ? "MAX CHEA" : listing?.listing_agent || "MAX CHEA";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          {coverPhoto?.image_url ? (
            <Image src={coverPhoto.image_url} style={styles.heroImage} />
          ) : (
            <View style={styles.fallbackHero} />
          )}
          <View style={styles.heroShade} />
          <View style={styles.heroContent}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>MIB</Text>
              <Text style={styles.logoSub}>PROPERTIES</Text>
            </View>
            <View>
              {titleLines.map((line) => (
                <Text key={line} style={styles.heroTitle}>{line}</Text>
              ))}
              {subTitle ? <Text style={styles.heroSub}>{subTitle.toUpperCase()}</Text> : null}
              {location ? (
                <View style={styles.locRow}>
                  <Pin color={C.white} />
                  <Text style={styles.locText}>{location}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.priceBand}>
          <View>
            <Text style={styles.priceLabel}>{purpose === "rent" ? "ASKING RENT" : "ASKING PRICE"}</Text>
            <Text style={styles.price}>{money(listing?.price)}</Text>
            <Text style={styles.negotiable}>(Negotiable)</Text>
          </View>
          <View style={styles.facts}>
            {keyFacts.slice(0, 3).map((fact) => (
              <View key={fact.label} style={styles.fact}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.body}>
          {overview.length > 0 ? (
            <View>
              <View style={styles.sectionHead}>
                <View style={styles.goldTick} />
                <Text style={styles.sectionTitle}>PROPERTY OVERVIEW</Text>
                <View style={styles.goldLine} />
              </View>
              <View style={styles.grid}>
                {overview.map((item) => (
                  <View key={item.label} style={styles.cell}>
                    <Text style={styles.cellLabel}>{item.label}</Text>
                    <Text style={styles.cellValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {finalHighlights.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              <View style={styles.sectionHead}>
                <View style={styles.goldTick} />
                <Text style={styles.sectionTitle}>PROPERTY HIGHLIGHTS</Text>
                <View style={styles.goldLine} />
              </View>
              <View style={styles.hlGrid}>
                {finalHighlights.map((item: string) => (
                  <View key={item} style={styles.hlItem}>
                    <CheckIcon />
                    <Text style={styles.hlText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>maxzchea@gmail.com</Text>
          <Text style={styles.footerText}>Max Property</Text>
        </View>
      </Page>
      <Page size="A4" style={styles.pageTwo}>
        <View style={styles.sectionHead}>
          <View style={styles.goldTick} />
          <Text style={styles.sectionTitle}>PHOTO GALLERY</Text>
        </View>
        <View style={styles.galleryGrid}>
          {galleryPhotos.map((photo: any, index: number) => (
            <Image
              key={`${photo.image_url}-${index}`}
              src={photo.image_url}
              style={index % 2 === 0 ? styles.galleryPhotoOdd : styles.galleryPhoto}
            />
          ))}
        </View>
        <View style={styles.cols}>
          <View style={styles.colLeft}>
            <Text style={styles.infoTitle}>DESCRIPTION</Text>
            <View style={styles.goldMini} />
            <Text style={styles.desc}>{listing?.description || "Property information available upon request."}</Text>
          </View>
          <View style={styles.colRight}>
            <Text style={styles.infoTitle}>LOCATION</Text>
            <View style={styles.goldMini} />
            {location ? (
              <View style={styles.locItem}>
                <Pin color={C.navy} />
                <Text style={styles.locItemText}>{location}</Text>
              </View>
            ) : null}
            {listing?.area ? (
              <View style={styles.locItem}>
                <CarIcon />
                <Text style={styles.locItemText}>Convenient access to local amenities and city centre</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.agent}>
          <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
          <View>
            <Text style={styles.agentName}>{agentName}</Text>
            <Text style={styles.agentMeta}>{listing?.agent_reg_no || "REN 31953"}</Text>
            <Text style={styles.agentMeta}>{listing?.agent_phone || "016-521 0993"}</Text>
          </View>
          <View style={styles.agentRight}>
            <Text style={styles.interested}>INTERESTED IN THIS PROPERTY?</Text>
            <Text style={styles.contact}>Contact us today for viewing arrangement.</Text>
          </View>
          <View style={styles.brandBox}>
            <Text style={styles.brandText}>MAX</Text>
            <Text style={styles.brandSub}>PROPERTY</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>MAX PROPERTY</Text>
          <Text style={styles.footerText}>Property Information - Page 2</Text>
        </View>
      </Page>
    </Document>
  );
}
