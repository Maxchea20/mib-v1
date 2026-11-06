import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateRpgt, holdingPeriod, parseDate, addYears, addMonths, individualExemption,
  privateResidenceAllowed, RATES, EMPTY_INPUT, COST_FIELDS,
} from "./rpgt.ts";

const D = (s) => parseDate(s);
const base = (o = {}) => ({
  ...EMPTY_INPUT,
  category: "part1", sellerKind: "individual",
  acqPrice: "500,000", dispPrice: "700,000",
  acqDate: "2023-06-01", dispDate: "2024-06-01",
  ...o,
});
const band = (acq, disp) => holdingPeriod(D(acq), D(disp)).band;

/* ------------------------------------------------------------------ dates */

test("dates: real calendar dates only", () => {
  assert.deepEqual(parseDate("2024-02-29"), { y: 2024, m: 2, d: 29 });
  for (const bad of ["2023-02-29", "2024-02-30", "2024-13-01", "2024-00-10", "2024-04-31", "24-01-01", "2024/01/01", "", "abc", "2024-1-1"])
    assert.equal(parseDate(bad), null, bad);
  assert.equal(parseDate("1900-02-29"), null);   // 1900 is not a leap year
  assert.ok(parseDate("2000-02-29"));            // 2000 is
});

test("anniversaries: 29 Feb falls back to 28 Feb; month ends are cut back", () => {
  assert.deepEqual(addYears(D("2020-02-29"), 3), { y: 2023, m: 2, d: 28 });
  assert.deepEqual(addYears(D("2020-02-29"), 4), { y: 2024, m: 2, d: 29 });
  assert.deepEqual(addMonths(D("2024-01-31"), 1), { y: 2024, m: 2, d: 29 });
  assert.deepEqual(addMonths(D("2023-01-31"), 1), { y: 2023, m: 2, d: 28 });
  assert.deepEqual(addMonths(D("2024-11-15"), 3), { y: 2025, m: 2, d: 15 });
});

/* --------------------------------------------------------- holding period */

test("holding period is years, months and days between the two dates", () => {
  const h = holdingPeriod(D("2020-03-15"), D("2024-05-20"));
  assert.deepEqual([h.years, h.months, h.days], [4, 2, 5]);
  const same = holdingPeriod(D("2022-01-01"), D("2022-01-01"));
  assert.deepEqual([same.years, same.months, same.days, same.totalDays], [0, 0, 0, 0]);
  assert.deepEqual(
    (({ years, months, days }) => [years, months, days])(holdingPeriod(D("2023-01-31"), D("2023-03-01"))),
    [0, 1, 1] // 31 Jan -> 28 Feb (1 month) + 1 day
  );
});

test("band boundaries: disposal ON an anniversary stays in the earlier band", () => {
  assert.equal(band("2020-03-15", "2020-03-15"), "within3");
  assert.equal(band("2020-03-15", "2023-03-15"), "within3");  // exactly 3 years
  assert.equal(band("2020-03-15", "2023-03-16"), "year4");
  assert.equal(band("2020-03-15", "2024-03-15"), "year4");    // exactly 4 years
  assert.equal(band("2020-03-15", "2024-03-16"), "year5");
  assert.equal(band("2020-03-15", "2025-03-15"), "year5");    // exactly 5 years
  assert.equal(band("2020-03-15", "2025-03-16"), "year6plus");
  assert.equal(band("2020-03-15", "2040-01-01"), "year6plus");
});

test("NOT calendar-year subtraction", () => {
  // 2025 - 2020 = 5, but this is only 4 years and 1 day: the 5th year, not the 6th.
  assert.equal(band("2020-12-31", "2025-01-01"), "year5");
  // 2024 - 2020 = 4, but 4 years less a day: still the 4th year.
  assert.equal(band("2020-01-01", "2024-12-31"), "year5");
  assert.equal(band("2020-01-02", "2024-01-01"), "year4");
  // 2023 - 2020 = 3, but 3 years and 1 day: the 4th year.
  assert.equal(band("2020-01-01", "2023-01-02"), "year4");
  // 2026 - 2020 = 6, but only 5 years and 2 days after 30 Dec: the 6th year starts here
  assert.equal(band("2020-12-30", "2025-12-30"), "year5");
  assert.equal(band("2020-12-30", "2025-12-31"), "year6plus");
});

