import test from "node:test";
import assert from "node:assert/strict";
import { loanEstimate, loanCopy, LOAN_ASSUMPTIONS, LOAN_RATE } from "./loanEstimate.ts";

test("the percentages are the ones chosen: house 90, commercial 80, industrial 80, land 50, rate 4.5", () => {
  assert.equal(LOAN_ASSUMPTIONS.Residential.margin, 90);
  assert.equal(LOAN_ASSUMPTIONS.Commercial.margin, 80);
  assert.equal(LOAN_ASSUMPTIONS.Industrial.margin, 80);
  assert.equal(LOAN_ASSUMPTIONS.Land.margin, 50);
  assert.equal(LOAN_RATE, 4.5);
});

test("residential RM430,000: 10% down, 90% loan, 35 years at 4.5%", () => {
  const e = loanEstimate({ category: "Residential", purpose: "For Sale", price: 430000 });
  assert.equal(e.downPayment, 43000);
  assert.equal(e.loanAmount, 387000);
  assert.equal(e.years, 35);
  // reducing-balance instalment, checked by hand: 387000 * r / (1 - (1+r)^-420), r = 0.045/12
  assert.equal(e.monthly, 1832); // 1831.50 rounded
});

test("commercial and industrial are 80%, land is 50%", () => {
  assert.equal(loanEstimate({ category: "Commercial", purpose: "For Sale", price: 1000000 }).loanAmount, 800000);
  assert.equal(loanEstimate({ category: "Industrial", purpose: "For Sale", price: 2000000 }).downPayment, 400000);
  const land = loanEstimate({ category: "Land", purpose: "For Sale", price: 500000 });
  assert.equal(land.loanAmount, 250000);
  assert.equal(land.downPayment, 250000);
});

test("no estimate for rent, no price, or an unknown category", () => {
  assert.equal(loanEstimate({ category: "Residential", purpose: "For Rent", price: 2000 }), null);
  assert.equal(loanEstimate({ category: "Residential", purpose: "For Sale", price: null }), null);
  assert.equal(loanEstimate({ category: "Residential", purpose: "For Sale", price: 0 }), null);
  assert.equal(loanEstimate({ category: "Other", purpose: "For Sale", price: 100000 }), null);
  assert.equal(loanEstimate({ category: null, purpose: "For Sale", price: 100000 }), null);
});

test("every language says it is indicative and depends on the bank", () => {
  const e = loanEstimate({ category: "Residential", purpose: "For Sale", price: 430000 });
  assert.match(loanCopy(e, "en").note, /Indicative only.*4\.5%.*Subject to bank approval/);
  assert.match(loanCopy(e, "ms").note, /panduan sahaja.*4\.5%.*kelulusan bank/);
  assert.match(loanCopy(e, "zh").note, /仅供参考.*4\.5%.*银行批准/);
  assert.match(loanCopy(e, "en").downPayment, /10%/);
});
