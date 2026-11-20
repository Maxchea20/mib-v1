import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanProfile, cleanList, cleanYear, cleanPhotoUrl, isShowable, pickText, yearsSince, personSchema, profileText, fillText, firstName, LIMITS,
} from "./profile.ts";
import { resolvePublicRoute } from "./routing.ts";

const P = (o = {}) => ({
  display_name: "Max Chea", headline_en: "Industrial specialist", headline_ms: null, headline_zh: "工业房产专家",
  bio_en: "Line one.\n\nLine two.", bio_ms: null, bio_zh: null, photo_url: "https://x.supabase.co/storage/v1/object/public/property-images/agent/photo.jpg",
  specialisations: ["Factories"], areas: ["Ipoh"], languages: ["English", "中文"], since_year: 2019, ...o,
});

test("text is cleaned: no HTML characters, one line for names, paragraphs kept for bios", () => {
  const c = cleanProfile({ display_name: "  Max\n <b>Chea</b> ", bio_en: "Hello <script>x</script>\r\n\r\n\r\n\r\nSecond   line\t here" });
  assert.equal(c.display_name, "Max b Chea /b");
  assert.ok(!/[<>]/.test(c.bio_en));
  assert.equal(c.bio_en, "Hello script x /script\n\nSecond line here");
});

test("empty text becomes null so it stays hidden; the public switch needs a real true", () => {
  const c = cleanProfile({ display_name: "   ", headline_en: "", bio_zh: "\n\n", is_public: "true" });
  assert.equal(c.display_name, null);
  assert.equal(c.headline_en, null);
  assert.equal(c.bio_zh, null);
  assert.equal(c.is_public, false);
  assert.equal(cleanProfile({ is_public: true }).is_public, true);
});

test("lengths are limited (by characters, so Chinese counts fairly)", () => {
  const c = cleanProfile({ display_name: "x".repeat(500), headline_zh: "字".repeat(500), bio_en: "y".repeat(9000) });
  assert.equal(Array.from(c.display_name).length, LIMITS.name);
  assert.equal(Array.from(c.headline_zh).length, LIMITS.headline);
  assert.equal(Array.from(c.bio_en).length, LIMITS.bio);
});

test("lists: split on commas, trimmed, unique, limited", () => {
  assert.deepEqual(cleanList("Factories, land ;  FACTORIES\nWarehouses ,, "), ["Factories", "land", "Warehouses"]);
  assert.deepEqual(cleanList(["a", " a ", "b", 5, null]), ["a", "b"]);
  assert.equal(cleanList(Array.from({ length: 40 }, (_, i) => `item${i}`)).length, LIMITS.items);
  assert.deepEqual(cleanList(undefined), []);
});

test("start year must be a real year, not in the future", () => {
  assert.equal(cleanYear("2019", 2026), 2019);
  assert.equal(cleanYear(2027, 2026), null);
  assert.equal(cleanYear("1850", 2026), null);
  assert.equal(cleanYear("abc", 2026), null);
  assert.equal(cleanYear("", 2026), null);
  assert.equal(yearsSince(2019, 2026), 7);
  assert.equal(yearsSince(null, 2026), null);
  assert.equal(yearsSince(2030, 2026), null);
});

test("photo address: https only", () => {
  assert.ok(cleanPhotoUrl("https://a.b/c.jpg?t=1"));
  assert.equal(cleanPhotoUrl("http://a.b/c.jpg"), null);
  assert.equal(cleanPhotoUrl("javascript:alert(1)"), null);
  assert.equal(cleanPhotoUrl("data:image/png;base64,AAAA"), null);
  assert.equal(cleanPhotoUrl(""), null);
});

test("a profile shows only with a name and one introduction", () => {
  assert.equal(isShowable(null), false);
  assert.equal(isShowable(P({ display_name: null })), false);
  assert.equal(isShowable(P({ bio_en: null })), false);
  assert.equal(isShowable(P({ bio_en: null, bio_zh: "介绍" })), true);
  assert.equal(isShowable(P()), true);
});

test("each language falls back to English, then any other", () => {
  const p = P();
  assert.equal(pickText(p, "headline", "zh"), "工业房产专家");
  assert.equal(pickText(p, "headline", "ms"), "Industrial specialist");   // BM empty -> English
  assert.equal(pickText(p, "bio", "zh"), "Line one.\n\nLine two.");
  assert.equal(pickText(P({ headline_en: null, headline_ms: null }), "headline", "en"), "工业房产专家");
  assert.equal(pickText(P({ bio_en: null }), "bio", "en"), "");
});

test("structured data is a Person tied to the business, only filled fields", () => {
  const s = personSchema(P(), "en");
  assert.equal(s["@type"], "Person");
  assert.equal(s.name, "Max Chea");
  assert.equal(s.jobTitle, "Industrial specialist");
  assert.equal(s.description, "Line one.");
  assert.deepEqual(s.worksFor, { "@id": "https://maxproperty.my/#agent" });
  assert.ok(s.url.endsWith("/about"));
  assert.ok(personSchema(P(), "zh").url.endsWith("/zh/about"));
  const bare = personSchema(P({ photo_url: null, languages: [], areas: [], specialisations: [], headline_en: null, headline_zh: null }), "en");
  assert.equal(bare.image, undefined);
  assert.equal(bare.knowsLanguage, undefined);
  assert.equal(bare.areaServed, undefined);
  assert.equal(bare.jobTitle, undefined);
});

test("words exist in all three languages and fill in names", () => {
  for (const l of ["en", "ms", "zh"]) {
    const t = profileText(l);
    for (const v of Object.values(t)) assert.ok(typeof v === "string" && v.length > 0);
  }
  assert.equal(fillText(profileText("en").whatsapp, { first: "Max" }), "Message Max on WhatsApp");
  assert.ok(fillText(profileText("zh").years, { n: 7 }).includes("7"));
  assert.equal(firstName("Max Chea"), "Max");
  assert.equal(firstName("  "), "Max Property");
});

test("the public address /about rewrites in all languages and nothing else changes", () => {
  const H = ["maxproperty.my"];
  const r = (p) => resolvePublicRoute("maxproperty.my", p, H);
  assert.deepEqual(r("/about"), { action: "rewrite", path: "/site/en/about" });
  assert.deepEqual(r("/about/"), { action: "rewrite", path: "/site/en/about" });
  assert.deepEqual(r("/ms/about"), { action: "rewrite", path: "/site/ms/about" });
  assert.deepEqual(r("/zh/about"), { action: "rewrite", path: "/site/zh/about" });
  assert.deepEqual(r("/about/me"), { action: "notfound" });
  assert.deepEqual(r("/profile"), { action: "notfound" });       // the CRM profile page is never public
});
