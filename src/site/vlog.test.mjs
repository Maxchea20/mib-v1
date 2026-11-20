import test from "node:test";
import assert from "node:assert/strict";
import {
  parseYouTubeId, cleanVideo, pickText, sortVideos, nextTopOrder, moveVideo, videoSchema, vlogText, thumbUrl, embedUrl, ID_RE, LIMITS,
} from "./vlog.ts";
import { resolvePublicRoute } from "./routing.ts";

const ID = "dQw4w9WgXcQ";

test("YouTube addresses of every common shape give the video id", () => {
  for (const u of [
    `https://www.youtube.com/watch?v=${ID}`, `https://youtube.com/watch?v=${ID}&t=42s&list=PL1`, `http://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`, `https://youtu.be/${ID}?si=abc`, `https://www.youtube.com/shorts/${ID}`, `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}?feature=share`, `www.youtube.com/watch?v=${ID}`, `youtu.be/${ID}`, ID, `  https://youtu.be/${ID}  `,
    `https://www.youtube-nocookie.com/embed/${ID}`, `https://music.youtube.com/watch?v=${ID}`,
  ]) assert.equal(parseYouTubeId(u), ID, u);
});

test("anything that is not a YouTube video is refused", () => {
  for (const u of [
    "", "   ", null, undefined, 42, "https://vimeo.com/123456789", "https://evil.com/watch?v=" + ID, "https://youtube.com.evil.com/watch?v=" + ID,
    "https://youtube.com/watch", "https://youtube.com/watch?v=short", "https://youtube.com/channel/UC1234567890abcd", "javascript:alert(1)",
    "ftp://youtube.com/watch?v=" + ID, "https://www.youtube.com/playlist?list=PL12345678901", "not a link", ID + "x", "https://youtu.be/",
    "https://notyoutu.be/" + ID, "https://youtube.com/watch?v=" + ID.slice(0, 10) + "<",
  ]) assert.equal(parseYouTubeId(u), null, String(u));
});

test("the id format matches what the database accepts", () => {
  assert.ok(ID_RE.test(ID)); assert.ok(!ID_RE.test("abc")); assert.ok(!ID_RE.test(ID + "a"));
  assert.equal(thumbUrl(ID), `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`);
  assert.ok(embedUrl(ID).startsWith("https://www.youtube-nocookie.com/embed/"));
  assert.ok(embedUrl(ID, true).includes("autoplay=1") && !embedUrl(ID).includes("autoplay"));
});

test("saving a video: cleaned text, needs a real address and a title", () => {
  const ok = cleanVideo({ url: `https://youtu.be/${ID}`, title_en: "  Factory <b>tour</b>\n ", desc_en: "Line1\r\n\r\n\r\n\r\nLine2", property_id: "68" });
  assert.equal(ok.ok, true);
  assert.equal(ok.row.youtube_id, ID); assert.equal(ok.row.title_en, "Factory b tour /b"); assert.equal(ok.row.desc_en, "Line1\n\nLine2");
  assert.equal(ok.row.property_id, 68); assert.equal(ok.row.is_public, true); assert.equal(ok.row.title_ms, null);
  assert.equal(cleanVideo({ url: "https://example.com", title_en: "x" }).ok, false);
  assert.equal(cleanVideo({ url: ID, title_en: "  ", title_zh: "" }).ok, false);
  assert.equal(cleanVideo({ url: ID, title_zh: "视频" }).ok, true);
  assert.equal(cleanVideo({ url: ID, title_en: "x", is_public: false }).row.is_public, false);
  assert.equal(cleanVideo({ url: ID, title_en: "x", property_id: "abc" }).row.property_id, null);
  assert.equal(cleanVideo({ url: ID, title_en: "x", property_id: -3 }).row.property_id, null);
  assert.equal(Array.from(cleanVideo({ url: ID, title_en: "t".repeat(500), desc_en: "d".repeat(9000) }).row.title_en).length, LIMITS.title);
});

const V = (o = {}) => ({ id: 1, youtube_id: ID, title_en: "English title", title_ms: null, title_zh: "中文标题", desc_en: "English text", desc_ms: null, desc_zh: null, property_id: null, sort_order: 0, created_at: "2026-11-20T00:00:00Z", ...o });

test("text falls back to English, then any other language", () => {
  assert.equal(pickText(V(), "title", "zh"), "中文标题");
  assert.equal(pickText(V(), "title", "ms"), "English title");
  assert.equal(pickText(V(), "desc", "zh"), "English text");
  assert.equal(pickText(V({ title_en: null }), "title", "en"), "中文标题");
});

test("order: lowest number first, then newest; new videos go to the top", () => {
  const list = [V({ id: 1, sort_order: 0 }), V({ id: 2, sort_order: 0 }), V({ id: 3, sort_order: -1 })];
  assert.deepEqual(sortVideos(list).map((v) => v.id), [3, 2, 1]);
  assert.equal(nextTopOrder(list), -2); assert.equal(nextTopOrder([]), 0);
});

test("moving a video swaps it with its neighbour, even when numbers are equal", () => {
  const list = [V({ id: 1, sort_order: 0 }), V({ id: 2, sort_order: 0 }), V({ id: 3, sort_order: 0 })];   // shown 3, 2, 1
  const up = moveVideo(list, 2, -1);                    // move 2 up: it goes above 3
  const applied = list.map((v) => ({ ...v, sort_order: up.find((u) => u.id === v.id)?.sort_order ?? (sortVideos(list).findIndex((s) => s.id === v.id)) }));
  assert.deepEqual(sortVideos(applied).map((v) => v.id), [2, 3, 1]);
  assert.equal(moveVideo(list, 3, -1), null);            // already first
  assert.equal(moveVideo(list, 1, 1), null);             // already last
  assert.equal(moveVideo(list, 99, 1), null);
});

test("video structured data and words", () => {
  const s = videoSchema(V(), "en");
  assert.equal(s["@type"], "VideoObject"); assert.equal(s.name, "English title"); assert.ok(s.url.endsWith(`/vlog/${ID}`));
  assert.ok(videoSchema(V(), "zh").url.endsWith(`/zh/vlog/${ID}`));
  assert.equal(videoSchema(V({ desc_en: null }), "en").description, "English title");
  for (const l of ["en", "ms", "zh"]) for (const v of Object.values(vlogText(l))) assert.ok(typeof v === "string" && v.length > 0);
});

test("public addresses /vlog and /vlog/<id> rewrite in all languages, other shapes do not", () => {
  const r = (p) => resolvePublicRoute("maxproperty.my", p, ["maxproperty.my"]);
  assert.deepEqual(r("/vlog"), { action: "rewrite", path: "/site/en/vlog" });
  assert.deepEqual(r(`/vlog/${ID}`), { action: "rewrite", path: `/site/en/vlog/${ID}` });
  assert.deepEqual(r(`/zh/vlog/${ID}/`), { action: "rewrite", path: `/site/zh/vlog/${ID}` });
  assert.deepEqual(r("/ms/vlog"), { action: "rewrite", path: "/site/ms/vlog" });
  assert.deepEqual(r("/vlog/short"), { action: "notfound" });
  assert.deepEqual(r(`/vlog/${ID}/extra`), { action: "notfound" });
});