test("leap-day acquisitions", () => {
  assert.equal(band("2020-02-29", "2023-02-28"), "within3");  // 3rd anniversary = 28 Feb 2023
  assert.equal(band("2020-02-29", "2023-03-01"), "year4");
  assert.equal(band("2020-02-29", "2024-02-29"), "year4");
  assert.equal(band("2020-02-29", "2024-03-01"), "year5");
});

/* ------------------------------------------------------------------ rates */

test("Schedule 5 rates, all 12 cells", () => {
  const expected = {
    part1: [30, 20, 15, 0],
    part2: [30, 20, 15, 10],
    part3: [30, 30, 30, 10],
  };
  const dates = [["2020-01-01", "2022-06-01"], ["2020-01-01", "2023-06-01"], ["2020-01-01", "2024-06-01"], ["2020-01-01", "2030-01-01"]];
  for (const [cat, rates] of Object.entries(expected)) {
    dates.forEach(([a, d], i) => {
      const r = calculateRpgt(base({ category: cat, sellerKind: cat === "part2" ? "other" : "individual", acqDate: a, dispDate: d }));
      assert.equal(r.rate, rates[i], `${cat} cell ${i}`);
    });
  }
  assert.deepEqual(RATES.part1, { within3: 30, year4: 20, year5: 15, year6plus: 0 });
});

/* ------------------------------------------------------------ the maths */

test("worked example, Part I individual, within 3 years", () => {
  const r = calculateRpgt(base({
    acqPrice: "500,000", dispPrice: "700,000",
    costAcqLegal: "5,000", costDispLegal: "5,000", costStamp: "10,000", costReno: "20,000", costOther: "0",
  }));
  assert.equal(r.complete, true);
  assert.equal(r.totalCosts, 40000);
  assert.equal(r.adjustedGain, 160000);          // 700,000 - 500,000 - 40,000
  assert.equal(r.exemptionKind, "individual");
  assert.equal(r.exemption, 16000);              // 10% of 160,000 beats RM10,000
  assert.equal(r.chargeableGain, 144000);
  assert.equal(r.rate, 30);
  assert.equal(r.tax, 43200);                    // 144,000 x 30%
});

test("individual exemption: the higher of RM10,000 or 10% of the gain, never above the gain", () => {
  assert.equal(individualExemption(50000), 10000);     // 10% = 5,000 < 10,000
  assert.equal(individualExemption(100000), 10000);    // equal
  assert.equal(individualExemption(100001), 10000.1);
  assert.equal(individualExemption(200000), 20000);
  assert.equal(individualExemption(8000), 8000);       // capped at the gain
  assert.equal(individualExemption(10000), 10000);
  assert.equal(individualExemption(0), 0);
  assert.equal(individualExemption(-500), 0);
});

test("a small gain is fully exempt for an individual", () => {
  const r = calculateRpgt(base({ acqPrice: "500,000", dispPrice: "508,000" }));
  assert.equal(r.adjustedGain, 8000);
  assert.equal(r.exemption, 8000);
  assert.equal(r.chargeableGain, 0);
  assert.equal(r.tax, 0);
});

test("companies and other bodies get NO individual exemption", () => {
  const r = calculateRpgt(base({ category: "part2", sellerKind: "" }));   // kind is forced to "other"
  assert.equal(r.complete, true);
  assert.equal(r.exemptionKind, "none");
  assert.equal(r.exemption, 0);
  assert.equal(r.chargeableGain, 200000);
  assert.equal(r.tax, 60000);                    // 200,000 x 30%
  const later = calculateRpgt(base({ category: "part2", acqDate: "2015-01-01", dispDate: "2024-01-01" }));
  assert.equal(later.rate, 10);
  assert.equal(later.tax, 20000);                // 200,000 x 10%
  // a Part I/III seller marked as "other" gets none either
  const other = calculateRpgt(base({ category: "part3", sellerKind: "other", acqDate: "2023-06-01", dispDate: "2024-06-01" }));
  assert.equal(other.exemption, 0);
  assert.equal(other.tax, 60000);
});

