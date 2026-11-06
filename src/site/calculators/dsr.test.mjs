import test from "node:test";
import assert from "node:assert/strict";
import { calculateDsr, dsrStatus, EMPTY_INPUT, ALL_FIELDS, COMMITMENT_FIELDS, DSR_LIMIT } from "./dsr.ts";

const filled = (o = {}) => ({
  ...EMPTY_INPUT,
  price: "500,000", income: "10,000",
  car: "0", personal: "0", housing: "0", ptptn: "0", card: "0", expenses: "0",
  ...o,
});

test("defaults: margin 90%, tenure 30, rate 4.5%; price, income and all commitments start blank", () => {
  assert.equal(EMPTY_INPUT.margin, "90");
  assert.equal(EMPTY_INPUT.tenure, "30");
  assert.equal(EMPTY_INPUT.rate, "4.5");
  for (const f of ["price", "income", ...COMMITMENT_FIELDS]) assert.equal(EMPTY_INPUT[f], "", f);
});

test("nothing is calculated while anything is blank", () => {
  const r = calculateDsr(EMPTY_INPUT);
  assert.equal(r.complete, false);
  assert.equal(r.status, null);
  assert.equal(r.dsr, 0);
  assert.equal(r.fieldsLeft, 8); // price, income + 6 commitments (margin/tenure/rate have defaults)
  for (const f of ["price", "income", ...COMMITMENT_FIELDS]) assert.equal(r.errors[f], "required", f);
});

test("each blank field alone blocks the result", () => {
  for (const f of ALL_FIELDS) {
    const r = calculateDsr(filled({ [f]: "" }));
    assert.equal(r.complete, false, f);
    assert.equal(r.errors[f], "required", f);
    assert.equal(r.fieldsLeft, 1, f);
  }
});

test("whitespace-only counts as blank", () => {
  assert.equal(calculateDsr(filled({ car: "   " })).errors.car, "required");
});

test("RM 0 must be typed: with all zeros the result works", () => {
  const r = calculateDsr(filled());
  assert.equal(r.complete, true);
  assert.equal(r.existing, 0);
});

test("worked example: RM500k, 90%, 30y, 4.5%, income RM10,000, commitments RM2,500", () => {
  // loan 450,000 -> instalment 2,280.08 (independently verified)
  const r = calculateDsr(filled({ car: "800", personal: "500", housing: "0", ptptn: "200", card: "300", expenses: "700" }));
  assert.equal(r.complete, true);
  assert.equal(r.loanAmount, 450000);
  assert.equal(r.instalment, 2280.08);
  assert.equal(r.existing, 2500);
  assert.equal(r.total, 4780.08);
  assert.equal(r.dsr, 47.8);          // 4780.08 / 10000
  assert.equal(r.status, "green");
  assert.equal(r.limitAmount, 7500);
});

test("the formula is total / income x 100", () => {
  const r = calculateDsr(filled({ income: "8,000", car: "1,000" }));
  assert.equal(r.total, 3280.08);
  assert.equal(r.dsr, 41);            // 3280.08 / 8000 = 41.001 -> 41.00
});

test("green below 75%, red at or above 75%", () => {
  assert.equal(dsrStatus(74.99), "green");
  assert.equal(dsrStatus(75), "red");
  assert.equal(dsrStatus(75.01), "red");
  assert.equal(dsrStatus(0), "green");
  assert.equal(dsrStatus(300), "red");
  assert.equal(DSR_LIMIT, 75);
});

test("the colour follows the number on screen: 74.996% shows 75.00 and is RED", () => {
  // pick income so that total/income = 0.74996 -> rounds to 75.00
  const base = calculateDsr(filled());                   // total = instalment only (2,280.08)
  const income = Math.round((base.total / 0.74996) * 100) / 100;
  const r = calculateDsr(filled({ income: String(income) }));
  assert.equal(r.dsr, 75);
  assert.equal(r.status, "red");
});

