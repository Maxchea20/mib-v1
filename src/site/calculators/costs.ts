/*
|--------------------------------------------------------------------------
| PURCHASE TRANSACTION COSTS (pure, unit-tested)
|--------------------------------------------------------------------------
|
| One calculation shared by the "Legal fees and stamp duty" and the "Total
| property purchase cost" calculators, so no cost is ever counted twice or
| calculated two different ways.
|
| SOURCES (checked 2026-11-06)
|
| LEGAL FEES - Solicitors' Remuneration Order 2023, P.U.(A) 207, in force
| 15 July 2023. Gazette text read from the Malaysian Bar's Circular 185/2023.
|
|   First Schedule, Table A (sale and transfer, ordinary / sub-sale):
|     first RM500,000        1.25% (minimum RM500)
|     next RM7,000,000       1%
|     above RM7,500,000      negotiable, but not more than 1% of the excess
|
|   First Schedule, Table B (transactions under the Housing Development
|   (Control and Licensing) Act 1966, i.e. developer purchases):
|     RM50,000 or less                  RM500
|     over RM50,000 up to RM250,000     75% of the Table A fee (minimum RM500)
|     over RM250,000 up to RM500,000    70% of the Table A fee
|     over RM500,000 up to RM1,000,000  65% of the Table A fee
|     over RM1,000,000                  50% of the Table A fee
|
|   Third Schedule (charges and financing documents): the same bands applied
|   to the amount financed. Table A for ordinary transactions; Table B (the
|   same percentages as above) for HDA transactions. Each subsidiary
|   instrument (for example the charge or assignment) is 10% of the FULL
|   Table A scale fee, minimum RM500, maximum RM2,000.
|
|   Rule 6: a solicitor may discount Table A fees by up to 25%. No discount
|   may be given on Table B fees.
|
|   Rule 3(1): the scale fee does NOT include stamp duty, registration fees,
|   searches or other disbursements, which are charged on top.
|
| STAMP DUTY - Stamp Act 1949, rates as supplied by the owner and matching
| published guides: transfer 1% / 2% / 3% / 4% by band; loan agreement 0.5%.
| (The Act charges "per RM100 / RM1,000 or part thereof", so the official
| figure can differ from the percentage by a few ringgit.)
|
| FIRST-HOME EXEMPTION - Stamp Duty (Exemption) Orders P.U.(A) 53/2021 and
| 54/2021, extended to 31 December 2027 by P.U.(A) 448/2025 and 449/2025
| (per a law-firm summary of the gazetted amendments, not the gazette):
| full exemption of the transfer and loan duty on a first residential
| property with a market value of RM500,000 or less, for a Malaysian
| citizen. The Budget 2027 proposals (to 2030, and a 50% relief up to
| RM750,000) are NOT law yet and are NOT applied.
|
| SERVICE TAX - 8% on legal services since 1 March 2024 (tax-adviser
| summaries). It applies to the lawyer's fee, not to stamp duty or
| disbursements, and only if the firm is registered for service tax.
|
| DISBURSEMENTS - not set by law. Estimated from published law-firm ranges
| (about RM1,800 to RM2,500 on a RM300,000 purchase and RM2,000 to RM3,000
| on RM1,000,000). Always an estimate; the visitor can replace it.
|
*/

import { round2 } from "./input";

export type TransactionType = "subsale" | "developer";
export type PropertyType = "residential" | "commercial" | "industrial" | "land";

export const SERVICE_TAX_RATE = 8; // percent
export const DISCOUNT_MAX = 25; // percent, Table A only
export const SUBSIDIARY_PERCENT = 10;
export const SUBSIDIARY_MIN = 500;
export const SUBSIDIARY_MAX = 2000;
export const SCALE_MIN_FEE = 500;

export const FIRST_HOME = {
  priceCap: 500_000,
  validUntil: "2027-12-31", // SPA executed on or before this date
} as const;

/* ------------------------------------------------------------ legal fees */

export type FeeBand = { upTo: number; ratePct: number };

