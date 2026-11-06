import test from "node:test";
import assert from "node:assert/strict";
import { resolvePublicRoute } from "./routing.ts";

const H = ["maxproperty.my", "www.maxproperty.my"];
const r = (path, host = "maxproperty.my") => resolvePublicRoute(host, path, H);

test("CRM hosts are not handled here", () => {
  assert.equal(r("/dashboard", "app.maxproperty.my"), null);
  assert.equal(r("/", "mib-v2.vercel.app"), null);
  assert.equal(resolvePublicRoute(null, "/", H), null);
});

test("English pages (no prefix) rewrite to /site/en", () => {
  assert.deepEqual(r("/"), { action: "rewrite", path: "/site/en" });
  assert.deepEqual(r("/residential"), { action: "rewrite", path: "/site/en/residential" });
  assert.deepEqual(r("/land/"), { action: "rewrite", path: "/site/en/land" });
  assert.deepEqual(r("/listing/123", "maxproperty.my:443"), { action: "rewrite", path: "/site/en/listing/123" });
  assert.deepEqual(r("/listing/9/", "MaxProperty.my"), { action: "rewrite", path: "/site/en/listing/9" });
});

test("BM and Chinese pages rewrite with their language", () => {
  for (const l of ["ms", "zh"]) {
    assert.deepEqual(r(`/${l}`), { action: "rewrite", path: `/site/${l}` });
    assert.deepEqual(r(`/${l}/`), { action: "rewrite", path: `/site/${l}` });
    assert.deepEqual(r(`/${l}/industrial`), { action: "rewrite", path: `/site/${l}/industrial` });
    assert.deepEqual(r(`/${l}/listing/55`), { action: "rewrite", path: `/site/${l}/listing/55` });
  }
});

test("calculator pages rewrite in every language", () => {
  assert.deepEqual(r("/calculators"), { action: "rewrite", path: "/site/en/calculators" });
  assert.deepEqual(r("/calculators/"), { action: "rewrite", path: "/site/en/calculators" });
  assert.deepEqual(r("/calculators/housing-loan"), { action: "rewrite", path: "/site/en/calculators/housing-loan" });
  assert.deepEqual(r("/ms/calculators/housing-loan"), { action: "rewrite", path: "/site/ms/calculators/housing-loan" });
  assert.deepEqual(r("/zh/calculators"), { action: "rewrite", path: "/site/zh/calculators" });
  assert.deepEqual(r("/calculators/dsr"), { action: "rewrite", path: "/site/en/calculators/dsr" });
  assert.deepEqual(r("/calculators/rpgt"), { action: "rewrite", path: "/site/en/calculators/rpgt" });
  assert.deepEqual(r("/ms/calculators/rpgt/"), { action: "rewrite", path: "/site/ms/calculators/rpgt" });
  for (const slug of ["houses-for-sale-ipoh", "factories-for-sale-ipoh", "industrial-land-perak", "commercial-property-ipoh", "land-for-sale-perak"]) {
    assert.deepEqual(r(`/${slug}`), { action: "rewrite", path: `/site/en/l/${slug}` });
    assert.deepEqual(r(`/ms/${slug}/`), { action: "rewrite", path: `/site/ms/l/${slug}` });
  }
  for (const bad of ["/l/houses-for-sale-ipoh", "/houses-for-sale-ipoh/x", "/houses-for-sale-penang", "/Houses-for-sale-ipoh"]) assert.deepEqual(r(bad), { action: "notfound" }, bad);
  for (const slug of ["legal-fees", "purchase-cost", "rental-yield"]) {
    assert.deepEqual(r(`/calculators/${slug}`), { action: "rewrite", path: `/site/en/calculators/${slug}` });
    assert.deepEqual(r(`/zh/calculators/${slug}/`), { action: "rewrite", path: `/site/zh/calculators/${slug}` });
  }
  assert.deepEqual(r("/zh/calculators/dsr/"), { action: "rewrite", path: "/site/zh/calculators/dsr" });
  for (const bad of ["/calculators/other", "/calculators/housing-loan/x", "/calculators/stamp-duty", "/Calculators", "/calculators/dsr/x", "/calculators/DSR", "/calculators/RPGT", "/calculators/rpgt/x", "/calculators/legal-fees/x", "/calculators/Rental-Yield"])
    assert.deepEqual(r(bad), { action: "notfound" }, bad);
});

test("/en is a duplicate: redirect to the unprefixed address", () => {
  assert.deepEqual(r("/en"), { action: "redirect-path", path: "/" });
  assert.deepEqual(r("/en/"), { action: "redirect-path", path: "/" });
  assert.deepEqual(r("/en/residential"), { action: "redirect-path", path: "/residential" });
  assert.deepEqual(r("/en/listing/3"), { action: "redirect-path", path: "/listing/3" });
});

test("www redirects to the bare domain", () => {
  assert.deepEqual(r("/listing/1", "www.maxproperty.my"), { action: "redirect", host: "maxproperty.my" });
  assert.deepEqual(r("/ms/land", "www.maxproperty.my"), { action: "redirect", host: "maxproperty.my" });
});

test("robots, sitemap and assets pass (root only)", () => {
  assert.deepEqual(r("/robots.txt"), { action: "pass" });
  assert.deepEqual(r("/sitemap.xml"), { action: "pass" });
  assert.deepEqual(r("/_next/static/a.js"), { action: "pass" });
  assert.deepEqual(r("/ms/robots.txt"), { action: "notfound" });
  assert.deepEqual(r("/zh/sitemap.xml"), { action: "notfound" });
});

test("everything private or malformed is a 404 on the public host", () => {
  for (const p of ["/dashboard", "/listings", "/contacts", "/sales", "/marketing", "/login", "/settings",
    "/api/ai/description", "/api/marketing/google-business/post", "/site", "/site/en", "/site/ms/listing/1",
    "/listing/abc", "/listing/1/edit", "/listing/../dashboard", "/listing/1e3", "/listing/", "/Residential",
    "/residential/extra", "/ms/dashboard", "/ms/login", "/zh/api/x", "/msx", "/ms/ms", "/ms/en/residential", "/fr", "/MS"]) {
    assert.deepEqual(r(p), { action: "notfound" }, p);
  }
});