test("exactly 75.00% is red", () => {
  // income = total / 0.75 exactly: instalment 2,280.08 / 0.75 = 3,040.1066 -> use commitments to hit exactly
  const r = calculateDsr(filled({ income: "4000", car: "719.92" })); // total 3000.00 / 4000 = 75%
  assert.equal(r.total, 3000);
  assert.equal(r.dsr, 75);
  assert.equal(r.status, "red");
});

test("a very high commitment load goes red above 100%", () => {
  const r = calculateDsr(filled({ income: "3000", car: "2000" }));
  assert.ok(r.dsr > 100);
  assert.equal(r.status, "red");
});

test("negative values are rejected everywhere", () => {
  for (const f of ALL_FIELDS) {
    const r = calculateDsr(filled({ [f]: "-5" }));
    assert.equal(r.complete, false, f);
    assert.equal(r.errors[f], "negative", f);
  }
  assert.equal(calculateDsr(filled({ car: "-0.01" })).errors.car, "negative");
  assert.equal(calculateDsr(filled({ car: "RM -50" })).errors.car, "negative");
});

test("zero is not allowed for price and income, but is for commitments", () => {
  assert.equal(calculateDsr(filled({ price: "0" })).errors.price, "zero");
  assert.equal(calculateDsr(filled({ income: "0" })).errors.income, "zero");
  assert.equal(calculateDsr(filled({ income: "0.00" })).errors.income, "zero");
  for (const f of COMMITMENT_FIELDS) assert.equal(calculateDsr(filled({ [f]: "0" })).complete, true, f);
});

test("junk text is invalid", () => {
  for (const bad of ["abc", "1e5", "1.2.3", "NaN", "Infinity", "5 000 abc", "--5", "5-"])
    for (const f of ["price", "income", "car", "margin", "tenure", "rate"])
      assert.equal(calculateDsr(filled({ [f]: bad })).errors[f], "invalid", `${f}: ${bad}`);
});

test("ranges: margin 1-100, tenure 1-40, rate 0-25, amounts capped", () => {
  assert.equal(calculateDsr(filled({ margin: "0" })).errors.margin, "range");
  assert.equal(calculateDsr(filled({ margin: "101" })).errors.margin, "range");
  assert.equal(calculateDsr(filled({ tenure: "0" })).errors.tenure, "range");
  assert.equal(calculateDsr(filled({ tenure: "41" })).errors.tenure, "range");
  assert.equal(calculateDsr(filled({ rate: "25.01" })).errors.rate, "range");
  assert.equal(calculateDsr(filled({ price: "2,000,000,000" })).errors.price, "range");
  assert.equal(calculateDsr(filled({ income: "200,000,000" })).errors.income, "range");
  assert.equal(calculateDsr(filled({ car: "200,000,000" })).errors.car, "range");
  for (const ok of [{ margin: "1" }, { margin: "100" }, { tenure: "1" }, { tenure: "40" }, { rate: "0" }, { rate: "25" }])
    assert.equal(calculateDsr(filled(ok)).complete, true, JSON.stringify(ok));
});

test("zero interest rate works (new instalment = loan / months)", () => {
  const r = calculateDsr(filled({ rate: "0" }));
  assert.equal(r.complete, true);
  assert.equal(r.instalment, 1250);   // 450,000 / 360
  assert.equal(r.dsr, 12.5);
});

test("typed formats are understood: commas, RM prefix, spaces", () => {
  const r = calculateDsr(filled({ price: "RM 500,000", income: " 10,000.00 ", car: "RM 1,200" }));
  assert.equal(r.complete, true);
  assert.equal(r.existing, 1200);
});

test("margin 100% means the whole price is financed", () => {
  const r = calculateDsr(filled({ margin: "100" }));
  assert.equal(r.loanAmount, 500000);
});

test("fieldsLeft counts every problem field", () => {
  const r = calculateDsr(filled({ price: "", income: "abc", car: "-1" }));
  assert.equal(r.fieldsLeft, 3);
  assert.equal(r.complete, false);
});

test("totals add in sen without drifting", () => {
  const r = calculateDsr(filled({ car: "0.10", personal: "0.20", housing: "0.30", ptptn: "0.10", card: "0.10", expenses: "0.20" }));
  assert.equal(r.existing, 1);
});
