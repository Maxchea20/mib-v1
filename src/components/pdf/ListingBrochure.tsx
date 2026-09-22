import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Listing } from "./listingTypes";
import { coverStats, overviewFields, coverPhotoType, categoryLabel } from "./categoryFields";
import { PinIcon, CheckIcon, BadgeIcon, PhoneIcon, MailIcon } from "./icons";

type Props = {
  listing: Listing;
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
  placeholder: "#B4B2A9",
};

/*
 * All page-1/page-2 sizing below is scaled ×0.75 from the approved
 * mockup, which was designed against a 794×1123px canvas. An actual
 * react-pdf A4 page is 595×842pt — using the mockup's raw pixel
 * values 1:1 made everything ~33% too tall for the real page.
 */

const styles = StyleSheet.create({
  page: { backgroundColor: C.white, fontFamily: "Helvetica" },

  // ---- Page 1: full-bleed cover ----
  hero: { width: "100%", height: "100%", position: "relative" },
  heroImage: { position: "absolute", width: "100%", height: "100%", objectFit: "cover" },
  heroFallback: { position: "absolute", width: "100%", height: "100%", backgroundColor: C.placeholder },
  topBar: { position: "absolute", left: 18, right: 18, top: 16, flexDirection: "row", justifyContent: "space-between" },
  logo: { width: 43, height: 33, backgroundColor: "rgba(5,26,46,0.9)", borderWidth: 1, borderColor: C.white, alignItems: "center", justifyContent: "center" },
  logoText: { color: C.white, fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  logoSub: { color: C.white, fontSize: 4, letterSpacing: 1, marginTop: 1 },
  categoryPill: { backgroundColor: C.gold, color: C.navyDark, fontSize: 7.5, fontFamily: "Helvetica-Bold", letterSpacing: 1, paddingVertical: 4, paddingHorizontal: 8 },

  bottomBand: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },

  title: { color: C.white, fontSize: 21, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  locRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  locText: { color: C.goldLight, fontSize: 9, fontFamily: "Helvetica-Bold" },
  statRow: { flexDirection: "row", marginTop: 12, gap: 16, flexWrap: "wrap" },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { color: C.white, fontSize: 9 },
  priceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 7, fontFamily: "Helvetica-Bold", letterSpacing: 1, marginTop: 14 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  price: { color: C.goldLight, fontSize: 20, fontFamily: "Helvetica-Bold" },
  negotiable: { color: "rgba(255,255,255,0.85)", fontSize: 8 },

  // ---- Page 2: gallery + spec sheet ----
  body: { paddingHorizontal: 24, paddingTop: 21, flex: 1 },
  galleryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  galleryPhoto: { width: 133, height: 92, objectFit: "cover" },
  galleryFallback: { width: 133, height: 92, backgroundColor: C.placeholder },
  sectionHead: { flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 6 },
  goldTick: { width: 15, height: 1.5, backgroundColor: C.gold, marginRight: 5 },
  sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.navy, letterSpacing: 0.5 },
  goldLine: { flex: 1, height: 1, backgroundColor: C.gold, marginLeft: 7 },

  specGrid: { flexDirection: "row", flexWrap: "wrap" },
  specItem: { width: "50%", flexDirection: "row", alignItems: "flex-start", gap: 7, paddingVertical: 6, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  specIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  specLabel: { fontSize: 6, fontFamily: "Helvetica-Bold", color: C.gray, letterSpacing: 0.4 },
  specValue: { fontSize: 8.5, color: C.black, marginTop: 1.5 },

  hlGrid: { flexDirection: "row", flexWrap: "wrap" },
  hlItem: { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 5, paddingRight: 6, gap: 4 },
  hlText: { flex: 1, fontSize: 7.5, color: C.black, lineHeight: 1.3 },

  desc: { fontSize: 7.5, color: C.slate, lineHeight: 1.45 },

  agent: { marginTop: 12, marginHorizontal: 24, backgroundColor: C.card, flexDirection: "row", alignItems: "center", padding: 9 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.navy, alignItems: "center", justifyContent: "center" },
  avatarText: { color: C.white, fontSize: 11, fontFamily: "Helvetica-Bold" },
  agentName: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.navy },
  agentLine: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  agentMeta: { fontSize: 6, color: C.gray },

  footer: { height: 20, backgroundColor: C.navyDark, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginTop: 12 },
  footerText: { color: C.white, fontSize: 6 },
});

function money(value: number | null): string {
  if (!value) return "Price Upon Request";
  return `RM ${value.toLocaleString()}`;
}

function address(listing: Listing): string {
  return [listing.address, listing.area, listing.state].filter(Boolean).join(", ");
}

