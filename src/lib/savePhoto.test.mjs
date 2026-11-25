import test from "node:test";
import assert from "node:assert/strict";
import { photoFileName } from "./savePhoto.ts";

test("file name is safe and readable", () => {
  assert.equal(photoFileName("Living Room", 12), "Living_Room-12.jpg");
  assert.equal(photoFileName("  Front / Gate?  ", "129"), "Front_Gate-129.jpg");
  assert.equal(photoFileName("厨房", 5), "photo-5.jpg");
});
