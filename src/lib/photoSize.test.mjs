import test from "node:test";
import assert from "node:assert/strict";
import { fitWithin, needsShrink, jpgName, parsePhotoUrl, thumbUrlFor, thumbPathFor, MAIN_MAX, THUMB_MAX } from "./photoSize.ts";

const U = "https://abc.supabase.co/storage/v1/object/public/property-images/12/Living_Room.jpg?t=1700000000000";

test("fitWithin: shrinks the long side to the limit, keeps the shape, never enlarges", () => {
  assert.deepEqual(fitWithin(4000, 3000, MAIN_MAX), { width: 1600, height: 1200 });
  assert.deepEqual(fitWithin(3000, 4000, MAIN_MAX), { width: 1200, height: 1600 });   // portrait
  assert.deepEqual(fitWithin(4000, 3000, THUMB_MAX), { width: 480, height: 360 });
  assert.deepEqual(fitWithin(800, 600, MAIN_MAX), { width: 800, height: 600 });        // already small
  assert.deepEqual(fitWithin(1600, 1600, MAIN_MAX), { width: 1600, height: 1600 });
  assert.deepEqual(fitWithin(10000, 10, 1600), { width: 1600, height: 2 });
  assert.deepEqual(fitWithin(0, 100, 1600), { width: 0, height: 0 });
});

test("needsShrink: big pictures, heavy non-JPEGs, and never a JPEG that is already 1600 px or less", () => {
  assert.equal(needsShrink(5_000_000, 4000, 3000), true);             // phone photo
  assert.equal(needsShrink(300_000, 1601, 1000), true);               // just over the limit in pixels
  assert.equal(needsShrink(900_000, 1600, 1200), false);              // already at the target size: left alone even if heavy
  assert.equal(needsShrink(200_000, 1200, 900), false);
  assert.equal(needsShrink(3_000_000, 1500, 1000, false), true);      // a heavy PNG is converted once
  assert.equal(needsShrink(200_000, 1500, 1000, false), false);       // a light PNG is kept
});

test("file name follows MIB's rule", () => {
  assert.equal(jpgName("Living Room"), "Living_Room.jpg");
  assert.equal(jpgName("Master  Bedroom"), "Master_Bedroom.jpg");
});

test("photo address: parts, thumbnail address, other addresses are left alone", () => {
  const p = parsePhotoUrl(U);
  assert.equal(p.id, "12"); assert.equal(p.name, "Living_Room"); assert.equal(p.ext, ".jpg"); assert.equal(p.path, "12/Living_Room.jpg"); assert.equal(p.query, "?t=1700000000000");
  assert.equal(thumbUrlFor(U), "https://abc.supabase.co/storage/v1/object/public/property-images/12/thumb/Living_Room.jpg?t=1700000000000");
  assert.equal(thumbUrlFor("https://abc.supabase.co/storage/v1/object/public/property-images/12/Kitchen.png"), "https://abc.supabase.co/storage/v1/object/public/property-images/12/thumb/Kitchen.jpg");
  assert.equal(thumbUrlFor("https://img.example/1a.jpg"), null);
  assert.equal(thumbUrlFor(null), null);
  assert.equal(thumbUrlFor("https://abc.supabase.co/storage/v1/object/public/ai-videos/property-3/projects/x/final-video.mp4"), null);
  assert.equal(parsePhotoUrl("https://abc.supabase.co/storage/v1/object/public/property-images/12/thumb/Kitchen.jpg"), null);   // a thumbnail has no thumbnail
});

test("thumbnail path from a stored path", () => {
  assert.equal(thumbPathFor("12/Kitchen.png"), "12/thumb/Kitchen.jpg");
  assert.equal(thumbPathFor("7/Front_House.jpeg"), "7/thumb/Front_House.jpg");
  assert.equal(thumbPathFor("12/thumb/Kitchen.jpg"), null);
  assert.equal(thumbPathFor("nope"), null);
});
