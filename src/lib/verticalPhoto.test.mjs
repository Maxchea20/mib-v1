import test from "node:test";
import assert from "node:assert/strict";
import { imageModels, isModelAccessError, verticalPlan, V_WIDTH, V_HEIGHT, VERTICAL_PROMPT } from "./verticalPhoto.ts";
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

test("vertical and square photos also go to the AI; only unreadable sizes are skipped", () => {
  assert.equal(verticalPlan(1000, 1500).mode, "ai");
  assert.equal(verticalPlan(1000, 1000).mode, "ai");
  assert.equal(verticalPlan(0, 10).mode, "skip");
});

test("the prompt is the owner's wording", () => {
  assert.equal(VERTICAL_PROMPT, "Change to 9:16 ratio. Enhance to higher quality.");
});

test("vertical copy addresses", () => {
  const U = "https://abc.supabase.co/storage/v1/object/public/property-images/12/Living_Room.png?t=5";
  assert.equal(verticalPathFor("12/Living_Room.png"), "12/vertical/Living_Room.jpg");
  assert.equal(verticalUrlFor(U), "https://abc.supabase.co/storage/v1/object/public/property-images/12/vertical/Living_Room.jpg?t=5");
  assert.equal(parsePhotoUrl(U).verticalPath, "12/vertical/Living_Room.jpg");
  assert.equal(verticalPathFor("nope"), null);
  assert.equal(verticalUrlFor("https://x.com/a.jpg"), null);
});

test("a 16:9 photo goes to the AI, only a real panorama is blurred", () => {
  assert.equal(verticalPlan(1920, 1080).mode, "ai");
  assert.equal(verticalPlan(2400, 1000).mode, "ai");
  assert.equal(verticalPlan(3000, 1000).mode, "blur");
});

test("image models: the account's own choice first, then the others", () => {
  assert.equal(imageModels()[0], "gpt-image-2");
  assert.deepEqual(imageModels("gpt-image-1").slice(0, 2), ["gpt-image-1", "gpt-image-2"]);
  assert.equal(new Set(imageModels("gpt-image-1")).size, 4);
  assert.equal(imageModels("bad value; drop").length, 4); // an odd value is ignored
});

test("only a 'you cannot use this model' refusal moves on to the next model", () => {
  assert.equal(isModelAccessError(400, "The model 'gpt-image-1' does not exist."), true);
  assert.equal(isModelAccessError(404, "x"), true);
  assert.equal(isModelAccessError(403, "Your organization must be verified to use the model gpt-image-1"), false);
  assert.equal(isModelAccessError(400, "Invalid size"), false);
  assert.equal(isModelAccessError(500, "model overloaded"), false);
});