test("Part III individual: individual exemption applies, Part III rates", () => {
  const r = calculateRpgt(base({ category: "part3", sellerKind: "individual", acqDate: "2020-01-01", dispDate: "2024-06-01" }));
  assert.equal(r.band, "year5");
  assert.equal(r.rate, 30);
  assert.equal(r.exemption, 20000);              // 10% of 200,000
  assert.equal(r.tax, 54000);                    // 180,000 x 30%
});

test("6th year onwards: Part I pays nothing, Parts II and III pay 10%", () => {
  const old = { acqDate: "2015-01-01", dispDate: "2024-01-01" };
  assert.equal(calculateRpgt(base({ ...old })).tax, 0);
  assert.equal(calculateRpgt(base({ ...old, category: "part3" })).tax, 18000);  // (200,000-20,000) x 10%
});

test("loss or no gain: RPGT is RM0 and nothing goes negative", () => {
  const loss = calculateRpgt(base({ acqPrice: "800,000", dispPrice: "700,000" }));
  assert.equal(loss.adjustedGain, -100000);
  assert.equal(loss.exemption, 0);
  assert.equal(loss.chargeableGain, 0);
  assert.equal(loss.tax, 0);
  const even = calculateRpgt(base({ acqPrice: "700,000", dispPrice: "700,000" }));
  assert.equal(even.adjustedGain, 0);
  assert.equal(even.tax, 0);
  // costs can turn a small gain into a loss
  const costly = calculateRpgt(base({ acqPrice: "500,000", dispPrice: "520,000", costReno: "30,000" }));
  assert.equal(costly.adjustedGain, -10000);
  assert.equal(costly.tax, 0);
});

test("costs are only what the visitor types; blank costs are zero", () => {
  const none = calculateRpgt(base());
  assert.equal(none.totalCosts, 0);
  assert.equal(none.adjustedGain, 200000);
  const some = calculateRpgt(base({ costStamp: "1,000.50", costOther: "250.25" }));
  assert.equal(some.totalCosts, 1250.75);
  assert.equal(some.adjustedGain, 198749.25);
});

/* ----------------------------------------------- private residence option */

test("private residence exemption: Part I individuals only, only when ticked", () => {
  assert.equal(privateResidenceAllowed("part1", "individual"), true);
  assert.equal(privateResidenceAllowed("part1", "other"), false);
  assert.equal(privateResidenceAllowed("part2", "other"), false);
  assert.equal(privateResidenceAllowed("part3", "individual"), false);
  assert.equal(privateResidenceAllowed("", ""), false);

  const notTicked = calculateRpgt(base());
  assert.equal(notTicked.privateResidenceApplied, false);
  assert.ok(notTicked.tax > 0);

  const ticked = calculateRpgt(base({ privateResidence: true }));
  assert.equal(ticked.privateResidenceApplied, true);
  assert.equal(ticked.exemptionKind, "privateResidence");
  assert.equal(ticked.exemption, 200000);
  assert.equal(ticked.chargeableGain, 0);
  assert.equal(ticked.tax, 0);

  for (const o of [{ category: "part2", sellerKind: "" }, { category: "part3", sellerKind: "individual" }, { category: "part1", sellerKind: "other" }]) {
    const r = calculateRpgt(base({ ...o, privateResidence: true }));
    assert.equal(r.privateResidenceApplied, false, JSON.stringify(o));
    assert.ok(r.tax > 0, JSON.stringify(o));
  }
});

/* ------------------------------------------------------------- validation */

test("nothing is calculated until the mandatory fields are valid", () => {
  const r = calculateRpgt(EMPTY_INPUT);
  assert.equal(r.complete, false);
  assert.equal(r.tax, 0);
  for (const f of ["category", "sellerKind", "acqPrice", "dispPrice", "acqDate", "dispDate"])
    assert.equal(r.errors[f], "required", f);
  assert.equal(r.fieldsLeft, 6);
});

