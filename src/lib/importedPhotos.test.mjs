import test from "node:test";
import assert from "node:assert/strict";
import { isImportedType, importedPhotos, filesFor } from "./importedPhotos.ts";

const U = (n) => `https://a.supabase.co/storage/v1/object/public/property-images/77/Photo_${n}.jpg?t=1`;

test("only Photo N types are imported photos", () => {
  assert.equal(isImportedType("Photo 1"), true);
  assert.equal(isImportedType("Photo 12"), true);
  assert.equal(isImportedType("Front House"), false);
  assert.equal(isImportedType("Photo"), false);
  assert.equal(isImportedType(null), false);
});

test("imported photos come out in numeric order and rooms are left alone", () => {
  const rows = [
    { id: 1, photo_type: "Photo 10", image_url: U(10) },
    { id: 2, photo_type: "Kitchen", image_url: "k" },
    { id: 3, photo_type: "Photo 2", image_url: U(2) },
    { id: 4, photo_type: "Photo 3", image_url: null },
  ];
  assert.deepEqual(importedPhotos(rows).map((r) => r.id), [3, 1]);
});

test("deleting a photo removes its main, mid-size and small files", () => {
  assert.deepEqual(filesFor(U(2)), { bucket: "property-images", paths: ["77/Photo_2.jpg", "77/medium/Photo_2.jpg", "77/thumb/Photo_2.jpg"] });
  assert.equal(filesFor("https://elsewhere.com/x.jpg"), null);
});
