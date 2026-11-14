import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTimeline, secondsPerPhoto, totalFrames, totalSeconds, fadeOffsets, motionFor, defaultLabel, cleanLabel,
  buildFilterGraph, ENCODER_ARGS, openingCopy, endCopy, factsCopy, hasFacts, FPS, FADE_FRAMES, MAX_PHOTOS, MAX_LABEL, LAYOUT,
} from "./plan.ts";

const L = (o = {}) => ({ id: 3, title: "Double storey terrace", category: "Residential", purpose: "For Sale", price: 595000, area: "Bandar Seri Botani",
  city: "Ipoh", state: "Perak", property_type: "Terrace / Link House", bedrooms: 4, bathrooms: 3, built_up: "1,650 sqft", tenure: "freehold", ...o });

/* ------------------------------------------------- length depends on the photos */

test("each photo's time depends on how many photos there are", () => {
  assert.equal(secondsPerPhoto(3, "auto"), 3.6);
  assert.equal(secondsPerPhoto(5, "auto"), 3.2);
  assert.equal(secondsPerPhoto(8, "auto"), 2.9);
  assert.equal(secondsPerPhoto(9, "auto"), 2.9);
  assert.equal(secondsPerPhoto(12, "auto"), 2.6);
  for (const n of [1, 4, 6, 9, 12]) assert.ok(secondsPerPhoto(n, "short") < secondsPerPhoto(n, "auto"), `short is shorter for ${n}`);
  assert.ok(secondsPerPhoto(12, "short") >= 2.0);
});

test("total length: more photos give a longer video, but not in proportion", () => {
  const len = (n, length = "auto") => totalSeconds(buildTimeline(n, [], { length, facts: true }));
  assert.ok(len(3) < len(6) && len(6) < len(9) && len(9) < len(12));
  assert.ok(len(12) < 36, `12 photos stays under 36 s, got ${len(12)}`);
  assert.ok(len(9, "short") < len(9, "auto") * 0.85);
  // the 9-photo listing from the bug report
  assert.equal(totalSeconds(buildTimeline(9, [], { length: "auto", facts: true })), 28);
});

test("timeline: opening, facts card after it, photos in order, closing card last", () => {
  const t = buildTimeline(4, ["", "A", "B", "C"], { length: "auto", facts: true });
  assert.deepEqual(t.map((s) => s.kind), ["opening", "facts", "photo", "photo", "photo", "end"]);
  assert.deepEqual(t.map((s) => s.photo), [0, null, 1, 2, 3, null]);
  assert.deepEqual(t.filter((s) => s.kind === "photo").map((s) => s.label), ["A", "B", "C"]);
  assert.deepEqual(t.map((s) => s.index), [0, 1, 2, 3, 4, 5]);
  assert.ok(t[0].seconds > t[2].seconds);                       // the opening stays a little longer
  assert.equal(buildTimeline(4, [], { length: "auto", facts: false }).some((s) => s.kind === "facts"), false);
  assert.equal(buildTimeline(40, [], { length: "auto", facts: false }).filter((s) => s.photo !== null).length, MAX_PHOTOS);
  assert.equal(buildTimeline(0, [], { length: "auto", facts: false }).length, 2);   // at least the opening and the end
});

test("frames are whole numbers and the cross-fade offsets add up", () => {
  const t = buildTimeline(9, [], { length: "auto", facts: true });
  for (const s of t) { assert.ok(Number.isInteger(s.frames)); assert.equal(s.seconds, s.frames / FPS); }
  const off = fadeOffsets(t);
  assert.equal(off.length, t.length - 1);
  assert.equal(off[0], (t[0].frames - FADE_FRAMES) / FPS);
  // the last cross-fade finishes where the last scene begins to play alone
  assert.equal(Math.round((off[off.length - 1] + FADE_FRAMES / FPS + (t[t.length - 1].frames - FADE_FRAMES) / FPS) * FPS), totalFrames(t));
});