export const ABOVE_SCALE_LIMIT = 7_500_000;
export const ABOVE_SCALE_RATE_MAX = 1; // percent of the excess, a maximum

/** Table A fee on an amount, before any discount. Above RM7.5m is the 1% MAXIMUM. */
export function tableAFee(amount: number): number {
  if (amount <= 0) return 0;

  const first = Math.min(amount, 500_000) * 0.0125;
  const next = Math.max(0, Math.min(amount, ABOVE_SCALE_LIMIT) - 500_000) * 0.01;
  const above = Math.max(0, amount - ABOVE_SCALE_LIMIT) * (ABOVE_SCALE_RATE_MAX / 100);

  return round2(Math.max(SCALE_MIN_FEE, first + next + above));
}

/** The share of the Table A fee that Table B (HDA) charges for this amount. */
export function hdaFactor(amount: number): number {
  if (amount <= 250_000) return 0.75;
  if (amount <= 500_000) return 0.7;
  if (amount <= 1_000_000) return 0.65;
  return 0.5;
}

/** Table B (HDA) fee on an amount. */
export function tableBFee(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 50_000) return 500;

  const fee = tableAFee(amount) * hdaFactor(amount);
  return round2(amount <= 250_000 ? Math.max(SCALE_MIN_FEE, fee) : fee);
}

/** 10% of the full Table A fee, never under RM500 or over RM2,000. */
export function subsidiaryFee(loan: number): number {
  if (loan <= 0) return 0;
  const tenPercent = (tableAFee(loan) * SUBSIDIARY_PERCENT) / 100;
  return round2(Math.min(SUBSIDIARY_MAX, Math.max(SUBSIDIARY_MIN, tenPercent)));
}

/* ------------------------------------------------------------ stamp duty */

export type DutyBand = { from: number; to: number; ratePct: number; amount: number; duty: number };

const TRANSFER_BANDS = [
  { from: 0, to: 100_000, ratePct: 1 },
  { from: 100_000, to: 500_000, ratePct: 2 },
  { from: 500_000, to: 1_000_000, ratePct: 3 },
  { from: 1_000_000, to: Infinity, ratePct: 4 },
];

/** Stamp duty on the transfer (MOT), band by band. */
export function transferDuty(price: number): { total: number; bands: DutyBand[] } {
  const bands: DutyBand[] = [];
  let total = 0;

  for (const b of TRANSFER_BANDS) {
    const amount = Math.max(0, Math.min(price, b.to) - b.from);
    if (amount <= 0) continue;
    const duty = round2((amount * b.ratePct) / 100);
    bands.push({ from: b.from, to: Math.min(price, b.to), ratePct: b.ratePct, amount, duty });
    total += duty;
  }

  return { total: round2(total), bands };
}

export const LOAN_DUTY_RATE = 0.5; // percent

export function loanDuty(loan: number): number {
  return loan <= 0 ? 0 : round2((loan * LOAN_DUTY_RATE) / 100);
}

/* ------------------------------------------------------- disbursements */

/** Estimate only. Replaced by the visitor's own figure when they enter one. */
export function estimateDisbursements(price: number): number {
  if (price <= 500_000) return 2_000;
  if (price <= 1_500_000) return 2_500;
  return 3_000;
}

/* -------------------------------------------------------------- the lot */

export type CostOptions = {
  transaction: TransactionType;
  propertyType: PropertyType;
  firstHomeClaim: boolean; // "I am a Malaysian citizen buying my first home"
  discountPct: number; // 0..25, ordinary (Table A) fees only
  serviceTax: boolean; // the law firm charges service tax
  includeSubsidiary: boolean; // a charge/assignment is prepared with the loan agreement
  disbursementsOverride: number | null; // null = use the estimate
  otherCosts: number;
  today: string; // "YYYY-MM-DD", used to check the exemption period
};

export type ExemptionStatus = {
  requested: boolean;
  applied: boolean;
  reason: "ok" | "notRequested" | "notResidential" | "priceTooHigh" | "expired";
};

