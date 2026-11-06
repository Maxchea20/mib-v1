import test from "node:test";
import assert from "node:assert/strict";
import { calculateHousingLoan, monthlyInstalment, formatRM, parseNumber, DEFAULTS } from "./housingLoan.ts";

const calc = (o = {}) => calculateHousingLoan({ ...DEFAULTS, ...o });

test("the example: RM100,000, 90%, 30 years, 4.5% -> RM456.02 a month", () => {
  const r = calc();
  assert.equal(r.ok, true);
  assert.equal(r.loanAmount, 90000);
  assert.equal(r.downPayment, 10000);
  assert.equal(r.months, 360);
  assert.equal(r.monthly, 456.02);
  assert.equal(r.totalRepayment, 164167.2);   // 456.02 x 360
  assert.equal(r.totalInterest, 74167.2);     // total - loan
  assert.equal(r.loanAmount + r.downPayment, 100000);
});

test("reducing-balance formula, not flat rate (flat would be RM 563.33 on the same loan)", () => {
  const flatMonthly = (90000 + 90000 * 0.045 * 30) / 360;
  assert.ok(Math.abs(calc().monthly - flatMonthly) > 100);
});

test("matches an independent 60-digit Decimal calculation", () => {
  // Reference values computed separately with Python's decimal module.
  assert.equal(monthlyInstalment(90000, 4.5, 360), 456.02);
  assert.equal(monthlyInstalment(500000, 4.5, 360), 2533.43);
  assert.equal(monthlyInstalment(300000, 4, 300), 1583.51);
  assert.equal(monthlyInstalment(1000000, 3.85, 420), 4338.23);
});

test("zero interest divides evenly (no division by zero)", () => {
  const r = calc({ rate: 0 });
  assert.equal(r.ok, true);
  assert.equal(r.monthly, 250);               // 90,000 / 360
  assert.equal(r.totalInterest, 0);
  assert.equal(r.totalRepayment, 90000);
});

test("zero interest never produces a negative interest figure (rounding)", () => {
  const r = calc({ price: 500000, margin: 80, tenure: 25, rate: 0 }); // 400,000 / 300 = 1,333.33...
  assert.equal(r.monthly, 1333.33);
  assert.equal(r.totalRepayment, 400000);
  assert.equal(r.totalInterest, 0);
});

test("total interest is never negative, even at tiny rates", () => {
  for (const rate of [0, 0.0001, 0.001, 0.01, 0.1, 1])
    for (const tenure of [1, 7, 25, 40]) {
      const r = calc({ price: 777777, margin: 77, tenure, rate });
      assert.ok(r.totalInterest >= 0, `${rate}% ${tenure}y`);
      assert.ok(r.totalRepayment >= r.loanAmount);
    }
});

test("changing the margin changes loan and down payment together", () => {
  const r = calc({ price: 500000, margin: 80 });
  assert.equal(r.loanAmount, 400000);
  assert.equal(r.downPayment, 100000);
  const full = calc({ price: 500000, margin: 100 });
  assert.equal(full.downPayment, 0);
});

test("a shorter tenure means a higher instalment but less interest", () => {
  const long = calc({ tenure: 35 }), short = calc({ tenure: 20 });
  assert.ok(short.monthly > long.monthly);
  assert.ok(short.totalInterest < long.totalInterest);
});

test("fractional years work (2.5 years = 30 months)", () => {
  assert.equal(calc({ tenure: 2.5 }).months, 30);
});

test("validation rejects bad input and returns zeros", () => {
  for (const [bad, field] of [
    [{ price: 0 }, "price"], [{ price: -5 }, "price"], [{ price: NaN }, "price"], [{ price: Infinity }, "price"],
    [{ price: 2e9 }, "price"],
    [{ margin: 0 }, "margin"], [{ margin: 101 }, "margin"], [{ margin: NaN }, "margin"],
    [{ tenure: 0 }, "tenure"], [{ tenure: 41 }, "tenure"], [{ tenure: NaN }, "tenure"],
    [{ rate: -1 }, "rate"], [{ rate: 26 }, "rate"], [{ rate: NaN }, "rate"],
  ]) {
    const r = calc(bad);
    assert.equal(r.ok, false, JSON.stringify(bad));
    assert.ok(r.errors[field], `${field} for ${JSON.stringify(bad)}`);
    assert.equal(r.monthly, 0);
    assert.equal(r.loanAmount, 0);
  }
});

test("boundary values are accepted", () => {
  for (const ok of [{ margin: 1 }, { margin: 100 }, { tenure: 1 }, { tenure: 40 }, { rate: 0 }, { rate: 25 }, { price: 1 }, { price: 1e9 }])
    assert.equal(calc(ok).ok, true, JSON.stringify(ok));
});

test("tiny and huge prices stay finite and consistent", () => {
  const small = calc({ price: 1 });
  assert.ok(Number.isFinite(small.monthly));
  const big = calc({ price: 1e9 });
  assert.ok(Number.isFinite(big.monthly) && big.monthly > 0);
  assert.equal(big.loanAmount + big.downPayment, 1e9);
});

test("Ringgit formatting: two decimals and thousands separators", () => {
  assert.equal(formatRM(456.02), "RM 456.02");
  assert.equal(formatRM(90000), "RM 90,000.00");
  assert.equal(formatRM(1234567.8), "RM 1,234,567.80");
  assert.equal(formatRM(0), "RM 0.00");
});

test("parsing what people type", () => {
  assert.equal(parseNumber("500,000"), 500000);
  assert.equal(parseNumber("RM 500,000"), 500000);
  assert.equal(parseNumber(" 4.5 "), 4.5);
  assert.equal(parseNumber("4."), 4);
  assert.equal(parseNumber(".5"), 0.5);
  for (const bad of ["", "abc", "1e5", "-5", "5-", "1.2.3", "NaN", "Infinity", "0x10", "5 000 abc"])
    assert.ok(Number.isNaN(parseNumber(bad)), bad);
});
