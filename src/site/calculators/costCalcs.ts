/*
| The two purchase-cost calculators, from what the visitor typed.
|   evaluateLegalFees    price + loan amount        -> costs
|   evaluatePurchaseCost price + margin/tenure/rate -> costs + cash needed + instalment
| Both use the SAME computeCosts(), so nothing is counted twice.
*/

import { LIMITS, calculateHousingLoan } from "./housingLoan";
import { readAmount, round2 } from "./input";
import {
  computeCosts,
  DISCOUNT_MAX,
  type CostBreakdown,
  type PropertyType,
  type TransactionType,
} from "./costs";

export type FieldError = "required" | "invalid" | "negative" | "zero" | "range" | "loanTooHigh";

export type CommonFields = "price" | "discount" | "disbursements" | "other";

export type CostInputBase = {
  price: string;
  discount: string;
  disbursements: string;
  other: string;
  transaction: TransactionType;
  propertyType: PropertyType;
  firstHome: boolean;
  serviceTax: boolean;
  subsidiary: boolean;
};

export const MONEY_MAX = 1_000_000_000;

export const COST_DEFAULTS: CostInputBase = {
  price: "",
  discount: "",
  disbursements: "",
  other: "",
  transaction: "subsale",
  propertyType: "residential",
  firstHome: false,
  serviceTax: true,
  subsidiary: true,
};

type Errors<K extends string> = Partial<Record<K, FieldError>>;

type Common = {
  errors: Errors<CommonFields>;
  price: number;
  discountPct: number;
  disbursementsOverride: number | null;
  other: number;
};

function readCommon(t: CostInputBase): Common {
  const errors: Errors<CommonFields> = {};
  let price = NaN;
  let discountPct = 0;
  let disbursementsOverride: number | null = null;
  let other = 0;

  // price: required, above zero
  {
    const { kind, value } = readAmount(t.price);
    if (kind === "blank") errors.price = "required";
    else if (kind === "negative") errors.price = "negative";
    else if (kind === "invalid") errors.price = "invalid";
    else if (value === 0) errors.price = "zero";
    else if (value > MONEY_MAX) errors.price = "range";
    else price = value;
  }

  // discount: optional, 0 to 25
  {
    const { kind, value } = readAmount(t.discount);
    if (kind === "negative") errors.discount = "negative";
    else if (kind === "invalid") errors.discount = "invalid";
    else if (kind === "ok") {
      if (value > DISCOUNT_MAX) errors.discount = "range";
      else discountPct = value;
    }
  }

  // disbursements: optional; blank = use the estimate, 0 is allowed
  {
    const { kind, value } = readAmount(t.disbursements);
    if (kind === "negative") errors.disbursements = "negative";
    else if (kind === "invalid") errors.disbursements = "invalid";
    else if (kind === "ok") {
      if (value > MONEY_MAX) errors.disbursements = "range";
      else disbursementsOverride = value;
    }
  }

  // other costs: optional, blank = 0
  {
    const { kind, value } = readAmount(t.other);
    if (kind === "negative") errors.other = "negative";
    else if (kind === "invalid") errors.other = "invalid";
    else if (kind === "ok") {
      if (value > MONEY_MAX) errors.other = "range";
      else other = value;
    }
  }

  return { errors, price, discountPct, disbursementsOverride, other };
}

const optionsFrom = (t: CostInputBase, c: Common, today: string) => ({
  transaction: t.transaction,
  propertyType: t.propertyType,
  firstHomeClaim: t.firstHome,
  discountPct: c.discountPct,
  serviceTax: t.serviceTax,
  includeSubsidiary: t.subsidiary,
  disbursementsOverride: c.disbursementsOverride,
  otherCosts: c.other,
  today,
});

/* ------------------------------------------------- legal fees + stamp duty */

export type LegalFeesInput = CostInputBase & { loan: string };
export type LegalFeesField = CommonFields | "loan";

export type LegalFeesResult = {
  complete: boolean;
  errors: Errors<LegalFeesField>;
  fieldsLeft: number;
  price: number;
  loan: number;
  costs: CostBreakdown | null;
};

export function evaluateLegalFees(t: LegalFeesInput, today: string): LegalFeesResult {
  const c = readCommon(t);
  const errors: Errors<LegalFeesField> = { ...c.errors };
  let loan = NaN;

  // Loan amount: must be entered (0 means a cash purchase), and cannot exceed the price.
  const { kind, value } = readAmount(t.loan);
  if (kind === "blank") errors.loan = "required";
  else if (kind === "negative") errors.loan = "negative";
  else if (kind === "invalid") errors.loan = "invalid";
  else if (value > MONEY_MAX) errors.loan = "range";
  else if (Number.isFinite(c.price) && value > c.price) errors.loan = "loanTooHigh";
  else loan = value;

  const fieldsLeft = Object.keys(errors).length;
  if (fieldsLeft > 0) {
    return { complete: false, errors, fieldsLeft, price: 0, loan: 0, costs: null };
  }

  return {
    complete: true,
    errors,
    fieldsLeft: 0,
    price: c.price,
    loan,
    costs: computeCosts(c.price, loan, optionsFrom(t, c, today)),
  };
}

/* ------------------------------------------------ total purchase cost */

export type PurchaseCostInput = CostInputBase & { margin: string; tenure: string; rate: string };
export type PurchaseCostField = CommonFields | "margin" | "tenure" | "rate";

export type PurchaseCostResult = {
  complete: boolean;
  errors: Errors<PurchaseCostField>;
  fieldsLeft: number;
  price: number;
  loanAmount: number;
  downPayment: number;
  monthly: number;
  months: number;
  costs: CostBreakdown | null;
  upfrontCash: number; // down payment + transaction costs
};

export const PURCHASE_DEFAULTS: PurchaseCostInput = {
  ...COST_DEFAULTS,
  margin: "90",
  tenure: "30",
  rate: "4.5",
};

export function evaluatePurchaseCost(t: PurchaseCostInput, today: string): PurchaseCostResult {
  const c = readCommon(t);
  const errors: Errors<PurchaseCostField> = { ...c.errors };

  const read = (field: "margin" | "tenure" | "rate", min: number, max: number): number => {
    const { kind, value } = readAmount(t[field]);
    if (kind === "blank") errors[field] = "required";
    else if (kind === "negative") errors[field] = "negative";
    else if (kind === "invalid") errors[field] = "invalid";
    else if (value < min || value > max) errors[field] = "range";
    else return value;
    return NaN;
  };

  const margin = read("margin", LIMITS.marginMin, LIMITS.marginMax);
  const tenure = read("tenure", LIMITS.tenureMin, LIMITS.tenureMax);
  const rate = read("rate", LIMITS.rateMin, LIMITS.rateMax);

  const fieldsLeft = Object.keys(errors).length;
  if (fieldsLeft > 0) {
    return {
      complete: false, errors, fieldsLeft, price: 0, loanAmount: 0, downPayment: 0,
      monthly: 0, months: 0, costs: null, upfrontCash: 0,
    };
  }

  const loan = calculateHousingLoan({ price: c.price, margin, tenure, rate });
  const costs = computeCosts(c.price, loan.loanAmount, optionsFrom(t, c, today));

  return {
    complete: true,
    errors,
    fieldsLeft: 0,
    price: c.price,
    loanAmount: loan.loanAmount,
    downPayment: loan.downPayment,
    monthly: loan.monthly,
    months: loan.months,
    costs,
    upfrontCash: round2(loan.downPayment + costs.total),
  };
}
