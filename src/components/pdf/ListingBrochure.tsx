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
  aiPlan?: any;
};

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#09233D", marginBottom: 6 },
  price: { fontSize: 16, color: "#D9A62E", marginBottom: 8 },
  hero: { width: "100%", height: 280, objectFit: "cover", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  photo: { width: "32%", height: 120, objectFit: "cover", marginRight: "2%", marginBottom: 8 },
  meta: { fontSize: 10, color: "#111827", marginBottom: 3 },
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
        {cover?.image_url ? <Image src={cover.image_url} style={styles.hero} /> : null}
        <View style={styles.grid}>
          {gallery.map((photo: any, index: number) => (
            <Image key={index} src={photo.image_url} style={styles.photo} />
          ))}
        </View>
        <Text style={styles.meta}>{listing?.description || ""}</Text>
      </Page>
    </Document>
  );
}
