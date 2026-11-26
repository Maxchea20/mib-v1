import test from "node:test";
import assert from "node:assert/strict";
import { workerCanRun, workerNameFor, POSTING_WORKER, INTAKE_WORKER } from "./workerRoles.ts";

test("posting jobs go to Woody, intake jobs go to Becky", () => {
  assert.equal(workerNameFor("facebook_group_post"), POSTING_WORKER);
  assert.equal(workerNameFor("iproperty_create_listing"), "Woody");
  assert.equal(workerNameFor("google_business_post"), "Woody");
  assert.equal(workerNameFor("generate_property_video"), "Woody");
  assert.equal(workerNameFor("listing_intake"), INTAKE_WORKER);
});

test("each worker only runs its own jobs", () => {
  assert.equal(workerCanRun("Woody", "facebook_group_post"), true);
  assert.equal(workerCanRun("Woody", "listing_intake"), false);
  assert.equal(workerCanRun("Becky", "listing_intake"), true);
  assert.equal(workerCanRun("becky", "listing_intake"), true);
  assert.equal(workerCanRun("Becky", "facebook_group_post"), false);
  assert.equal(workerCanRun("Becky", "google_business_post"), false);
});

test("an older worker called MIB Desktop is treated like Woody", () => {
  assert.equal(workerCanRun("MIB Desktop", "facebook_group_post"), true);
  assert.equal(workerCanRun("MIB Desktop", "listing_intake"), false);
  assert.equal(workerCanRun(null, "iproperty_create_listing"), true);
});
