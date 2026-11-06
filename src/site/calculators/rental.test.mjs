import test from "node:test";
import assert from "node:assert/strict";
import { calculateRental, EMPTY_INPUT } from "./rental.ts";

const r = (o = {}) => calculateRental({ ...EMPTY_INPUT, ...o });

test("nothing is calculated until price and rent are entered", () => {
  const x = r();
  assert.equal(x.complete, false);
  assert.equal(x.errors.price, "required");
  assert.equal(x.errors.rent, "required");
  assert.equal(x.fieldsLeft, 2);
});

test("worked example, all expense lines", () => {
  const x = r({
    price: "500,000", rent: "2,000",
    maintenance: "200", sinking: "20", otherMonthly: "0",
    assessment: "600", quitRent: "100", insurance: "200", repairs: "500", otherAnnual: "0",
  });
  assert.equal(x.annualGross, 24_000);
  assert.equal(x.monthlyExpenses, 220);
  assert.equal(x.annualExpensesTotal, 1_400);
  assert.equal(x.annualOperating, 4_040);          // 220 x 12 + 1,400
  assert.equal(x.annualNet, 19_960);
  assert.equal(x.monthlyNet, 1_663.33);
  assert.equal(x.grossYield, 4.8);
  assert.equal(x.netYield, 3.99);                  // 3.992
  assert.equal(x.financing, null);
});

test("zero expenses: net equals gross", () => {
  const x = r({ price: "400,000", rent: "1,600" });
  assert.equal(x.annualGross, 19_200);
  assert.equal(x.annualOperating, 0);
  assert.equal(x.annualNet, 19_200);
  assert.equal(x.grossYield, 4.8);
  assert.equal(x.netYield, 4.8);
});

test("zero rent is allowed: yield 0, net negative when there are expenses", () => {
  const x = r({ price: "300,000", rent: "0", maintenance: "150", assessment: "300" });
  assert.equal(x.complete, true);
  assert.equal(x.grossYield, 0);
  assert.equal(x.annualNet, -2_100);               // -(150 x 12 + 300)
  assert.equal(x.netYield, -0.7);
  assert.equal(x.monthlyNet, -175);
});

test("negative net rental when expenses exceed rent", () => {
  const x = r({ price: "1,000,000", rent: "1,000", maintenance: "800", sinking: "300", repairs: "1,200" });
  assert.equal(x.annualGross, 12_000);
  assert.equal(x.annualOperating, 14_400);         // 1,100 x 12 + 1,200
  assert.equal(x.annualNet, -2_400);
  assert.equal(x.netYield, -0.24);
  assert.equal(x.monthlyNet, -200);
});

test("validation", () => {
  assert.equal(r({ price: "0", rent: "1000" }).errors.price, "zero");
  assert.equal(r({ price: "-1", rent: "1000" }).errors.price, "negative");
  assert.equal(r({ price: "500000", rent: "-1" }).errors.rent, "negative");
  assert.equal(r({ price: "500000", rent: "abc" }).errors.rent, "invalid");
  assert.equal(r({ price: "500000", rent: "1000", maintenance: "-5" }).errors.maintenance, "negative");
  assert.equal(r({ price: "500000", rent: "1000", repairs: "x" }).errors.repairs, "invalid");
});

test("loan instalment is never part of the yield; cash flow is separate", () => {
  const base = r({ price: "500,000", rent: "1,500" });
  const fin = r({ price: "500,000", rent: "1,500", financing: true });
  assert.equal(fin.netYield, base.netYield);
  assert.equal(fin.annualNet, base.annualNet);
  assert.equal(fin.financing.loanAmount, 450_000);
  assert.equal(fin.financing.monthlyCashFlow, Math.round((fin.monthlyNet - fin.financing.monthlyInstalment) * 100) / 100);
  assert.ok(fin.financing.monthlyCashFlow < 0);
});

test("financing inputs are only validated when the section is on", () => {
  assert.equal(r({ price: "500000", rent: "2000", margin: "500" }).complete, true);
  assert.equal(r({ price: "500000", rent: "2000", margin: "500", financing: true }).errors.margin, "range");
});
