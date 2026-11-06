import test from "node:test";
import assert from "node:assert/strict";
import { evaluateLegalFees, evaluatePurchaseCost, COST_DEFAULTS, PURCHASE_DEFAULTS } from "./costCalcs.ts";
import { computeCosts } from "./costs.ts";

const TODAY = "2026-11-06";
const legal = (o = {}) => evaluateLegalFees({ ...COST_DEFAULTS, loan: "", ...o }, TODAY);
const purchase = (o = {}) => evaluatePurchaseCost({ ...PURCHASE_DEFAULTS, ...o }, TODAY);

test("legal fees: nothing shows until price and loan are entered", () => {
  const r = legal();
  assert.equal(r.complete, false);
  assert.equal(r.costs, null);
  assert.equal(r.errors.price, "required");
  assert.equal(r.errors.loan, "required");
  assert.equal(r.fieldsLeft, 2);
});

test("legal fees: whole-cost examples (sub-sale, 90% loan)", () => {
  assert.equal(legal({ price: "100,000", loan: "90,000" }).costs.total, 6_555);
  assert.equal(legal({ price: "500,000", loan: "450,000" }).costs.total, 26_682.5);
  assert.equal(legal({ price: "1,000,000", loan: "900,000" }).costs.total, 55_327);
  assert.equal(legal({ price: "2,000,000", loan: "1,800,000" }).costs.total, 121_819);
});

test("legal fees: invalid input is rejected, never calculated", () => {
  assert.equal(legal({ price: "-5", loan: "0" }).errors.price, "negative");
  assert.equal(legal({ price: "abc", loan: "0" }).errors.price, "invalid");
  assert.equal(legal({ price: "0", loan: "0" }).errors.price, "zero");
  assert.equal(legal({ price: "500000", loan: "-1" }).errors.loan, "negative");
  assert.equal(legal({ price: "500000", loan: "500,001" }).errors.loan, "loanTooHigh");
  assert.equal(legal({ price: "500000", loan: "0", discount: "26" }).errors.discount, "range");
  assert.equal(legal({ price: "500000", loan: "0", other: "-1" }).errors.other, "negative");
  assert.equal(legal({ price: "500000", loan: "0", disbursements: "x" }).errors.disbursements, "invalid");
  assert.equal(legal({ price: "5000000000", loan: "0" }).errors.price, "range");
});

test("legal fees: cash purchase (loan 0) has no loan fees or loan duty", () => {
  const c = legal({ price: "500000", loan: "0" }).costs;
  assert.equal(c.loanFee, 0);
  assert.equal(c.subsidiaryFee, 0);
  assert.equal(c.loanDuty, 0);
});

test("legal fees: blank disbursements uses the estimate, an entered 0 is respected", () => {
  assert.equal(legal({ price: "500000", loan: "0" }).costs.disbursementsAreEstimate, true);
  const z = legal({ price: "500000", loan: "0", disbursements: "0" }).costs;
  assert.equal(z.disbursements, 0);
  assert.equal(z.disbursementsAreEstimate, false);
});

test("legal fees: matches computeCosts directly", () => {
  const r = legal({ price: "750,000", loan: "600,000", discount: "10", other: "300" });
  const d = computeCosts(750_000, 600_000, {
    transaction: "subsale", propertyType: "residential", firstHomeClaim: false, discountPct: 10,
    serviceTax: true, includeSubsidiary: true, disbursementsOverride: null, otherCosts: 300, today: TODAY,
  });
  assert.deepEqual(r.costs, d);
});

test("purchase cost: upfront cash = down payment + costs, nothing counted twice", () => {
  const r = purchase({ price: "500,000" });
  assert.equal(r.complete, true);
  assert.equal(r.loanAmount, 450_000);
  assert.equal(r.downPayment, 50_000);
  assert.equal(r.costs.total, 26_682.5);
  assert.equal(r.upfrontCash, 76_682.5);
  assert.equal(r.monthly > 0, true);
});

test("purchase cost: different margins", () => {
  for (const [m, loan] of [["70", 700_000], ["80", 800_000], ["90", 900_000], ["100", 1_000_000]]) {
    const r = purchase({ price: "1,000,000", margin: m });
    assert.equal(r.loanAmount, loan);
    assert.equal(r.downPayment, 1_000_000 - loan);
    assert.equal(r.upfrontCash, Math.round((r.downPayment + r.costs.total) * 100) / 100);
  }
});

test("purchase cost: sizes RM100k / 500k / 1m / 2m", () => {
  assert.equal(purchase({ price: "100,000" }).costs.total, 6_555);
  assert.equal(purchase({ price: "1,000,000" }).costs.total, 55_327);
  assert.equal(purchase({ price: "2,000,000" }).costs.total, 121_819);
  assert.equal(purchase({ price: "2,000,000" }).upfrontCash, 200_000 + 121_819);
});

test("purchase cost: defaults and invalid inputs", () => {
  assert.equal(PURCHASE_DEFAULTS.margin, "90");
  assert.equal(PURCHASE_DEFAULTS.tenure, "30");
  assert.equal(PURCHASE_DEFAULTS.rate, "4.5");
  assert.equal(purchase({ price: "500000", margin: "101" }).errors.margin, "range");
  assert.equal(purchase({ price: "500000", tenure: "0" }).errors.tenure, "range");
  assert.equal(purchase({ price: "500000", rate: "-1" }).errors.rate, "negative");
  assert.equal(purchase({ price: "500000", rate: "" }).errors.rate, "required");
  assert.equal(purchase({ price: "" }).complete, false);
});

test("purchase cost: developer purchase uses HDA scale, cheaper than sub-sale", () => {
  const sub = purchase({ price: "800,000" });
  const dev = purchase({ price: "800,000", transaction: "developer" });
  assert.equal(dev.costs.hda, true);
  assert.ok(dev.costs.legalFees < sub.costs.legalFees);
});
