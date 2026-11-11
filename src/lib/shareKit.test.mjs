import test from "node:test";
import assert from "node:assert/strict";
import { buildCaption, withLink, trackedUrl, hashtagsFor, typeLabel, placeOf, priceText, orderedPhotoUrls, isLiveOnWebsite, LINK_TOKEN } from "./shareKit.ts";

const F = (o = {}) => ({ id: 21, title: "Semi-D factory Kamunting", category: "Industrial", purpose: "For Sale", price: 1500000, status: "Available",
  is_public: true, area: "Kamunting", city: "Taiping", state: "Perak", property_type: "Industrial", property_sub_type: "Semi-D factory",
  built_up: "10,000", land_size: null, tenure: "freehold", bedrooms: null, bathrooms: null,
  address: "12 Jalan Rahsia", postal_code: "34600", ...o });

test("English caption: type, place, price, size, tenure, contact, link, hashtags", () => {
  const c = buildCaption(F(), "en");
  assert.ok(c.startsWith("🏭 Semi-D factory for sale in Kamunting, Taiping, Perak"));
  assert.ok(c.includes("RM 1,500,000 · 10,000 sqft · Freehold"));
  assert.ok(c.includes("WhatsApp +60 16-521 0993"));
  assert.ok(c.includes("REN 31953"));
  assert.ok(c.includes(LINK_TOKEN));
  assert.ok(c.includes("#FactoryForSale") && c.includes("#IpohProperty") && c.includes("#PerakProperty"));
});

test("the street address and postal code never appear", () => {
  for (const lang of ["en", "ms", "zh"]) {
    const c = buildCaption(F(), lang);
    assert.ok(!c.includes("Jalan Rahsia") && !c.includes("34600"), lang);
  }
});

test("BM and Chinese captions are in their own language", () => {
  const ms = buildCaption(F(), "ms");
  assert.ok(ms.startsWith("🏭 Kilang berkembar untuk dijual di Kamunting, Taiping, Perak"));
  assert.ok(ms.includes("Mesej Max") && ms.includes("#KilangDijual"));
  const zh = buildCaption(F(), "zh");
  assert.ok(zh.startsWith("🏭 Kamunting, Taiping, Perak 半独立式工厂出售"));
  assert.ok(zh.includes("联系 Max") && zh.includes("#工厂"));
});

test("rent: per month, and no 'for sale' hashtags", () => {
  const l = F({ category: "Residential", purpose: "For Rent", price: 1800, property_type: "Condominium", property_sub_type: null, bedrooms: 3, bathrooms: 2, built_up: "1,100 sqft" });
  const c = buildCaption(l, "en");
  assert.ok(c.startsWith("🏠 Condominium for rent in"));
  assert.ok(c.includes("RM 1,800 / month · 3 bed 2 bath · 1,100 sqft"));
  assert.ok(!/ForSale/.test(c) && c.includes("#PropertyForRent"));
  assert.ok(buildCaption(l, "ms").includes("RM 1,800 / bulan"));
  assert.ok(buildCaption(l, "zh").includes("RM 1,800 / 每月"));
});

test("land uses land type and land size; missing facts are skipped", () => {
  const l = F({ category: "Land", property_type: null, property_sub_type: null, land_type: "Industrial Land", land_size: "2 acres", built_up: "999", price: null, tenure: null });
  const c = buildCaption(l, "en");
  assert.ok(c.startsWith("🌳 Industrial Land for sale in"));
  assert.ok(c.includes("2 acres") && !c.includes("999") && !c.includes("RM "));
  assert.ok(!c.includes("\n\n\n"));
});

test("'Industrial' alone is not shown as the type", () => {
  assert.equal(typeLabel(F({ property_sub_type: null }), "en"), "Industrial property");
  assert.equal(typeLabel(F({ property_sub_type: "Warehouse" }), "zh"), "仓库");
  assert.equal(typeLabel(F({ property_sub_type: "Something new" }), "ms"), "Something new");  // unknown names stay as typed
});

test("place: no repeats, blanks dropped", () => {
  assert.equal(placeOf({ area: "Ipoh", city: "ipoh", state: "Perak" }), "Ipoh, Perak");
  assert.equal(placeOf({ area: null, city: " ", state: null }), "");
});

test("price text", () => {
  assert.equal(priceText({ price: 595000, purpose: "For Sale" }, "en"), "RM 595,000");
  assert.equal(priceText({ price: 0, purpose: "For Sale" }, "en"), "");
  assert.equal(priceText({ price: null, purpose: "For Rent" }, "en"), "");
  assert.equal(priceText({ price: "780000", purpose: "For Sale" }, "en"), "RM 780,000");
});

test("tracked link: per-channel tag, language path, caption token replaced", () => {
  assert.equal(trackedUrl(21, "en", "whatsapp"), "https://maxproperty.my/listing/21?utm_source=whatsapp&utm_medium=social&utm_campaign=listing-21");
  assert.ok(trackedUrl(21, "zh", "facebook").startsWith("https://maxproperty.my/zh/listing/21?utm_source=facebook"));
  const c = withLink(buildCaption(F(), "en"), 21, "en", "facebook");
  assert.ok(!c.includes(LINK_TOKEN) && c.includes("utm_source=facebook"));
});

test("hashtags: at most 8, no duplicates, start with #", () => {
  for (const lang of ["en", "ms", "zh"]) {
    const h = hashtagsFor(F(), lang);
    assert.ok(h.length >= 4 && h.length <= 8);
    assert.equal(new Set(h.map((x) => x.toLowerCase())).size, h.length);
    assert.ok(h.every((x) => x.startsWith("#")));
  }
});

test("photos: cover photo first, blanks dropped", () => {
  const urls = orderedPhotoUrls("Industrial", [
    { photo_type: "Inside", image_url: "b" }, { photo_type: "Factory Front", image_url: "a" }, { photo_type: "Side", image_url: null }, { photo_type: "Rear", image_url: "c" },
  ]);
  assert.deepEqual(urls, ["a", "b", "c"]);
  assert.deepEqual(orderedPhotoUrls("Land", null), []);
});

test("live on website needs the switch ON and Available/Booked status", () => {
  assert.equal(isLiveOnWebsite({ is_public: true, status: "Available" }), true);
  assert.equal(isLiveOnWebsite({ is_public: true, status: "Booked" }), true);
  assert.equal(isLiveOnWebsite({ is_public: true, status: "Sold" }), false);
  assert.equal(isLiveOnWebsite({ is_public: false, status: "Available" }), false);
  assert.equal(isLiveOnWebsite({ is_public: null, status: "Available" }), false);
});
