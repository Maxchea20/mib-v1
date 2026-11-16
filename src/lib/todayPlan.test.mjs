import test from "node:test";
import assert from "node:assert/strict";
import {
  rankListings, oldestFirst, nextIdea, IDEAS, todaySlot, startOfMyDay, startOfMyWeek, postsThisWeek,
  agoText, isEligible, PLATFORMS, COOLDOWN_DAYS, DAY_MS,
} from "./todayPlan.ts";

const NOW = Date.parse("2026-11-18T04:00:00Z"); // Wednesday 12:00 Malaysia time
const daysAgo = (n) => new Date(NOW - n * DAY_MS).toISOString();
const L = (id, o = {}) => ({
  id, title: `Listing ${id}`, category: "Residential", purpose: "For Sale", price: 500000, status: "Available", is_public: true,
  area: "Taman X", city: "Ipoh", state: "Perak", created_at: daysAgo(100), photoCount: 8, matches: 0, ...o,
});
const H = (property_id, platform, days) => ({ property_id, idea_key: null, platform, shared_at: daysAgo(days) });

test("only live, available listings with enough photos are eligible", () => {
  assert.equal(isEligible(L(1)), true);
  assert.equal(isEligible(L(1, { status: "Booked" })), false);
  assert.equal(isEligible(L(1, { status: "Sold" })), false);
  assert.equal(isEligible(L(1, { is_public: false })), false);
  assert.equal(isEligible(L(1, { photoCount: 2 })), false);
  assert.equal(rankListings([L(1), L(2, { status: "Sold" })], [], NOW).length, 1);
});

test("never-shared and long-neglected listings come before recently shared ones", () => {
  const r = rankListings([L(1), L(2), L(3)], [H(1, "instagram", 40), H(2, "instagram", 10)], NOW);
  assert.deepEqual(r.map((x) => x.listing.id), [3, 1, 2]);                 // never, 40 days, 10 days
  assert.ok(r[0].reasons.some((x) => x.kind === "never"));
  assert.ok(r[1].reasons.some((x) => x.text === "Not shared in 40 days"));
});

test("a listing shared in the last 3 days waits at the end, with a reason", () => {
  const r = rankListings([L(1), L(2)], [H(1, "tiktok", 0), H(2, "tiktok", COOLDOWN_DAYS)], NOW);
  assert.equal(r[0].listing.id, 2);
  assert.equal(r[1].cooling, true);
  assert.ok(r[1].reasons.some((x) => x.kind === "cooldown" && x.text === "Shared today"));
  assert.equal(r[0].cooling, false);
});

test("new listings get a boost, buyer matches help", () => {
  const history = [H(1, "instagram", 20), H(2, "instagram", 20), H(3, "instagram", 20)];
  const r = rankListings([L(1), L(2, { created_at: daysAgo(2) }), L(3, { matches: 3 })], history, NOW);
  assert.equal(r[0].listing.id, 2);
  assert.ok(r[0].reasons.some((x) => x.kind === "new"));
  assert.equal(r[1].listing.id, 3);
  assert.ok(r[1].reasons.some((x) => x.text === "Matches 3 buyers"));
  assert.equal(r[2].listing.id, 1);
});

test("platform rotation: tells which platforms are done and which are still to do", () => {
  const [a] = rankListings([L(1)], [H(1, "instagram", 20), H(1, "tiktok", 20)], NOW);
  assert.deepEqual(a.doneOn, ["instagram", "tiktok"]);
  assert.deepEqual(a.todo, PLATFORMS.filter((p) => p !== "instagram" && p !== "tiktok"));
  assert.equal(a.timesShared, 2);
  assert.equal(a.daysSince, 20);
});

test("oldest-first view puts never-shared first, then the longest ago", () => {
  const r = rankListings([L(1), L(2), L(3, { created_at: daysAgo(1) })], [H(1, "instagram", 5), H(2, "instagram", 50)], NOW);
  assert.deepEqual(oldestFirst(r).map((x) => x.listing.id), [3, 2, 1]);
});

test("ranking is stable when scores tie", () => {
  const r = rankListings([L(5), L(2), L(9)], [], NOW);
  assert.deepEqual(r.map((x) => x.listing.id), [2, 5, 9]);
});

test("Malaysia day and week boundaries", () => {
  // 2026-11-18 04:00Z is 12:00 Wed in Malaysia; the day began at 2026-11-17T16:00Z
  assert.equal(new Date(startOfMyDay(NOW)).toISOString(), "2026-11-17T16:00:00.000Z");
  assert.equal(new Date(startOfMyWeek(NOW)).toISOString(), "2026-11-15T16:00:00.000Z"); // Monday 00:00 MY
  // just after midnight Malaysia time on Thursday is still Wednesday in UTC
  const lateWed = Date.parse("2026-11-18T16:30:00Z");
  assert.equal(todaySlot(lateWed).slot.day, "Thu");
  assert.equal(todaySlot(NOW).slot.day, "Wed");
  assert.equal(todaySlot(Date.parse("2026-11-22T10:00:00Z")).slot.kind, "rest");   // Sunday
});

test("posts this week counts only this week's ticks", () => {
  const h = [H(1, "instagram", 0), H(1, "tiktok", 1), H(2, "instagram", 5), { property_id: null, idea_key: "x", platform: "instagram", shared_at: daysAgo(0) }];
  assert.equal(postsThisWeek(h, NOW), 3);   // Mon, Tue, Wed only (5 days ago was last week)
});

test("ideas rotate: never-used first, then the longest ago", () => {
  assert.equal(nextIdea([], NOW).idea.key, IDEAS[0].key);
  const used = IDEAS.slice(0, IDEAS.length - 1).map((i, n) => ({ property_id: null, idea_key: i.key, platform: "instagram", shared_at: daysAgo(n + 1) }));
  assert.equal(nextIdea(used, NOW).idea.key, IDEAS[IDEAS.length - 1].key);
  const all = IDEAS.map((i, n) => ({ property_id: null, idea_key: i.key, platform: "instagram", shared_at: daysAgo(10 + n) }));
  assert.equal(nextIdea(all, NOW).idea.key, IDEAS[IDEAS.length - 1].key);   // oldest
});

test("every idea has all three languages, a key and no invented facts", () => {
  const keys = new Set();
  for (const i of IDEAS) {
    assert.ok(i.key && !keys.has(i.key)); keys.add(i.key);
    for (const lang of ["en", "ms", "zh"]) assert.ok(i.caption[lang].length > 40, `${i.key} ${lang}`);
    assert.ok(!/guarantee|risk[- ]free|best price/i.test(i.caption.en), "no hype claims");
  }
  assert.ok(IDEAS.length >= 8);
});

test("agoText", () => {
  assert.equal(agoText(null), "never");
  assert.equal(agoText(0), "today");
  assert.equal(agoText(1), "yesterday");
  assert.equal(agoText(12), "12 days ago");
});
