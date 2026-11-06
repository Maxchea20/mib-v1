/*
|--------------------------------------------------------------------------
| RENTAL YIELD (pure, unit-tested)
|--------------------------------------------------------------------------
|
|   annual gross income   = monthly rent x 12
|   annual expenses       = (monthly expenses x 12) + annual expenses
|   annual net income     = annual gross income - annual expenses
|   gross yield %         = annual gross income / purchase price x 100
|   net yield %           = annual net income   / purchase price x 100
|   monthly net income    = annual net income / 12
|
| Loan instalments are NOT an operating expense and are never part of the
| yield. The optional "cash flow after the loan" is a separate figure.
|
*/

import { LIMITS, calculateHousingLoan } from "./housingLoan";
import { readAmount, round2 } from "./input";

export const MONEY_MAX = 1_000_000_000;

export const MONTHLY_EXPENSES = ["maintenance", "sinking", "otherMonthly"] as const;
export const ANNUAL_EXPENSES = ["assessment", "quitRent", "insurance", "repairs", "otherAnnual"] as const;

export type RentalField =
  | "price"
  | "rent"
  | (typeof MONTHLY_EXPENSES)[number]
  | (typeof ANNUAL_EXPENSES)[number]
  | "margin"
  | "tenure"
  | "rate";

export type RentalInput = Record<RentalField, string> & { financing: boolean };

export type FieldError = "required" | "invalid" | "negative" | "zero" | "range";

export type RentalResult = {
  complete: boolean;
  errors: Partial<Record<RentalField, FieldError>>;
  fieldsLeft: number;
  price: number;
  annualGross: number;
  monthlyExpenses: number; // total monthly expenses
  annualExpensesTotal: number; // total of the annual list
  annualOperating: number; // monthly x 12 + annual
  annualNet: number; // can be negative
  monthlyNet: number;
  grossYield: number; // percent, 2 decimals
  netYield: number; // percent, 2 decimals, can be negative
  financing: null | {
    loanAmount: number;
    monthlyInstalment: number;
    monthlyCashFlow: number; // monthly net rent - instalment, can be negative
    annualCashFlow: number;
  };
};

export const EMPTY_INPUT: RentalInput = {
  price: "", rent: "",
  maintenance: "", sinking: "", otherMonthly: "",
  assessment: "", quitRent: "", insurance: "", repairs: "", otherAnnual: "",
  margin: "90", tenure: "30", rate: "4.5",
  financing: false,
};

export function calculateRental(input: RentalInput): RentalResult {
  const errors: RentalResult["errors"] = {};
  const num: Partial<Record<RentalField, number>> = {};

  // price: required, above zero. rent: must be entered (0 is allowed).
  for (const field of ["price", "rent"] as const) {
    const { kind, value } = readAmount(input[field]);
    if (kind === "blank") errors[field] = "required";
    else if (kind === "negative") errors[field] = "negative";
    else if (kind === "invalid") errors[field] = "invalid";
    else if (field === "price" && value === 0) errors[field] = "zero";
    else if (value > MONEY_MAX) errors[field] = "range";
    else num[field] = value;
  }

  // expenses: optional (blank = 0), never negative
  for (const field of [...MONTHLY_EXPENSES, ...ANNUAL_EXPENSES]) {
    const { kind, value } = readAmount(input[field]);
    if (kind === "blank") num[field] = 0;
    else if (kind === "negative") errors[field] = "negative";
    else if (kind === "invalid") errors[field] = "invalid";
    else if (value > MONEY_MAX) errors[field] = "range";
    else num[field] = value;
  }

  // financing inputs only matter when the optional section is switched on
  if (input.financing) {
    const limits = { margin: [LIMITS.marginMin, LIMITS.marginMax], tenure: [LIMITS.tenureMin, LIMITS.tenureMax], rate: [LIMITS.rateMin, LIMITS.rateMax] } as const;
    for (const field of ["margin", "tenure", "rate"] as const) {
      const { kind, value } = readAmount(input[field]);
      const [min, max] = limits[field];
      if (kind === "blank") errors[field] = "required";
      else if (kind === "negative") errors[field] = "negative";
      else if (kind === "invalid") errors[field] = "invalid";
      else if (value < min || value > max) errors[field] = "range";
      else num[field] = value;
    }
  }

  const fieldsLeft = Object.keys(errors).length;
  if (fieldsLeft > 0) {
    return {
      complete: false, errors, fieldsLeft, price: 0, annualGross: 0, monthlyExpenses: 0,
      annualExpensesTotal: 0, annualOperating: 0, annualNet: 0, monthlyNet: 0,
      grossYield: 0, netYield: 0, financing: null,
    };
  }

  const price = num.price!;
  const sum = (fields: readonly RentalField[]) => round2(fields.reduce((a, f) => a + (num[f] ?? 0), 0));

  const annualGross = round2(num.rent! * 12);
  const monthlyExpenses = sum(MONTHLY_EXPENSES);
  const annualExpensesTotal = sum(ANNUAL_EXPENSES);
  const annualOperating = round2(monthlyExpenses * 12 + annualExpensesTotal);
  const annualNet = round2(annualGross - annualOperating);
  const monthlyNet = round2(annualNet / 12);
  const grossYield = round2((annualGross / price) * 100);
  const netYield = round2((annualNet / price) * 100);

  let financing: RentalResult["financing"] = null;
  if (input.financing) {
    const loan = calculateHousingLoan({ price, margin: num.margin!, tenure: num.tenure!, rate: num.rate! });
    const monthlyCashFlow = round2(monthlyNet - loan.monthly);
    financing = {
      loanAmount: loan.loanAmount,
      monthlyInstalment: loan.monthly,
      monthlyCashFlow,
      annualCashFlow: round2(monthlyCashFlow * 12),
    };
  }

  return {
    complete: true, errors, fieldsLeft: 0, price, annualGross, monthlyExpenses,
    annualExpensesTotal, annualOperating, annualNet, monthlyNet, grossYield, netYield, financing,
  };
}