test("Part II needs no seller-type answer; Part I and III do", () => {
  assert.equal(calculateRpgt(base({ category: "part2", sellerKind: "" })).complete, true);
  assert.equal(calculateRpgt(base({ category: "part1", sellerKind: "" })).errors.sellerKind, "required");
  assert.equal(calculateRpgt(base({ category: "part3", sellerKind: "" })).errors.sellerKind, "required");
});

test("prices: required, above zero, not negative, not junk", () => {
  for (const f of ["acqPrice", "dispPrice"]) {
    assert.equal(calculateRpgt(base({ [f]: "" })).errors[f], "required");
    assert.equal(calculateRpgt(base({ [f]: "   " })).errors[f], "required");
    assert.equal(calculateRpgt(base({ [f]: "0" })).errors[f], "zero");
    assert.equal(calculateRpgt(base({ [f]: "-1" })).errors[f], "negative");
    assert.equal(calculateRpgt(base({ [f]: "RM -50,000" })).errors[f], "negative");
    assert.equal(calculateRpgt(base({ [f]: "abc" })).errors[f], "invalid");
    assert.equal(calculateRpgt(base({ [f]: "1e6" })).errors[f], "invalid");
    assert.equal(calculateRpgt(base({ [f]: "2,000,000,000" })).errors[f], "range");
  }
});

test("costs: optional, but never negative or junk", () => {
  for (const f of COST_FIELDS) {
    assert.equal(calculateRpgt(base({ [f]: "" })).complete, true, f);
    assert.equal(calculateRpgt(base({ [f]: "0" })).complete, true, f);
    assert.equal(calculateRpgt(base({ [f]: "-5" })).errors[f], "negative", f);
    assert.equal(calculateRpgt(base({ [f]: "xyz" })).errors[f], "invalid", f);
    assert.equal(calculateRpgt(base({ [f]: "2,000,000,000" })).errors[f], "range", f);
  }
});

test("dates: required, real, not before 1970, disposal not before acquisition", () => {
  assert.equal(calculateRpgt(base({ acqDate: "" })).errors.acqDate, "required");
  assert.equal(calculateRpgt(base({ dispDate: "" })).errors.dispDate, "required");
  assert.equal(calculateRpgt(base({ acqDate: "2023-02-30" })).errors.acqDate, "dateInvalid");
  assert.equal(calculateRpgt(base({ dispDate: "not a date" })).errors.dispDate, "dateInvalid");
  assert.equal(calculateRpgt(base({ acqDate: "1969-12-31" })).errors.acqDate, "dateEarly");
  assert.equal(calculateRpgt(base({ acqDate: "1970-01-01", dispDate: "1971-01-01" })).complete, true);
  assert.equal(calculateRpgt(base({ dispDate: "2101-01-01" })).errors.dispDate, "dateInvalid");
  assert.equal(calculateRpgt(base({ acqDate: "2024-06-02", dispDate: "2024-06-01" })).errors.dispDate, "dateOrder");
  assert.equal(calculateRpgt(base({ acqDate: "2024-06-01", dispDate: "2024-06-01" })).complete, true); // same day is fine
});

test("every field problem is counted", () => {
  const r = calculateRpgt(base({ acqPrice: "", dispPrice: "-1", acqDate: "", costStamp: "x" }));
  assert.equal(r.complete, false);
  assert.equal(r.fieldsLeft, 4);
});

test("the amounts shown add up", () => {
  const r = calculateRpgt(base({ costAcqLegal: "3,333.33", costReno: "12,000", dispPrice: "912,345.67" }));
  assert.equal(r.adjustedGain, Math.round((r.dispPrice - r.acqPrice - r.totalCosts) * 100) / 100);
  assert.equal(Math.round((r.adjustedGain - r.exemption) * 100) / 100, r.chargeableGain);
  assert.equal(Math.round(r.chargeableGain * r.rate) / 100, r.tax);
});
