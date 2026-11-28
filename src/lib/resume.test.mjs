import test from "node:test";
import assert from "node:assert/strict";
import { safePath, worthSaving, parseSaved, resumeTarget, loginUrlFor, RESUME_MAX_AGE_MS } from "./resume.ts";

const NOW = 1_700_000_000_000;

test("only safe same-site pages are accepted", () => {
  assert.equal(safePath("/listings/129"), "/listings/129");
  assert.equal(safePath("/listings?tab=photos"), "/listings?tab=photos");
  for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "", "listings", null, undefined, 5, "/login", "/login?x=1", "/api/photos", "/_next/x", "/a\nb"])
    assert.equal(safePath(bad), null, String(bad));
  assert.equal(safePath("/" + "a".repeat(600)), null);
});

test("the start pages and the login page are not remembered", () => {
  assert.equal(worthSaving("/"), false);
  assert.equal(worthSaving("/dashboard"), false);
  assert.equal(worthSaving("/login"), false);
  assert.equal(worthSaving("/listings/129"), true);
  assert.equal(worthSaving("/marketing/today"), true);
});

test("stored text is read safely", () => {
  assert.deepEqual(parseSaved(JSON.stringify({ path: "/queue", at: 5 })), { path: "/queue", at: 5 });
  assert.equal(parseSaved("not json"), null);
  assert.equal(parseSaved(null), null);
  assert.equal(parseSaved(JSON.stringify({ path: "//evil.com", at: 5 })), null);
  assert.equal(parseSaved(JSON.stringify({ path: "/queue", at: "x" })), null);
});

test("a fresh start on a start page goes back to the last page", () => {
  const saved = { path: "/listings/129?tab=photos", at: NOW - 60_000 };
  assert.equal(resumeTarget({ pathname: "/", saved, now: NOW, alreadyStarted: false }), "/listings/129?tab=photos");
  assert.equal(resumeTarget({ pathname: "/dashboard", saved, now: NOW, alreadyStarted: false }), "/listings/129?tab=photos");
});

test("it does nothing when it should not", () => {
  const saved = { path: "/listings/129", at: NOW - 60_000 };
  assert.equal(resumeTarget({ pathname: "/", saved, now: NOW, alreadyStarted: true }), null, "only once per start");
  assert.equal(resumeTarget({ pathname: "/listings", saved, now: NOW, alreadyStarted: false }), null, "not from other pages");
  assert.equal(resumeTarget({ pathname: "/", saved: null, now: NOW, alreadyStarted: false }), null);
  assert.equal(resumeTarget({ pathname: "/", saved: { path: "/listings/1", at: NOW - RESUME_MAX_AGE_MS - 1 }, now: NOW, alreadyStarted: false }), null, "too old");
  assert.equal(resumeTarget({ pathname: "/", saved: { path: "/listings/1", at: NOW + 1000 }, now: NOW, alreadyStarted: false }), null, "time in the future");
  assert.equal(resumeTarget({ pathname: "/", saved: { path: "/dashboard", at: NOW }, now: NOW, alreadyStarted: false }), null);
});

test("the login address remembers the page", () => {
  assert.equal(loginUrlFor("/listings/129", "?tab=photos"), "/login?next=" + encodeURIComponent("/listings/129?tab=photos"));
  assert.equal(loginUrlFor("/", ""), "/login");
  assert.equal(loginUrlFor("/login", ""), "/login");
  assert.equal(loginUrlFor("//evil.com", ""), "/login");
});
