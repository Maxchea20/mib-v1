/*
|--------------------------------------------------------------------------
| DSR (DEBT SERVICE RATIO) CALCULATION (pure, unit-tested)
|--------------------------------------------------------------------------
|
|   new loan        = price x margin
|   new instalment  = reducing-balance formula (same as the housing loan calculator)
|   total           = existing monthly commitments + new instalment
|   DSR %           = total / net monthly income x 100
|
| Below 75% is GREEN, 75% or above is RED. The comparison uses the DSR rounded
| to two decimals, i.e. the number the visitor sees, so a screen that says
| "75.00%" can never be green.
|
| Nothing is calculated until every required field holds a valid value.
| Commitment fields must be filled in: RM 0 has to be typed (or tapped).
|
*/

import { LIMITS, calculateHousingLoan, formatRM, parseNumber } from "./housingLoan";

export { formatRM };

export const DSR_LIMIT = 75;
export const MONEY_MAX = 100_000_000;

export const COMMITMENT_FIELDS = [
  "car",
  "personal",
  "housing",
  "ptptn",
  "card",
  "expenses",
] as const;

export type CommitmentField = (typeof COMMITMENT_FIELDS)[number];

export type DsrField =
  | "price"
  | "margin"
  | "tenure"
  | "rate"
  | "income"
  | CommitmentField;

export const ALL_FIELDS: DsrField[] = [
  "price",
  "margin",
  "tenure",
  "rate",
  "income",
  ...COMMITMENT_FIELDS,
];

export type FieldError = "required" | "invalid" | "negative" | "zero" | "range";

export type DsrInput = Record<DsrField, string>;

export type DsrResult = {
  complete: boolean;
  errors: Partial<Record<DsrField, FieldError>>;
  fieldsLeft: number; // fields that are blank or invalid
  income: number;
  existing: number;
  loanAmount: number;
  instalment: number;
  total: number;
  dsr: number; // percent, rounded to 2 decimals
  status: "green" | "red" | null;
  limitAmount: number; // 75% of income
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function dsrStatus(dsrRounded: number): "green" | "red" {
  return dsrRounded >= DSR_LIMIT ? "red" : "green";
}

type Kind = "blank" | "negative" | "invalid" | "ok";

function read(text: string): { kind: Kind; value: number } {
  const trimmed = text.trim();
  if (trimmed === "") return { kind: "blank", value: NaN };

  const stripped = trimmed.replace(/RM/gi, "").replace(/[,\s]/g, "");
  if (stripped.startsWith("-") && /^-\d*\.?\d+$/.test(stripped)) {
    return { kind: "negative", value: NaN };
  }

  const value = parseNumber(text);
  return Number.isFinite(value) ? { kind: "ok", value } : { kind: "invalid", value: NaN };
}

function checkField(field: DsrField, text: string): { error?: FieldError; value: number } {
  const { kind, value } = read(text);
  if (kind === "blank") return { error: "required", value: NaN };
  if (kind === "negative") return { error: "negative", value: NaN };
  if (kind === "invalid") return { error: "invalid", value: NaN };

  switch (field) {
    case "price":
      if (value === 0) return { error: "zero", value };
      if (value > LIMITS.priceMax) return { error: "range", value };
      break;
    case "income":
      if (value === 0) return { error: "zero", value };
      if (value > MONEY_MAX) return { error: "range", value };
      break;
    case "margin":
      if (value < LIMITS.marginMin || value > LIMITS.marginMax) return { error: "range", value };
      break;
    case "tenure":
      if (value < LIMITS.tenureMin || value > LIMITS.tenureMax) return { error: "range", value };
      break;
    case "rate":
      if (value < LIMITS.rateMin || value > LIMITS.rateMax) return { error: "range", value };
      break;
    default: // commitments: 0 is allowed, it just has to be entered
      if (value > MONEY_MAX) return { error: "range", value };
  }

  return { value };
}

export function calculateDsr(input: DsrInput): DsrResult {
  const errors: DsrResult["errors"] = {};
  const values = {} as Record<DsrField, number>;

  for (const field of ALL_FIELDS) {
    const { error, value } = checkField(field, input[field]);
    if (error) errors[field] = error;
    values[field] = value;
  }

  const fieldsLeft = Object.keys(errors).length;

  if (fieldsLeft > 0) {
    return {
      complete: false,
      errors,
      fieldsLeft,
      income: 0,
      existing: 0,
      loanAmount: 0,
      instalment: 0,
      total: 0,
      dsr: 0,
      status: null,
      limitAmount: 0,
    };
  }

  const loan = calculateHousingLoan({
    price: values.price,
    margin: values.margin,
    tenure: values.tenure,
    rate: values.rate,
  });

  const existing = round2(
    COMMITMENT_FIELDS.reduce((sum, f) => sum + values[f], 0)
  );
  const total = round2(existing + loan.monthly);
  const dsr = round2((total / values.income) * 100);

  return {
    complete: true,
    errors,
    fieldsLeft: 0,
    income: values.income,
    existing,
    loanAmount: loan.loanAmount,
    instalment: loan.monthly,
    total,
    dsr,
    status: dsrStatus(dsr),
    limitAmount: round2((values.income * DSR_LIMIT) / 100),
  };
}

export const EMPTY_INPUT: DsrInput = {
  price: "",
  margin: "90",
  tenure: "30",
  rate: "4.5",
  income: "",
  car: "",
  personal: "",
  housing: "",
  ptptn: "",
  card: "",
  expenses: "",
};
