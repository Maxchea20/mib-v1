import test from "node:test";
import assert from "node:assert/strict";
import { agentSchema, websiteSchema, breadcrumbSchema, listingSchema, parseFloorSize, accommodationType, safeJson, AGENT_ID } from "./schema.ts";

const L = (o = {}) => ({ id: 7, title: "Double storey terrace", headline: null, category: "Residential", purpose: "For Sale", price: 595000,
  status: "Available", area: "Bandar Seri Botani", city: "Ipoh", state: "Perak", property_type: "Terrace / Link House",
  bedrooms: 4, bathrooms: 3, built_up: "1,650 sqft", ...o });
const opt = { lang: "en", url: "https://maxproperty.my/listing/7", images: ["https://x/1.jpg"], place: "Ipoh", description: "Nice" };
const clean = (x) => JSON.parse(JSON.stringify(x)); // drop undefined like the page does

test("agent: registered agent in Ipoh serving Perak, no street address, no invented links", () => {
  const a = clean(agentSchema("en"));
  assert.deepEqual(a["@type"], ["RealEstateAgent", "LocalBusiness"]);
  assert.equal(a.name, "Max Property");
  assert.equal(a.telephone, "+60165210993");
  assert.equal(a.identifier.value, "31953");
  assert.equal(a.address.addressLocality, "Ipoh");
  assert.equal(a.address.streetAddress, undefined);
  assert.deepEqual(a.areaServed.map((x) => x.name), ["Ipoh", "Perak"]);
  assert.equal(a.sameAs, undefined);            // nothing published until real profile URLs are added
  assert.ok(a.logo.startsWith("https://"));
  assert.notEqual(clean(agentSchema("ms")).description, a.description);  // per-language description
});

test("website and breadcrumbs", () => {
  assert.equal(clean(websiteSchema("zh")).inLanguage, "zh-CN");
  const b = clean(breadcrumbSchema([{ name: "A", url: "https://x/a" }, { name: "B", url: "https://x/b" }]));
  assert.deepEqual(b.itemListElement.map((i) => i.position), [1, 2]);
});

test("floor size units", () => {
  assert.deepEqual(parseFloorSize("1,650 sqft"), { value: 1650, unit: "FTK" });
  assert.deepEqual(parseFloorSize("2400 sq ft"), { value: 2400, unit: "FTK" });
  assert.deepEqual(parseFloorSize("120 sqm"), { value: 120, unit: "MTK" });
  assert.equal(parseFloorSize("1,650"), null);          // no unit: do not guess
  assert.equal(parseFloorSize("2 acres"), null);
  assert.equal(parseFloorSize(null), null);
  assert.equal(parseFloorSize("0 sqft"), null);
});

test("accommodation types", () => {
  assert.equal(accommodationType({ category: "Land", property_type: null }), "Place");
  assert.equal(accommodationType({ category: "Residential", property_type: "Condominium" }), "Apartment");
  assert.equal(accommodationType({ category: "Residential", property_type: "Bungalow / Villa" }), "House");
  assert.equal(accommodationType({ category: "Industrial", property_type: "Industrial" }), "Accommodation");
});

test("listing for sale: price, area, size, rooms; no street address", () => {
  const s = clean(listingSchema(L(), opt));
  assert.equal(s["@type"], "RealEstateListing");
  assert.equal(s.offers.price, 595000);
  assert.equal(s.offers.priceSpecification, undefined);
  assert.equal(s.offers.businessFunction, "http://purl.org/goodrelations/v1#Sell");
  assert.equal(s.offers.availability, "https://schema.org/InStock");
  assert.equal(s.about["@type"], "House");
  assert.equal(s.about.address.addressLocality, "Ipoh");
  assert.equal(s.about.address.addressRegion, "Perak");
  assert.equal(s.about.address.streetAddress, undefined);
  assert.deepEqual(s.about.floorSize, { "@type": "QuantitativeValue", value: 1650, unitCode: "FTK" });
  assert.equal(s.about.numberOfBedrooms, 4);
  assert.equal(s.about.numberOfBathroomsTotal, 3);
  assert.equal(s.provider["@id"], AGENT_ID);
});

test("listing for rent is priced per month; booked is limited availability", () => {
  const s = clean(listingSchema(L({ purpose: "For Rent", price: 1800, status: "Booked" }), opt));
  assert.equal(s.offers.priceSpecification.unitText, "MONTH");
  assert.equal(s.offers.businessFunction, "http://purl.org/goodrelations/v1#LeaseOut");
  assert.equal(s.offers.availability, "https://schema.org/LimitedAvailability");
});

test("missing facts are left out, never invented", () => {
  const s = clean(listingSchema(L({ price: null, bedrooms: 0, bathrooms: null, built_up: null, city: null, area: null, state: null, category: "Land" }), { ...opt, images: [] }));
  assert.equal(s.offers, undefined);
  assert.equal(s.image, undefined);
  assert.equal(s.about["@type"], "Place");
  assert.equal(s.about.floorSize, undefined);
  assert.equal(s.about.numberOfBedrooms, undefined);
  assert.equal(s.about.address.addressLocality, undefined);
});

test("safeJson cannot close the script tag", () => {
  assert.ok(!safeJson({ a: "</script><script>alert(1)</script>" }).includes("</script>"));
});
