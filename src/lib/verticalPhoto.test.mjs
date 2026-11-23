import test from "node:test";
import assert from "node:assert/strict";
import { verticalPlan, V_WIDTH, V_HEIGHT, VERTICAL_PROMPT } from "./verticalPhoto.ts";
import { verticalPathFor, verticalUrlFor, parsePhotoUrl } from "./photoSize.ts";

test("a normal 3:2 photo sits in the middle and AI fills the bands", () => {
  const p = verticalPlan(1600, 1066);
  assert.equal(p.mode, "ai");
  assert.equal(p.photoW, V_WIDTH);
  assert.equal(p.photoH, 682);
  assert.equal(p.top + p.photoH + p.bottom, V_HEIGHT);
  assert.ok(Math.abs(p.top - p.bottom) <= 1);
});

test("a panorama gets a blurred fill, not a mostly-AI picture", () => {
  assert.equal(verticalPlan(4000, 1000).mode, "blur");
});

test("vertical and square photos are skipped, bad sizes too", () => {
  assert.equal(verticalPlan(1000, 1500).mode, "skip");
  assert.equal(verticalPlan(1000, 1000).mode, "skip");
  assert.equal(verticalPlan(0, 10).mode, "skip");
});

test("the prompt is the owner's wording", () => {
  assert.equal(VERTICAL_PROMPT, "Enhance the photo quality to higher pixels. and change to 9:16 ratio");
});

test("vertical copy addresses", () => {
  const U = "https://abc.supabase.co/storage/v1/object/public/property-images/12/Living_Room.png?t=5";
  assert.equal(verticalPathFor("12/Living_Room.png"), "12/vertical/Living_Room.jpg");
  assert.equal(verticalUrlFor(U), "https://abc.supabase.co/storage/v1/object/public/property-images/12/vertical/Living_Room.jpg?t=5");
  assert.equal(parsePhotoUrl(U).verticalPath, "12/vertical/Living_Room.jpg");
  assert.equal(verticalPathFor("nope"), null);
  assert.equal(verticalUrlFor("https://x.com/a.jpg"), null);
});
