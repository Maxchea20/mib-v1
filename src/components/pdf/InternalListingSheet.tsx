// File: src/components/pdf/InternalListingSheet.tsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type Props = {
  listing: any;
};

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },

  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#111827",
    paddingBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 4,
  },

  section: {
    marginBottom: 18,
    border: 1,
    borderColor: "#D1D5DB",
    padding: 12,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1D4ED8",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    marginBottom: 7,
  },

  label: {
    width: 130,
    fontSize: 9,
    color: "#6B7280",
  },

  value: {
    flex: 1,
    fontSize: 9,
    color: "#111827",
  },

  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16A34A",
  },

  description: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#374151",
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

export default function InternalListingSheet({
  listing,
}: Props) {
  return (
    <Document>

      <Page
        size="A4"
        style={styles.page}
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Text style={styles.title}>
            INTERNAL PROPERTY SHEET
          </Text>

          <Text style={styles.subtitle}>
            MIB — Internal Use Only
          </Text>

        </View>

        {/* BASIC INFORMATION */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Property Information
          </Text>

          <View style={styles.row}>

            <Text style={styles.label}>
              Property Title
            </Text>

            <Text style={styles.value}>
              {listing.title || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              Category
            </Text>

            <Text style={styles.value}>
              {listing.category || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              Purpose
            </Text>

            <Text style={styles.value}>
              {listing.purpose || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              Status
            </Text>

            <Text style={styles.value}>
              {listing.status || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              Listing Agent
            </Text>

            <Text style={styles.value}>
              {listing.listing_agent || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              Asking / Selling Price
            </Text>

            <Text style={styles.price}>
              RM{" "}
              {Number(
                listing.price
              ).toLocaleString()}
            </Text>

          </View>

        </View>

        {/* LOCATION */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Location
          </Text>

          <View style={styles.row}>

            <Text style={styles.label}>
              Area
            </Text>

            <Text style={styles.value}>
              {listing.area || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              Address
            </Text>

            <Text style={styles.value}>
              {listing.address || "-"}
            </Text>

          </View>

          <View style={styles.row}>

            <Text style={styles.label}>
              State
            </Text>

            <Text style={styles.value}>
              {listing.state || "-"}
            </Text>

          </View>

        </View>

        {/* PROPERTY DETAILS */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Property Details
          </Text>

          {listing.category === "Residential" && (
            <>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Residential Type
                </Text>

                <Text style={styles.value}>
                  {listing.residential_type || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Storey
                </Text>

                <Text style={styles.value}>
                  {listing.residential_storey || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Bedrooms
                </Text>

                <Text style={styles.value}>
                  {listing.bedrooms ?? "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Bathrooms
                </Text>

                <Text style={styles.value}>
                  {listing.bathrooms ?? "-"}
                </Text>
              </View>

            </>
          )}

          {listing.category === "Commercial" && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Commercial Type
              </Text>

              <Text style={styles.value}>
                {listing.commercial_type || "-"}
              </Text>
            </View>
          )}

          {listing.category === "Industrial" && (
            <>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Industrial Type
                </Text>

                <Text style={styles.value}>
                  {listing.industrial_property_type || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Zoning
                </Text>

                <Text style={styles.value}>
                  {listing.industrial_zoning || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Ceiling Height
                </Text>

                <Text style={styles.value}>
                  {listing.industrial_ceiling_height || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Power Supply
                </Text>

                <Text style={styles.value}>
                  {listing.industrial_power_supply || "-"}
                </Text>
              </View>

            </>
          )}

          {listing.category === "Land" && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Land Type
              </Text>

              <Text style={styles.value}>
                {listing.land_type || "-"}
              </Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>
              Land Size
            </Text>

            <Text style={styles.value}>
              {listing.land_size || "-"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Built-up
            </Text>

            <Text style={styles.value}>
              {listing.built_up || "-"}
            </Text>
          </View>

        </View>

        {/* DESCRIPTION / INTERNAL REMARKS */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Remarks / Description
          </Text>

          <Text style={styles.description}>
            {listing.description || "-"}
          </Text>

        </View>

        <Text style={styles.footer}>
          MIB — INTERNAL USE ONLY
        </Text>

      </Page>

    </Document>
  );
}