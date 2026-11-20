import test from "node:test";
import assert from "node:assert/strict";
import {
  statusKind, workerState, spanText, agoText, describeJob, countJobs, sortJobs, workerSummary, jobLabel, listingIdOf,
  OFFLINE_AFTER_MS, STUCK_AFTER_MS,
} from "./workerQueue.ts";

const NOW = Date.parse("2026-11-20T10:00:00Z");
const at = (secAgo) => new Date(NOW - secAgo * 1000).toISOString();

test("statuses are grouped into waiting, running, done, failed", () => {
  for (const s of ["queued", "Pending", "SCHEDULED"]) assert.equal(statusKind(s), "waiting");
  for (const s of ["running", "processing", "claimed", "in_progress"]) assert.equal(statusKind(s), "running");
  for (const s of ["completed", "done", "success"]) assert.equal(statusKind(s), "done");
  for (const s of ["failed", "error"]) assert.equal(statusKind(s), "failed");
  for (const s of ["cancelled", "", null, undefined, "weird"]) assert.equal(statusKind(s), "other");
});

test("the worker is online only while its heartbeat is recent, whatever its stored status says", () => {
  assert.equal(workerState({ last_seen: at(10) }, NOW).online, true);
  assert.equal(workerState({ last_seen: at(89) }, NOW).online, true);
  assert.equal(workerState({ last_seen: at(91) }, NOW).online, false);
  assert.equal(workerState({ last_seen: at(3600) }, NOW).online, false);
  assert.equal(workerState({ last_seen: null }, NOW).online, false);
  assert.equal(workerState(null, NOW).lastSeenMs, null);
  assert.equal(workerState({ last_seen: "garbage" }, NOW).online, false);
  assert.equal(OFFLINE_AFTER_MS, 90_000);
  assert.equal(workerState({ last_seen: new Date(NOW + 5000).toISOString() }, NOW).online, true);   // clock a little ahead
});

test("time in words", () => {
  assert.equal(spanText(1000), "1 second");
  assert.equal(spanText(45_000), "45 seconds");
  assert.equal(spanText(60_000), "1 minute");
  assert.equal(spanText(5 * 60_000), "5 minutes");
  assert.equal(spanText(3 * 3600_000), "3 hours");
  assert.equal(spanText(3 * 86_400_000), "3 days");
  assert.equal(agoText(null, NOW), "never");
  assert.equal(agoText(NOW - 120_000, NOW), "2 minutes ago");
});

test("job labels and listing ids", () => {
  assert.equal(jobLabel("iproperty_create_listing"), "iProperty post");
  assert.equal(jobLabel("facebook_group_post"), "Facebook group post");
  assert.equal(jobLabel("some_new_thing"), "Some new thing");
  assert.equal(jobLabel(null), "Job");
  assert.equal(listingIdOf({ listing_id: 129 }), 129);
  assert.equal(listingIdOf({ property_id: "68" }), 68);
  assert.equal(listingIdOf({ listing_id: "abc" }), null);
  assert.equal(listingIdOf(null), null);
  assert.equal(listingIdOf({ listing_id: -4 }), null);
});

test("job descriptions: finished, failed, running, stuck, waiting, scheduled", () => {
  const base = { id: 1, job_type: "iproperty_create_listing", payload: { listing_id: 5 } };
  const done = describeJob({ ...base, status: "completed", created_at: at(300), completed_at: at(180) }, NOW);
  assert.equal(done.kind, "done"); assert.equal(done.timing, "took 2 minutes"); assert.equal(done.listingId, 5);
  const failed = describeJob({ ...base, status: "failed", created_at: at(300), completed_at: at(240), error: "  Could not\n find the Publish   button " }, NOW);
  assert.equal(failed.timing, "failed after 1 minute"); assert.equal(failed.error, "Could not find the Publish button");
  const run = describeJob({ ...base, status: "processing", created_at: at(90) }, NOW);
  assert.equal(run.timing, "running for 2 minutes"); assert.equal(run.stuck, false);
  const stuck = describeJob({ ...base, status: "processing", created_at: at(STUCK_AFTER_MS / 1000 + 60) }, NOW);
  assert.equal(stuck.stuck, true);
  const wait = describeJob({ ...base, status: "queued", created_at: at(300) }, NOW);
  assert.equal(wait.timing, "waiting 5 minutes");
  const sched = describeJob({ ...base, status: "queued", created_at: at(300), scheduled_at: new Date(NOW + 3600_000).toISOString() }, NOW);
  assert.equal(sched.timing, "scheduled in 1 hour");
  assert.equal(describeJob({ ...base, status: "queued", created_at: at(60), scheduled_at: at(30) }, NOW).timing, "waiting 30 seconds");
  assert.equal(describeJob({ ...base, status: "failed", created_at: null, completed_at: null }, NOW).timing, "failed");
  assert.ok(describeJob({ ...base, status: "failed", error: "x".repeat(2000), created_at: at(5) }, NOW).error.length <= 600);
});

test("counts and newest-first order", () => {
  const jobs = [
    { id: 1, status: "queued", created_at: at(10) }, { id: 2, status: "completed", created_at: at(500) },
    { id: 3, status: "failed", created_at: at(400) }, { id: 4, status: "processing", created_at: at(20) },
    { id: 5, status: "cancelled", created_at: null },
  ];
  assert.deepEqual(countJobs(jobs), { waiting: 1, running: 1, done: 1, failed: 1, other: 1 });
  assert.deepEqual(sortJobs(jobs).map((j) => j.id), [1, 4, 3, 2, 5]);
});

test("the top message says whether jobs can run", () => {
  const online = workerState({ last_seen: at(5) }, NOW), offline = workerState({ last_seen: at(7200) }, NOW);
  const none = { waiting: 0, running: 0, done: 0, failed: 0, other: 0 };
  assert.equal(workerSummary(online, none, NOW).tone, "good");
  assert.ok(workerSummary(online, { ...none, running: 1 }, NOW).text.includes("busy"));
  const bad = workerSummary(offline, { ...none, waiting: 2 }, NOW);
  assert.equal(bad.tone, "bad"); assert.ok(bad.text.includes("2 jobs are waiting")); assert.ok(bad.text.includes("2 hours ago"));
  assert.equal(workerSummary(offline, none, NOW).tone, "warn");
  assert.ok(workerSummary(workerState(null, NOW), none, NOW).text.includes("never"));
  assert.ok(workerSummary(offline, { ...none, waiting: 1 }, NOW).text.includes("1 job is waiting"));
});
