/*
|--------------------------------------------------------------------------
| HOUSING LOAN CALCULATION (pure, no imports, unit-tested)
|--------------------------------------------------------------------------
|
| Standard monthly reducing-balance (amortisation) formula, NOT flat rate:
|
|     monthly = L * r / (1 - (1 + r)^-n)
|
|   L = loan amount, r = annual rate / 12, n = tenure in months.
|   With a 0% rate the formula divides by zero, so the instalment is L / n.
|
| The instalment is rounded to the nearest sen (that is what a bank
| charges), and total repayment = instalment x months, so the figures on
| screen agree with each other. At 0% the total is exactly the loan.
|
*/

export const LIMITS = {
  priceMax: 1_000_000_000,
  marginMin: 1,
  marginMax: 100,
  tenureMin: 1,
  tenureMax: 40,
  rateMin: 0,
  rateMax: 25,
} as const;

export const DEFAULTS = {
  price: 100_000,
  margin: 90,
  tenure: 30,
  rate: 4.5,
} as const;

export type LoanInput = {
  price: number;
  margin: number; // percent of the price that is financed
  tenure: number; // years
  rate: number; // percent per annum
};

export type LoanErrorKey =
  | "priceInvalid"
  | "priceTooHigh"
  | "marginInvalid"
  | "tenureInvalid"
  | "rateInvalid";

export type LoanResult = {
  ok: boolean;
  errors: Partial<Record<"price" | "margin" | "tenure" | "rate", LoanErrorKey>>;
  loanAmount: number;
  downPayment: number;
  months: number;
  monthly: number;
  totalRepayment: number;
  totalInterest: number;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const finite = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

export function validateLoan(input: LoanInput): LoanResult["errors"] {
  const errors: LoanResult["errors"] = {};

  if (!finite(input.price) || input.price <= 0) errors.price = "priceInvalid";
  else if (input.price > LIMITS.priceMax) errors.price = "priceTooHigh";

  if (
    !finite(input.margin) ||
    input.margin < LIMITS.marginMin ||
    input.margin > LIMITS.marginMax
  )
    errors.margin = "marginInvalid";

  if (
    !finite(input.tenure) ||
    input.tenure < LIMITS.tenureMin ||
    input.tenure > LIMITS.tenureMax
  )
    errors.tenure = "tenureInvalid";

  if (
    !finite(input.rate) ||
    input.rate < LIMITS.rateMin ||
    input.rate > LIMITS.rateMax
  )
    errors.rate = "rateInvalid";

  return errors;
}

export function monthlyInstalment(
  loan: number,
  annualRatePct: number,
  months: number
): number {
  if (loan <= 0 || months <= 0) return 0;

  const r = annualRatePct / 100 / 12;
  if (r === 0) return round2(loan / months); // zero interest

  return round2((loan * r) / (1 - Math.pow(1 + r, -months)));
}

export function calculateHousingLoan(input: LoanInput): LoanResult {
  const errors = validateLoan(input);

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors,
      loanAmount: 0,
      downPayment: 0,
      months: 0,
      monthly: 0,
      totalRepayment: 0,
      totalInterest: 0,
    };
  }

  const loanAmount = round2((input.price * input.margin) / 100);
  const downPayment = round2(input.price - loanAmount);
  const months = Math.round(input.tenure * 12);
  const monthly = monthlyInstalment(loanAmount, input.rate, months);

  // Zero interest: you repay exactly the loan (the instalment is only rounded
  // for display). Otherwise total = instalment x months, never below the loan.
  const totalRepayment =
    input.rate === 0
      ? loanAmount
      : Math.max(loanAmount, round2(monthly * months));
  const totalInterest = round2(totalRepayment - loanAmount);

  return {
    ok: true,
    errors,
    loanAmount,
    downPayment,
    months,
    monthly,
    totalRepayment,
    totalInterest,
  };
}

/** "RM 1,234.50" - Malaysian Ringgit, two decimals, thousands separators. */
export function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Reads what a visitor typed ("RM 500,000", "4.5", " 30 ") into a number.
 * Returns NaN for anything that is not a plain number, so it fails validation.
 */
export function parseNumber(text: string): number {
  const cleaned = text.replace(/RM/gi, "").replace(/[,\s]/g, "");
  if (cleaned === "" || !/^\d*\.?\d+$|^\d+\.$/.test(cleaned)) return NaN;
  return Number(cleaned);
}
