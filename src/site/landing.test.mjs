import test from "node:test";
import assert from "node:assert/strict";
import { LANDINGS, landingFromSlug, matchesLanding, placesOf, sortForLanding, inPerak } from "./landing.ts";
import { landingText, landingCommon } from "./landingText.ts";

const L = (o) => ({ id: 1, title: "X", category: "Residential", purpose: "For Sale", city: "Ipoh", state: "Perak",
  area: "Tambun", property_type: "Terrace / Link House", property_sub_type: null, land_type: null, ...o });
const m = (slug, o) => matchesLanding(L(o), landingFromSlug(slug));

test("houses for sale in Ipoh", () => {
  assert.equal(m("houses-for-sale-ipoh", {}), true);
  assert.equal(m("houses-for-sale-ipoh", { city: " IPOH " }), true);       // case and spaces ignored
  assert.equal(m("houses-for-sale-ipoh", { purpose: "For Rent" }), false);
  assert.equal(m("houses-for-sale-ipoh", { city: "Penang", state: "Penang" }), false);
  // the whole of Perak counts, not only the city of Ipoh
  assert.equal(m("houses-for-sale-ipoh", { city: "Taiping", state: "Perak" }), true);
  assert.equal(m("houses-for-sale-ipoh", { city: "Batu Gajah", state: "PERAK" }), true);
  assert.equal(m("houses-for-sale-ipoh", { city: "Ipoh", state: null }), true);   // state left blank, city is Ipoh
  assert.equal(m("houses-for-sale-ipoh", { category: "Commercial" }), false);
});

test("factories: Industrial + factory type + Ipoh", () => {
  const f = { category: "Industrial", property_type: "Factory" };
  assert.equal(m("factories-for-sale-ipoh", f), true);
  assert.equal(m("factories-for-sale-ipoh", { ...f, property_type: "Warehouse", property_sub_type: "Detached Factory" }), true);
  assert.equal(m("factories-for-sale-ipoh", { ...f, property_type: "Industrial", property_sub_type: "Warehouse" }), true);
  // every Industrial sub type MIB offers, other than land
  for (const sub of ["Factory", "Warehouse", "Cluster factory", "Semi-D factory", "Detached factory", "Terrace factory"])
    assert.equal(m("factories-for-sale-ipoh", { ...f, property_type: "Industrial", property_sub_type: sub }), true, sub);
  assert.equal(m("factories-for-sale-ipoh", { ...f, property_type: "Industrial", property_sub_type: "Industrial Land" }), false);
  assert.equal(m("factories-for-sale-ipoh", { ...f, property_type: "Industrial", property_sub_type: "Warehouse", state: "Perak", city: "Ipoh", area: "Menglembu" }), true);
  assert.equal(m("factories-for-sale-ipoh", { ...f, purpose: "For Rent" }), false);
  assert.equal(m("factories-for-sale-ipoh", { ...f, city: "Taiping", state: "Perak" }), true);
  assert.equal(m("factories-for-sale-ipoh", { ...f, city: "Klang", state: "Selangor" }), false);
});

test("industrial land in Perak: land type industrial, any purpose, whole state", () => {
  const f = { category: "Land", land_type: "Industrial Land", city: "Taiping" };
  assert.equal(m("industrial-land-perak", f), true);
  assert.equal(m("industrial-land-perak", { ...f, purpose: "For Rent" }), true);
  assert.equal(m("industrial-land-perak", { ...f, land_type: "Agriculture Land" }), false);
  assert.equal(m("industrial-land-perak", { ...f, state: "Selangor" }), false);
  // an Industrial-category listing whose sub type is "Industrial Land" belongs here too
  const ind = { category: "Industrial", property_type: "Industrial", property_sub_type: "Industrial Land", land_type: null, city: "Ipoh" };
  assert.equal(m("industrial-land-perak", ind), true);
  assert.equal(m("industrial-land-perak", { ...ind, property_sub_type: "Factory" }), false);
});

test("commercial in Ipoh (sale and rent) and land for sale in Perak", () => {
  assert.equal(m("commercial-property-ipoh", { category: "Commercial", purpose: "For Rent" }), true);
  assert.equal(m("commercial-property-ipoh", { category: "Commercial", city: "Kuala Lumpur", state: "Kuala Lumpur" }), false);
  assert.equal(m("commercial-property-ipoh", { category: "Commercial", city: "Sitiawan", state: "Perak" }), true);
  assert.equal(m("land-for-sale-perak", { category: "Land", city: "Batu Gajah" }), true);
  assert.equal(m("land-for-sale-perak", { category: "Land", purpose: "For Rent" }), false);
});

test("places: most listings first, blanks dropped; Ipoh listings sort first", () => {
  assert.deepEqual(placesOf([L({ city: "Ipoh" }), L({ city: "Taiping" }), L({ city: "Ipoh" }), L({ city: " ", area: "Tambun" }), L({ city: null, area: null })]), ["Ipoh", "Taiping", "Tambun"]);
  const sorted = sortForLanding([L({ id: 5, city: "Taiping" }), L({ id: 2, city: "Ipoh" }), L({ id: 9, city: "Ipoh" }), L({ id: 8, city: "Sitiawan" })]);
  assert.deepEqual(sorted.map((x) => x.id), [9, 2, 8, 5]);
  assert.equal(inPerak({ state: "Perak Darul Ridzuan", city: "Lumut" }), true);
});

test("every landing page has text in all three languages", () => {
  for (const c of LANDINGS) for (const lang of ["en", "ms", "zh"]) {
    const t = landingText(c.slug, lang);
    for (const k of ["nav", "h1", "metaTitle", "metaDesc", "intro"]) assert.ok(t[k].length > 5, `${c.slug} ${lang} ${k}`);
    assert.equal(t.faq.length, 3);
    assert.ok(t.metaDesc.length <= 200, `${c.slug} ${lang} description too long (${t.metaDesc.length})`);
  }
  assert.equal(landingFromSlug("nope"), null);
  assert.ok(landingCommon("zh").emptyTitle);
});
