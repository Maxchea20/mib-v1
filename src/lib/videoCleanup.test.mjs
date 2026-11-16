import test from "node:test";
import assert from "node:assert/strict";
import { parseCutoff, splitByCutoff, totalBytes, urlPartFor, isVideoPath, DEFAULT_CUTOFF, VIDEO_BUCKET } from "./videoCleanup.ts";

const NOW = Date.parse("2026-11-20T00:00:00Z");
const F = (path, createdAt, size = 1000) => ({ path, createdAt, size });

test("cut-off: real past dates only", () => {
  assert.equal(parseCutoff(DEFAULT_CUTOFF, NOW), Date.parse(DEFAULT_CUTOFF));
  assert.equal(parseCutoff("2026-11-30T00:00:00Z", NOW), null);   // future
  assert.equal(parseCutoff("not a date", NOW), null);
  assert.equal(parseCutoff(undefined, NOW), null);
  assert.equal(parseCutoff(12345, NOW), null);
});

test("old videos are those created before the cut-off; newer and undated are kept", () => {
  const cutoff = Date.parse(DEFAULT_CUTOFF);
  const s = splitByCutoff([
    F("property-30/ai-video-a.mp4", "2026-09-01T00:00:00Z", 4000),
    F("property-92/projects/x/final-video.mp4", "2026-10-30T00:00:00Z", 6000),
    F("property-5/projects/y/final-video.mp4", "2026-11-12T00:00:00Z", 5000),   // new maker
    F("property-6/projects/z/final-video.mp4", null),                            // unknown date
    F("property-6/projects/z/final-video.mp4", "garbage"),
  ], cutoff);
  assert.deepEqual(s.old.map((f) => f.path), ["property-30/ai-video-a.mp4", "property-92/projects/x/final-video.mp4"]);
  assert.equal(s.kept.length, 1);
  assert.equal(s.unknown.length, 2);
  assert.equal(totalBytes(s.old), 10000);
});

test("only video files are ever considered (never photos or PDFs)", () => {
  const s = splitByCutoff([F("98/brochure.pdf", "2020-01-01T00:00:00Z"), F("117/Compound.png", "2020-01-01T00:00:00Z"), F("a/b.MP4", "2020-01-01T00:00:00Z")], Date.parse(DEFAULT_CUTOFF));
  assert.deepEqual(s.old.map((f) => f.path), ["a/b.MP4"]);
  assert.ok(isVideoPath("x.webm") && !isVideoPath("x.jpg") && !isVideoPath("mp4"));
});

test("database rows are matched by the path inside the public URL", () => {
  assert.equal(urlPartFor("property-30/ai-video-a.mp4"), `/${VIDEO_BUCKET}/property-30/ai-video-a.mp4`);
});

test("the default cut-off is the day the new video maker replaced the old tool", () => {
  assert.equal(DEFAULT_CUTOFF, "2026-11-11T14:54:00.000Z");
});
