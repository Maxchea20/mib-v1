import test from "node:test";
import assert from "node:assert/strict";
import { resolvePublicRoute } from "./routing.ts";

const H = ["maxproperty.my", "www.maxproperty.my"];

test("CRM hosts are not handled here", () => {
  assert.equal(resolvePublicRoute("app.maxproperty.my", "/dashboard", H), null);
  assert.equal(resolvePublicRoute("mib-v2.vercel.app", "/", H), null);
  assert.equal(resolvePublicRoute(null, "/", H), null);
});

test("home and listing pages are rewritten to /site", () => {
  assert.deepEqual(resolvePublicRoute("maxproperty.my", "/", H), { action: "rewrite", path: "/site" });
  assert.deepEqual(resolvePublicRoute("maxproperty.my:443", "/listing/123", H), { action: "rewrite", path: "/site/listing/123" });
  assert.deepEqual(resolvePublicRoute("MaxProperty.my", "/listing/9/", H), { action: "rewrite", path: "/site/listing/9" });
});

test("www redirects to the bare domain", () => {
  assert.deepEqual(resolvePublicRoute("www.maxproperty.my", "/listing/1", H), { action: "redirect", host: "maxproperty.my" });
});

test("robots, sitemap and assets pass", () => {
  assert.deepEqual(resolvePublicRoute("maxproperty.my", "/robots.txt", H), { action: "pass" });
  assert.deepEqual(resolvePublicRoute("maxproperty.my", "/sitemap.xml", H), { action: "pass" });
  assert.deepEqual(resolvePublicRoute("maxproperty.my", "/_next/static/a.js", H), { action: "pass" });
});

test("everything private is a 404 on the public host", () => {
  for (const p of ["/dashboard", "/listings", "/contacts", "/sales", "/marketing", "/login", "/settings",
    "/api/ai/description", "/api/marketing/google-business/post", "/site", "/site/listing/1",
    "/listing/abc", "/listing/1/edit", "/listing/../dashboard", "/listing/1e3", "/listing/"]) {
    assert.deepEqual(resolvePublicRoute("maxproperty.my", p, H), { action: "notfound" }, p);
  }
});