// Hard safety cap so an unusually long description can never push
// the spec sheet onto a 3rd page.
function truncateDescription(text: string | null, max = 520): string {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

export default function ListingBrochure({ listing }: Props) {
  const photos = Array.isArray(listing.property_photos)
    ? listing.property_photos.filter((p) => p.image_url)
    : [];

  const preferredType = coverPhotoType[listing.category];
  const coverPhoto = photos.find((p) => p.photo_type === preferredType) ?? photos[0];
  const galleryPhotos = photos.filter((p) => p.image_url !== coverPhoto?.image_url).slice(0, 8);

  const stats = coverStats[listing.category].filter((f) => f.value(listing) !== null);
  const fields = overviewFields[listing.category].filter((f) => f.value(listing) !== null);
  const highlights = (listing.highlights ?? []).filter(Boolean);
  const description = truncateDescription(listing.description);

  const agentName = listing.listing_agent === "Cobroke Agent" ? "MAX CHEA" : listing.listing_agent || "MAX CHEA";

  return (
    <Document>
      {/* PAGE 1 — full-bleed photo cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          {coverPhoto?.image_url ? (
            <Image src={coverPhoto.image_url} style={styles.heroImage} />
          ) : (
            <View style={styles.heroFallback} />
          )}

          <View style={styles.topBar}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>MIB</Text>
              <Text style={styles.logoSub}>PROPERTIES</Text>
            </View>
            <Text style={styles.categoryPill}>{categoryLabel[listing.category]}</Text>
          </View>

          <View style={styles.bottomBand}>
            <Text style={styles.title}>
              {(listing.title || listing.headline || "Property Listing").toUpperCase()}
            </Text>

            {address(listing) ? (
              <View style={styles.locRow}>
                <PinIcon size={9} color={C.goldLight} />
                <Text style={styles.locText}>{address(listing)}</Text>
              </View>
            ) : null}

            {stats.length > 0 ? (
              <View style={styles.statRow}>
                {stats.map((f) => (
                  <View key={f.label} style={styles.stat}>
                    <f.icon size={11} color={C.goldLight} />
                    <Text style={styles.statText}>{f.value(listing)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.priceLabel}>ASKING PRICE</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{money(listing.price)}</Text>
              <Text style={styles.negotiable}>(Negotiable)</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* PAGE 2 — gallery + icon spec sheet */}
      <Page size="A4" style={styles.page}>
        <View style={styles.body}>
          {galleryPhotos.length > 0 ? (
            <View style={styles.galleryGrid}>
              {galleryPhotos.map((photo, i) =>
                photo.image_url ? (
                  <Image key={`${photo.image_url}-${i}`} src={photo.image_url} style={styles.galleryPhoto} />
                ) : (
                  <View key={i} style={styles.galleryFallback} />
                )
              )}
            </View>
          ) : null}

          {fields.length > 0 ? (
            <View>
              <View style={styles.sectionHead}>
                <View style={styles.goldTick} />
                <Text style={styles.sectionTitle}>PROPERTY OVERVIEW</Text>
                <View style={styles.goldLine} />
              </View>
              <View style={styles.specGrid}>
                {fields.map((f) => (
                  <View key={f.label} style={styles.specItem}>
                    <View style={styles.specIcon}>
                      <f.icon size={10} color={C.navy} />
                    </View>
                    <View>
                      <Text style={styles.specLabel}>{f.label.toUpperCase()}</Text>
                      <Text style={styles.specValue}>{f.value(listing)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {highlights.length > 0 ? (
            <View>
              <View style={styles.sectionHead}>
                <View style={styles.goldTick} />
                <Text style={styles.sectionTitle}>PROPERTY HIGHLIGHTS</Text>
                <View style={styles.goldLine} />
              </View>
              <View style={styles.hlGrid}>
                {highlights.slice(0, 8).map((item) => (
                  <View key={item} style={styles.hlItem}>
                    <CheckIcon size={8} />
                    <Text style={styles.hlText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {description ? (
            <View>
              <View style={styles.sectionHead}>
                <View style={styles.goldTick} />
                <Text style={styles.sectionTitle}>DESCRIPTION</Text>
                <View style={styles.goldLine} />
              </View>
              <Text style={styles.desc}>{description}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.agent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{agentName.charAt(0)}</Text>
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.agentName}>{agentName}</Text>
            <View style={styles.agentLine}>
              <BadgeIcon size={8} color={C.gray} />
              <Text style={styles.agentMeta}>{listing.agent_reg_no || "REN 31953"}</Text>
            </View>
            <View style={styles.agentLine}>
              <PhoneIcon size={8} color={C.gray} />
              <Text style={styles.agentMeta}>{listing.agent_phone || "016-521 0993"}</Text>
            </View>
          </View>
          <View style={{ marginLeft: "auto" }}>
            <MailIcon size={8} color={C.gray} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>maxzchea@gmail.com</Text>
          <Text style={styles.footerText}>Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  );
}