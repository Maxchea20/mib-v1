import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import SaveablePhoto from "./SaveablePhoto";

type Props = {
  listing: any;
  aiPlan?: any;
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#09233D",
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    color: "#D9A62E",
    marginBottom: 8,
  },
  hint: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 10,
  },
  hero: {
    width: "100%",
    height: 280,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photo: {
    width: "32%",
    height: 120,
    marginRight: "2%",
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    color: "#111827",
    marginBottom: 3,
  },
});

export default function ListingBrochure({ listing }: Props) {
  const photos = Array.isArray(listing?.property_photos)
    ? listing.property_photos.filter((photo: any) => photo?.image_url)
    : [];
  const cover = photos[0];
  const gallery = photos.slice(1, 9);
  const title = listing?.headline || listing?.title || "Property Listing";
  const price =
    listing?.price !== null && listing?.price !== undefined
      ? `RM ${Number(listing.price).toLocaleString()}`
      : "Price upon request";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.meta}>
          {[listing?.area || listing?.city, listing?.state].filter(Boolean).join(", ")}
        </Text>
        <Text style={styles.hint}>
          Tap any photo to open the full image, then tap and hold to save it to your phone.
        </Text>
        {cover?.image_url ? (
          <SaveablePhoto src={cover.image_url} style={styles.hero} />
        ) : null}
        <View style={styles.grid}>
          {gallery.map((photo: any, index: number) => (
            <SaveablePhoto key={index} src={photo.image_url} style={styles.photo} />
          ))}
        </View>
        <Text style={styles.meta}>{listing?.description || ""}</Text>
        <Text style={styles.meta}>
          {listing?.listing_agent === "Cobroke Agent" ? "MAX CHEA" : listing?.listing_agent || "MAX CHEA"}
        </Text>
      </Page>
    </Document>
  );
}
