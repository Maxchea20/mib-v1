import test from "node:test";
import assert from "node:assert/strict";
import {
  tableAFee, tableBFee, subsidiaryFee, transferDuty, loanDuty, estimateDisbursements, computeCosts,
  exemptionStatus, hdaFactor, FIRST_HOME,
} from "./costs.ts";

const opts = (o = {}) => ({
  transaction: "subsale", propertyType: "residential", firstHomeClaim: false, discountPct: 0,
  serviceTax: true, includeSubsidiary: true, disbursementsOverride: null, otherCosts: 0,
  today: "2026-11-06", ...o,
});

/* ----------------------------------------------- SRO 2023 Table A (ordinary) */

test("Table A: 1.25% on the first RM500,000, 1% on the next RM7,000,000", () => {
  assert.equal(tableAFee(100_000), 1_250);
  assert.equal(tableAFee(500_000), 6_250);                    // matches the Bar's own RM500,000 example
  assert.equal(tableAFee(500_001), 6_250.01);                 // the 1% band starts at RM500,000
  assert.equal(tableAFee(1_000_000), 11_250);                 // 6,250 + 1% of 500,000
  assert.equal(tableAFee(2_000_000), 21_250);                 // 6,250 + 1% of 1,500,000
  assert.equal(tableAFee(7_500_000), 76_250);                 // 6,250 + 1% of 7,000,000
});

test("Table A: RM500 minimum", () => {
  assert.equal(tableAFee(20_000), 500);                       // 1.25% would be RM250
  assert.equal(tableAFee(40_000), 500);                       // exactly RM500
  assert.equal(tableAFee(40_001), 500.01);
  assert.equal(tableAFee(0), 0);
});

test("Table A: above RM7.5m uses the 1% MAXIMUM on the excess", () => {
  assert.equal(tableAFee(7_500_001), 76_250.01);
  assert.equal(tableAFee(10_000_000), 101_250);               // 76,250 + 1% of 2,500,000
});

/* --------------------------------------------------------- Table B (HDA) */

test("Table B: RM500 flat up to RM50,000", () => {
  assert.equal(tableBFee(10_000), 500);
  assert.equal(tableBFee(50_000), 500);
});

test("Table B: 75% / 70% / 65% / 50% of Table A by consideration", () => {
  assert.equal(hdaFactor(100_000), 0.75);
  assert.equal(tableBFee(100_000), 937.5);                    // 75% of 1,250
  assert.equal(tableBFee(250_000), 2_343.75);                 // 75% of 3,125 (top of the 75% band)
  assert.equal(tableBFee(300_000), 2_625);                    // 70% of 3,750
  assert.equal(tableBFee(500_000), 4_375);                    // 70% of 6,250 (top of the 70% band)
  assert.equal(tableBFee(600_000), 4_712.5);                  // 65% of 7,250
  assert.equal(tableBFee(1_000_000), 7_312.5);                // 65% of 11,250 (top of the 65% band)
  assert.equal(tableBFee(2_000_000), 10_625);                 // 50% of 21,250
});

test("Table B: band edges", () => {
  assert.equal(hdaFactor(50_001), 0.75);
  assert.equal(tableBFee(50_001), 500);                       // 75% of 625.01 is below the RM500 minimum
  assert.equal(hdaFactor(250_001), 0.7);
  assert.equal(tableBFee(250_001), 2_187.51);                 // 70% of 3,125.01
  assert.equal(hdaFactor(500_001), 0.65);
  assert.equal(tableBFee(500_001), 4_062.51);                 // 65% of 6,250.01
  assert.equal(hdaFactor(1_000_001), 0.5);
  assert.equal(tableBFee(1_000_001), 5_625.01);               // 50% of 11,250.01
});

/* -------------------------------------------------- subsidiary instrument */

