import test from "node:test";
import assert from "node:assert/strict";
import { buildScenes, fadeOffsets, totalSeconds, sceneSeconds, defaultLabel, cleanLabel, panFilter, joinFilter, sceneFilter, openingCopy, endCopy, MAX_PHOTOS, MAX_LABEL } from "./plan.ts";

test("timing matches the sample video: 5 photos + end card = 17.9 s, fades at 3.3 / 6.2 / 9.1 / 12 / 14.9", () => {
  const d = [3.8, 3.4, 3.4, 3.4, 3.4, 3];
  assert.deepEqual(fadeOffsets(d), [3.3, 6.2, 9.1, 12, 14.9]);
  assert.equal(totalSeconds(d), 17.9);
  assert.equal(totalSeconds([]), 0);
  assert.equal(totalSeconds([4]), 4);
});

test("scenes: first is the opening and a little longer, directions alternate, count is clamped", () => {
  const s = buildScenes(5, ["", "Living room", "Dining", "Kitchen", "Bedroom"], "standard");
  assert.deepEqual(s.map((x) => x.seconds), [3.8, 3.4, 3.4, 3.4, 3.4]);
  assert.deepEqual(s.map((x) => x.dir), ["ltr", "rtl", "ltr", "rtl", "ltr"]);
  assert.equal(s[0].kind, "opening"); assert.equal(s[0].label, "");
  assert.equal(s[1].label, "Living room");
  assert.equal(buildScenes(40, [], "fast").length, MAX_PHOTOS);
  assert.equal(buildScenes(0, [], "fast").length, 1);
  assert.equal(sceneSeconds(1, "fast"), 2.4);
});

test("labels from the MIB photo type, in English and BM; cover photos get none", () => {
  assert.equal(defaultLabel("Living Room", "en"), "Living room");
  assert.equal(defaultLabel("Living Room", "ms"), "Ruang tamu");
  assert.equal(defaultLabel("Master Bedroom", "ms"), "Bilik tidur utama");
  assert.equal(defaultLabel("Factory Front", "en"), "");
  assert.equal(defaultLabel("Front House", "ms"), "");
  assert.equal(defaultLabel(null, "en"), "");
  assert.equal(defaultLabel("Custom Spot", "en"), "Custom Spot");
});

test("typed labels are cleaned and cut to length", () => {
  assert.equal(cleanLabel("  Big \n\t garden  "), "Big garden");
  assert.equal(cleanLabel("x".repeat(100)).length, MAX_LABEL);
  assert.equal(cleanLabel(null), ""); assert.equal(cleanLabel(5), "");
});

test("ffmpeg filters: pan direction and cross-fade chain", () => {
  assert.ok(panFilter("ltr", 3.4).includes("x='(iw-720)*t/3.4'"));
  assert.ok(panFilter("rtl", 3.4).includes("x='(iw-720)*(1-t/3.4)'"));
  assert.ok(panFilter("ltr", 3).includes("crop=720:1280"));
  assert.ok(sceneFilter("ltr", 3).endsWith("[v]"));
  const g = joinFilter([3.8, 3.4, 3]);
  assert.equal(g, "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=3.3[x0];[x0][2:v]xfade=transition=fade:duration=0.5:offset=6.2[v]");
  assert.equal(joinFilter([3.8, 3]), "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=3.3[v]");
});

test("opening words come from the listing; price can be hidden", () => {
  const l = { id: 1, title: "Double storey terrace", category: "Residential", purpose: "For Sale", price: 595000, area: "Bandar Seri Botani", city: "Ipoh", state: "Perak", property_type: "Terrace / Link House" };
  const o = openingCopy(l, "en", true);
  assert.deepEqual(o, { tag: "FOR SALE", title: "Double storey terrace", sub: "RM 595,000  ·  Bandar Seri Botani, Ipoh, Perak" });
  assert.equal(openingCopy(l, "en", false).sub, "Bandar Seri Botani, Ipoh, Perak");
  assert.equal(openingCopy({ ...l, purpose: "For Rent", price: 1800 }, "ms", true).tag, "DISEWA");
  assert.ok(openingCopy({ ...l, purpose: "For Rent", price: 1800 }, "ms", true).sub.startsWith("RM 1,800 / bulan"));
  assert.equal(openingCopy({ ...l, title: "", headline: null }, "en", true).title, "Terrace / Link House");
  assert.ok(!JSON.stringify(openingCopy({ ...l, address: "12 Jalan Rahsia" }, "en", true)).includes("Rahsia"));
});

test("end card carries WhatsApp, REN and the website", () => {
  const e = endCopy("en");
  assert.equal(e.whatsapp, "WhatsApp +60 16-521 0993"); assert.ok(e.ren.includes("31953")); assert.equal(e.site, "maxproperty.my");
  assert.equal(endCopy("ms").heading, "Berminat? Mesej Max");
});
