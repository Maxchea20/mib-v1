import test from "node:test";
import assert from "node:assert/strict";
import { cleanIntakeUrl, cleanAgentName, canRemove, canSend, shortUrl, INTAKE_WORKER_READY, MAX_AGENT_NAME } from "./listingIntake.ts";

test("Facebook links are accepted and tidied", () => {
  const r = cleanIntakeUrl("  https://www.facebook.com/groups/123/posts/456/?fbclid=AAA&mibextid=x&__cft__[0]=zz#abc ");
  assert.deepEqual(r, { ok: true, url: "https://www.facebook.com/groups/123/posts/456" });
  assert.deepEqual(cleanIntakeUrl("m.facebook.com/permalink.php?story_fbid=9&id=8&utm_source=a"), { ok: true, url: "https://m.facebook.com/permalink.php?story_fbid=9&id=8" });
  assert.equal(cleanIntakeUrl("https://fb.watch/abc/").url, "https://fb.watch/abc");
  assert.equal(cleanIntakeUrl("https://web.facebook.com/share/p/xyz/").ok, true);
});

test("the same post pasted two ways gives the same address (so duplicates are caught)", () => {
  const a = cleanIntakeUrl("https://www.facebook.com/groups/1/posts/2/?fbclid=1").url;
  const b = cleanIntakeUrl("https://www.facebook.com/groups/1/posts/2").url;
  assert.equal(a, b);
});

test("anything that is not a Facebook link is refused", () => {
  assert.equal(cleanIntakeUrl("").ok, false);
  assert.equal(cleanIntakeUrl(null).ok, false);
  assert.equal(cleanIntakeUrl("https://www.iproperty.com.my/x").ok, false);
  assert.equal(cleanIntakeUrl("https://facebook.com.evil.com/x").ok, false);
  assert.equal(cleanIntakeUrl("https://notfacebook.com/x").ok, false);
  assert.equal(cleanIntakeUrl("javascript:alert(1)").ok, false);
  assert.equal(cleanIntakeUrl("hello there").ok, false);
  assert.equal(cleanIntakeUrl("https://facebook.com/" + "a".repeat(600)).ok, false);
});

test("agent name is one tidy line, never empty text with junk", () => {
  assert.equal(cleanAgentName("  Ah   Seng\n(ABC) "), "Ah Seng (ABC)");
  assert.equal(cleanAgentName("<b>Tan</b>"), "b Tan /b");
  assert.equal(cleanAgentName(undefined), "");
  assert.equal(cleanAgentName(" \n "), "");
  assert.equal(Array.from(cleanAgentName("x".repeat(200))).length, MAX_AGENT_NAME);
});

test("which rows can be sent or removed", () => {
  assert.equal(canSend("saved"), true);
  assert.equal(canSend("failed"), true);
  assert.equal(canSend("queued"), false);
  assert.equal(canSend("done"), false);
  assert.equal(canRemove("queued"), false);
  assert.equal(canRemove("running"), false);
  assert.equal(canRemove("saved"), true);
});

test("links are shortened for the table, and sending is off until the worker is ready", () => {
  assert.equal(shortUrl("https://www.facebook.com/a"), "facebook.com/a");
  assert.equal(shortUrl("https://www.facebook.com/" + "b".repeat(100), 20).length, 20);
  assert.equal(INTAKE_WORKER_READY, false);
});