test("subsidiary instrument: 10% of the full scale fee, min RM500, max RM2,000", () => {
  assert.equal(subsidiaryFee(90_000), 500);                   // 10% of 1,125 = 112.50 -> minimum
  assert.equal(subsidiaryFee(450_000), 562.5);                // 10% of 5,625
  assert.equal(subsidiaryFee(900_000), 1_025);                // 10% of 10,250
  assert.equal(subsidiaryFee(1_800_000), 1_925);              // 10% of 19,250
  assert.equal(subsidiaryFee(5_000_000), 2_000);              // 10% of 51,250 = 5,125 -> maximum
  assert.equal(subsidiaryFee(0), 0);
});

/* ------------------------------------------------------------ stamp duty */

test("transfer duty: 1% / 2% / 3% / 4% by band", () => {
  assert.equal(transferDuty(100_000).total, 1_000);
  assert.equal(transferDuty(500_000).total, 9_000);           // 1,000 + 8,000
  assert.equal(transferDuty(1_000_000).total, 24_000);        // + 15,000
  assert.equal(transferDuty(2_000_000).total, 64_000);        // + 40,000
  assert.equal(transferDuty(0).total, 0);
});

test("transfer duty: tier boundaries", () => {
  assert.equal(transferDuty(99_999).total, 999.99);
  assert.equal(transferDuty(100_001).total, 1_000.02);
  assert.equal(transferDuty(500_001).total, 9_000.03);
  assert.equal(transferDuty(1_000_001).total, 24_000.04);
  assert.deepEqual(transferDuty(1_200_000).bands.map((b) => [b.ratePct, b.amount, b.duty]),
    [[1, 100_000, 1_000], [2, 400_000, 8_000], [3, 500_000, 15_000], [4, 200_000, 8_000]]);
});

test("loan duty: 0.5% of the loan", () => {
  assert.equal(loanDuty(90_000), 450);
  assert.equal(loanDuty(450_000), 2_250);
  assert.equal(loanDuty(1_800_000), 9_000);
  assert.equal(loanDuty(0), 0);
});

test("disbursement estimate by price", () => {
  assert.equal(estimateDisbursements(100_000), 2_000);
  assert.equal(estimateDisbursements(500_000), 2_000);
  assert.equal(estimateDisbursements(500_001), 2_500);
  assert.equal(estimateDisbursements(1_500_000), 2_500);
  assert.equal(estimateDisbursements(2_000_000), 3_000);
});

/* ------------------------------------------------------ whole-cost examples */

test("RM100,000 sub-sale, loan RM90,000", () => {
  const c = computeCosts(100_000, 90_000, opts());
  assert.equal(c.hda, false);
  assert.equal(c.spaFee, 1_250);
  assert.equal(c.loanFee, 1_125);
  assert.equal(c.subsidiaryFee, 500);
  assert.equal(c.legalFees, 2_875);
  assert.equal(c.serviceTax, 230);                            // 8% of 2,875
  assert.equal(c.transferDuty, 1_000);
  assert.equal(c.loanDuty, 450);
  assert.equal(c.disbursements, 2_000);
  assert.equal(c.disbursementsAreEstimate, true);
  assert.equal(c.total, 6_555);                               // 2,875 + 230 + 1,000 + 450 + 2,000
});

test("RM500,000 sub-sale, loan RM450,000", () => {
  const c = computeCosts(500_000, 450_000, opts());
  assert.equal(c.spaFee, 6_250);
  assert.equal(c.loanFee, 5_625);
  assert.equal(c.subsidiaryFee, 562.5);
  assert.equal(c.legalFees, 12_437.5);
  assert.equal(c.serviceTax, 995);
  assert.equal(c.transferDuty, 9_000);
  assert.equal(c.loanDuty, 2_250);
  assert.equal(c.total, 26_682.5);                            // 12,437.50 + 995 + 9,000 + 2,250 + 2,000
});