export type CostBreakdown = {
  hda: boolean;
  discountApplied: number; // percent actually applied
  discountIgnoredForHda: boolean;
  spaFeeBeforeDiscount: number;
  spaFee: number;
  loanFeeBeforeDiscount: number;
  loanFee: number;
  subsidiaryFeeBeforeDiscount: number;
  subsidiaryFee: number;
  legalFees: number; // SPA + loan + subsidiary
  serviceTax: number;
  transferBands: DutyBand[];
  transferDutyBeforeExemption: number;
  loanDutyBeforeExemption: number;
  transferDuty: number;
  loanDuty: number;
  exemption: ExemptionStatus;
  disbursements: number;
  disbursementsAreEstimate: boolean;
  otherCosts: number;
  total: number;
  aboveScaleCap: boolean; // fee uses the 1% maximum above RM7.5m
};

export function exemptionStatus(price: number, o: CostOptions): ExemptionStatus {
  if (!o.firstHomeClaim) return { requested: false, applied: false, reason: "notRequested" };
  if (o.propertyType !== "residential") return { requested: true, applied: false, reason: "notResidential" };
  if (price > FIRST_HOME.priceCap) return { requested: true, applied: false, reason: "priceTooHigh" };
  if (o.today > FIRST_HOME.validUntil) return { requested: true, applied: false, reason: "expired" };
  return { requested: true, applied: true, reason: "ok" };
}

export function computeCosts(price: number, loan: number, o: CostOptions): CostBreakdown {
  const hda = o.transaction === "developer" && o.propertyType === "residential";

  // Discount: ordinary (Table A) fees only. HDA (Table B) fees cannot be discounted.
  const discountApplied = hda ? 0 : Math.min(DISCOUNT_MAX, Math.max(0, o.discountPct));
  const discountIgnoredForHda = hda && o.discountPct > 0;
  const keep = 1 - discountApplied / 100;

  const spaFeeBeforeDiscount = hda ? tableBFee(price) : tableAFee(price);
  const loanFeeBeforeDiscount = loan > 0 ? (hda ? tableBFee(loan) : tableAFee(loan)) : 0;
  const subBefore = loan > 0 && o.includeSubsidiary ? subsidiaryFee(loan) : 0;

  const spaFee = round2(spaFeeBeforeDiscount * keep);
  const loanFee = round2(loanFeeBeforeDiscount * keep);
  const subFee = round2(subBefore * keep);
  const legalFees = round2(spaFee + loanFee + subFee);

  const serviceTax = o.serviceTax ? round2((legalFees * SERVICE_TAX_RATE) / 100) : 0;

  const transfer = transferDuty(price);
  const loanDutyFull = loanDuty(loan);
  const exemption = exemptionStatus(price, o);
  const transferFinal = exemption.applied ? 0 : transfer.total;
  const loanDutyFinal = exemption.applied ? 0 : loanDutyFull;

  const disbursementsAreEstimate = o.disbursementsOverride === null;
  const disbursements = round2(
    o.disbursementsOverride === null ? estimateDisbursements(price) : o.disbursementsOverride
  );

  const total = round2(
    legalFees + serviceTax + transferFinal + loanDutyFinal + disbursements + o.otherCosts
  );

  return {
    hda,
    discountApplied,
    discountIgnoredForHda,
    spaFeeBeforeDiscount,
    spaFee,
    loanFeeBeforeDiscount,
    loanFee,
    subsidiaryFeeBeforeDiscount: subBefore,
    subsidiaryFee: subFee,
    legalFees,
    serviceTax,
    transferBands: transfer.bands,
    transferDutyBeforeExemption: transfer.total,
    loanDutyBeforeExemption: loanDutyFull,
    transferDuty: transferFinal,
    loanDuty: loanDutyFinal,
    exemption,
    disbursements,
    disbursementsAreEstimate,
    otherCosts: o.otherCosts,
    total,
    aboveScaleCap: price > ABOVE_SCALE_LIMIT || loan > ABOVE_SCALE_LIMIT,
  };
}