/* ---------------------------------------------------------------- camera moves */

test("camera moves are slow, varied, and never leave a gap at the edge", () => {
  const moves = [0, 1, 2, 3, 4, 5].map(motionFor);
  assert.deepEqual(moves[0], { z0: 1.0, z1: 1.07, dx0: 0, dx1: 0 });                      // opening pushes in
  assert.equal(new Set(moves.slice(0, 5).map((m) => JSON.stringify(m))).size >= 3, true);  // varied
  for (const m of moves) {
    assert.ok(Math.abs(m.z1 - m.z0) <= 0.07 + 1e-9, "zoom stays gentle");
    assert.ok(Math.abs(m.dx1 - m.dx0) <= 56, "drift is slow: under 56 px over a scene");
    // a drifting photo that is as wide as the screen overhangs by (zoom - 1) * 540 px each side
    const minZoom = Math.min(m.z0, m.z1);
    assert.ok(Math.max(Math.abs(m.dx0), Math.abs(m.dx1)) <= (minZoom - 1) * 540 + 1e-9 || m.dx0 === m.dx1 || (m.dx0 === 0 && m.dx1 === 0), "no gap at the edge");
  }
});

/* ------------------------------------------------------------------ labels */

test("labels in English, BM and Chinese; cover photos get none", () => {
  assert.equal(defaultLabel("Living Room", "en"), "Living room");
  assert.equal(defaultLabel("Living Room", "ms"), "Ruang tamu");
  assert.equal(defaultLabel("Living Room", "zh"), "客厅");
  assert.equal(defaultLabel("Master Bedroom", "zh"), "主卧室");
  assert.equal(defaultLabel("Loading Bay", "zh"), "装卸区");
  assert.equal(defaultLabel("Factory Front", "zh"), "");
  assert.equal(defaultLabel(null, "en"), "");
  assert.equal(defaultLabel("Custom Spot", "zh"), "Custom Spot");
});

test("typed labels are cleaned and cut to length by characters, not bytes", () => {
  assert.equal(cleanLabel("  Big \n\t garden  "), "Big garden");
  assert.equal(cleanLabel("x".repeat(100)).length, MAX_LABEL);
  assert.equal(Array.from(cleanLabel("客".repeat(100))).length, MAX_LABEL);
  assert.equal(cleanLabel(null), "");
});

/* ------------------------------------------------------------- ffmpeg graph */

test("filter graph: every picture is converted once, then repeated; scenes are joined once", () => {
  const t = buildTimeline(3, [], { length: "auto", facts: true });       // opening, facts, photo, photo, end
  const inputs = []; let n = 0;
  for (const s of t) { const bg = n++; const fg = s.motion ? n++ : null; inputs.push({ bg, fg, baseW: 1080 }); }
  const g = buildFilterGraph(t, inputs);
  assert.equal((g.match(/xfade=/g) || []).length, t.length - 1);
  assert.equal((g.match(/loop=loop=/g) || []).length, n);                // one loop per picture
  assert.ok(g.indexOf("format=yuv420p") < g.indexOf("loop=loop="));      // converted BEFORE it is repeated
  assert.ok(g.includes("scale=w='2*trunc(1080*(1+0.07*t/") && g.includes("eval=frame"));
  assert.ok(g.includes(`y='${LAYOUT.centerY}-h/2'`));
  assert.ok(g.endsWith("[v]"));
  // each scene frame count is exact
  assert.ok(g.includes(`loop=loop=${t[0].frames - 1}:size=1`));
  assert.ok(buildFilterGraph([t[4]], [{ bg: 0, fg: null, baseW: 0 }]).endsWith("[s0]null[v]"));
});

test("encoder settings keep files small and the picture compatible", () => {
  const a = ENCODER_ARGS.join(" ");
  assert.ok(a.includes("-preset superfast") && a.includes("-crf 26") && a.includes("-pix_fmt yuv420p") && a.includes("-profile:v high"));
  assert.ok(a.includes("-an") && a.includes("+faststart"));
});