test("RM1,000,000 sub-sale, loan RM900,000", () => {
  const c = computeCosts(1_000_000, 900_000, opts());
  assert.equal(c.spaFee, 11_250);
  assert.equal(c.loanFee, 10_250);
  assert.equal(c.subsidiaryFee, 1_025);
  assert.equal(c.legalFees, 22_525);
  assert.equal(c.serviceTax, 1_802);
  assert.equal(c.transferDuty, 24_000);
  assert.equal(c.loanDuty, 4_500);
  assert.equal(c.disbursements, 2_500);
  assert.equal(c.total, 55_327);                              // 22,525 + 1,802 + 24,000 + 4,500 + 2,500
});

test("RM2,000,000 sub-sale, loan RM1,800,000", () => {
  const c = computeCosts(2_000_000, 1_800_000, opts());
  assert.equal(c.spaFee, 21_250);
  assert.equal(c.loanFee, 19_250);
  assert.equal(c.subsidiaryFee, 1_925);
  assert.equal(c.legalFees, 42_425);
  assert.equal(c.serviceTax, 3_394);
  assert.equal(c.transferDuty, 64_000);
  assert.equal(c.loanDuty, 9_000);
  assert.equal(c.disbursements, 3_000);
  assert.equal(c.total, 121_819);                             // 42,425 + 3,394 + 64,000 + 9,000 + 3,000
});

test("developer purchase (HDA, residential) uses Table B for the SPA and the loan", () => {
  const c = computeCosts(500_000, 450_000, opts({ transaction: "developer" }));
  assert.equal(c.hda, true);
  assert.equal(c.spaFee, 4_375);                              // 70% of 6,250
  assert.equal(c.loanFee, 3_937.5);                           // 70% of 5,625
  assert.equal(c.subsidiaryFee, 562.5);                       // 10% of the FULL Table A fee
  assert.equal(c.legalFees, 8_875);
  const m = computeCosts(1_000_000, 900_000, opts({ transaction: "developer" }));
  assert.equal(m.spaFee, 7_312.5);                            // 65% of 11,250
  assert.equal(m.loanFee, 6_662.5);                           // 65% of 10,250
  assert.equal(m.subsidiaryFee, 1_025);
  const big = computeCosts(2_000_000, 1_800_000, opts({ transaction: "developer" }));
  assert.equal(big.spaFee, 10_625);
  assert.equal(big.loanFee, 9_625);
  assert.equal(big.subsidiaryFee, 1_925);
});

test("HDA scale applies to developer purchases of RESIDENTIAL property only", () => {
  for (const type of ["commercial", "industrial", "land"]) {
    const c = computeCosts(500_000, 450_000, opts({ transaction: "developer", propertyType: type }));
    assert.equal(c.hda, false, type);
    assert.equal(c.spaFee, 6_250, type);
  }
  assert.equal(computeCosts(500_000, 450_000, opts({ transaction: "subsale" })).hda, false);
});

test("discount: up to 25% on ordinary fees only, none on HDA", () => {
  const c = computeCosts(500_000, 450_000, opts({ discountPct: 25 }));
  assert.equal(c.spaFee, 4_687.5);                            // matches the published 25%-off example
  assert.equal(c.spaFeeBeforeDiscount, 6_250);
  assert.equal(c.loanFee, 4_218.75);
  assert.equal(c.subsidiaryFee, 421.88);
  assert.equal(c.discountApplied, 25);
  const hda = computeCosts(500_000, 450_000, opts({ transaction: "developer", discountPct: 25 }));
  assert.equal(hda.spaFee, 4_375);                            // unchanged
  assert.equal(hda.discountApplied, 0);
  assert.equal(hda.discountIgnoredForHda, true);
  assert.equal(computeCosts(500_000, 450_000, opts({ discountPct: 99 })).discountApplied, 25);   // capped
});

test("cash purchase: no loan fees and no loan duty", () => {
  const c = computeCosts(500_000, 0, opts());
  assert.equal(c.loanFee, 0);
  assert.equal(c.subsidiaryFee, 0);
  assert.equal(c.loanDuty, 0);
  assert.equal(c.legalFees, 6_250);
  assert.equal(c.total, 6_250 + 500 + 9_000 + 2_000);         // + 8% service tax (500)
});

test("no subsidiary instrument when switched off", () => {
  const c = computeCosts(500_000, 450_000, opts({ includeSubsidiary: false }));
  assert.equal(c.subsidiaryFee, 0);
  assert.equal(c.legalFees, 11_875);
});

test("service tax can be switched off; it is charged on legal fees only", () => {
  const c = computeCosts(500_000, 450_000, opts({ serviceTax: false }));
  assert.equal(c.serviceTax, 0);
  assert.equal(c.total, 12_437.5 + 9_000 + 2_250 + 2_000);
});

test("your own disbursements (even RM0) replace the estimate; other costs are added", () => {
  const c = computeCosts(500_000, 450_000, opts({ disbursementsOverride: 0, otherCosts: 1_000 }));
  assert.equal(c.disbursements, 0);
  assert.equal(c.disbursementsAreEstimate, false);
  assert.equal(c.otherCosts, 1_000);
  assert.equal(c.total, 12_437.5 + 995 + 9_000 + 2_250 + 0 + 1_000);
});

test("above RM7.5m is flagged as a maximum", () => {
  assert.equal(computeCosts(10_000_000, 9_000_000, opts()).aboveScaleCap, true);
  assert.equal(computeCosts(7_500_000, 6_000_000, opts()).aboveScaleCap, false);
});

/* ------------------------------------------------------ first-home exemption */

test("first-home exemption removes BOTH transfer and loan duty, when every condition holds", () => {
  const c = computeCosts(500_000, 450_000, opts({ firstHomeClaim: true }));
  assert.equal(c.exemption.applied, true);
  assert.equal(c.transferDuty, 0);
  assert.equal(c.loanDuty, 0);
  assert.equal(c.transferDutyBeforeExemption, 9_000);
  assert.equal(c.loanDutyBeforeExemption, 2_250);
  assert.equal(c.total, 12_437.5 + 995 + 2_000);
  // legal fees are never exempt
  assert.equal(c.legalFees, 12_437.5);
});

test("first-home exemption: not applied above RM500,000, for non-residential, or after 31 Dec 2027", () => {
  assert.equal(exemptionStatus(500_001, opts({ firstHomeClaim: true })).reason, "priceTooHigh");
  assert.equal(exemptionStatus(500_000, opts({ firstHomeClaim: true })).applied, true);
  assert.equal(exemptionStatus(400_000, opts({ firstHomeClaim: true, propertyType: "commercial" })).reason, "notResidential");
  assert.equal(exemptionStatus(400_000, opts({ firstHomeClaim: true, today: "2027-12-31" })).applied, true);
  assert.equal(exemptionStatus(400_000, opts({ firstHomeClaim: true, today: "2028-01-01" })).reason, "expired");
  assert.equal(exemptionStatus(400_000, opts()).reason, "notRequested");
  const over = computeCosts(600_000, 540_000, opts({ firstHomeClaim: true }));
  assert.equal(over.transferDuty, over.transferDutyBeforeExemption);
  assert.equal(over.loanDuty, over.loanDutyBeforeExemption);
  assert.equal(FIRST_HOME.validUntil, "2027-12-31");
});

test("the total is always the sum of its parts", () => {
  for (const [price, loan] of [[100_000, 90_000], [333_333.33, 299_999.99], [500_000, 0], [1_234_567, 1_111_110], [8_000_000, 7_200_000]]) {
    for (const t of ["subsale", "developer"]) {
      const c = computeCosts(price, loan, opts({ transaction: t, discountPct: 10 }));
      const sum = c.legalFees + c.serviceTax + c.transferDuty + c.loanDuty + c.disbursements + c.otherCosts;
      assert.ok(Math.abs(sum - c.total) < 0.011, `${price}/${loan}/${t}`);
      assert.ok(Math.abs(c.spaFee + c.loanFee + c.subsidiaryFee - c.legalFees) < 0.011);
    }
  }
});