/* -------------------------------------------------------------------- words */

test("opening words: English, BM and Chinese; price can be hidden", () => {
  const e = openingCopy(L(), "en", true);
  assert.deepEqual(e, { tag: "FOR SALE", title: "Double storey terrace", sub: "RM 595,000  ·  Bandar Seri Botani, Ipoh, Perak" });
  assert.equal(openingCopy(L(), "en", false).sub, "Bandar Seri Botani, Ipoh, Perak");
  assert.equal(openingCopy(L({ purpose: "For Rent", price: 1800 }), "ms", true).tag, "DISEWA");
  const z = openingCopy(L(), "zh", true);
  assert.equal(z.tag, "出售");
  assert.ok(z.sub.startsWith("RM 595,000  ｜  ") && z.sub.includes("怡保，霹雳"));
  assert.equal(openingCopy(L({ purpose: "For Rent", price: 1800 }), "zh", true).tag, "出租");
  assert.ok(!JSON.stringify(openingCopy(L({ address: "12 Jalan Rahsia" }), "en", true)).includes("Rahsia"));
});

test("closing card in three languages carries WhatsApp, REN and the website", () => {
  assert.equal(endCopy("en").heading, "Interested? Message Max");
  assert.equal(endCopy("ms").heading, "Berminat? Mesej Max");
  assert.equal(endCopy("zh").heading, "有意了解？联系 Max");
  const e = endCopy("zh");
  assert.equal(e.whatsapp, "WhatsApp +60 16-521 0993"); assert.ok(e.ren.includes("31953") && e.ren.includes("注册房地产经纪")); assert.equal(e.site, "maxproperty.my");
});

test("facts card: only real facts, translated, price only when allowed", () => {
  const f = factsCopy(L(), "en", true);
  assert.deepEqual(f.rows.map((r) => r.label), ["Price", "Size", "Rooms", "Tenure", "Location"]);
  assert.equal(f.rows[0].value, "RM 595,000"); assert.equal(f.rows[0].big, true);
  assert.equal(f.rows[1].value, "1,650 sqft"); assert.equal(f.rows[2].value, "4 bed · 3 bath"); assert.equal(f.rows[3].value, "Freehold");
  assert.deepEqual(factsCopy(L(), "en", false).rows.map((r) => r.label), ["Size", "Rooms", "Tenure", "Location"]);
  const z = factsCopy(L(), "zh", true);
  assert.deepEqual(z.rows.map((r) => r.label), ["价格", "面积", "房间", "地契", "地点"]);
  assert.equal(z.rows[2].value, "4 房 · 3 卫"); assert.equal(z.rows[3].value, "永久地契"); assert.ok(z.rows[4].value.includes("怡保"));
  const m = factsCopy(L({ tenure: "leasehold" }), "ms", true);
  assert.equal(m.rows[3].value, "Pajakan"); assert.equal(m.heading, "Ringkasan");
  assert.equal(factsCopy(L({ purpose: "For Rent", price: 1800 }), "en", true).rows[0].value, "RM 1,800 / month");
});

test("facts card is skipped when there is almost nothing to show; land uses land size", () => {
  const bare = factsCopy({ id: 1, category: "Land", price: null, city: "", area: "", state: "" }, "en", true);
  assert.equal(bare.rows.length, 0); assert.equal(hasFacts(bare), false);
  const land = factsCopy({ id: 2, category: "Land", price: 500000, land_size: "2 acres", built_up: "999", state: "Perak" }, "en", true);
  assert.ok(land.rows.some((r) => r.value === "2 acres") && !JSON.stringify(land).includes("999"));
  assert.equal(hasFacts(land), true);
  assert.ok(factsCopy(L({ headline: null, address: "12 Jalan Rahsia", postal_code: "34600" }), "en", true).rows.every((r) => !r.value.includes("Rahsia")));
});
