/*
|--------------------------------------------------------------------------
| RPGT (REAL PROPERTY GAINS TAX) CALCULATION (pure, unit-tested)
|--------------------------------------------------------------------------
|
| Real Property Gains Tax Act 1976, Schedule 5 rates (as supplied by the
| owner, last checked against the owner's figures 2026-11):
|
|                      Part I   Part II   Part III
|   within 3 years      30%      30%       30%
|   4th year            20%      20%       30%
|   5th year            15%      15%       30%
|   6th year onwards     0%      10%       10%
|
| (The owner's table lists "within 2 years" and "3rd year" separately; both
|  are 30% for every part, so they are one "within 3 years" band here.)
|
| HOLDING PERIOD is measured between the two SPA dates with anniversaries,
| never by subtracting calendar years. A disposal on or before the 3rd
| anniversary is "within 3 years"; after the 3rd and up to the 4th
| anniversary is the 4th year; up to the 5th anniversary is the 5th year;
| anything later is the 6th year onwards.
|
|   gain       = disposal price - acquisition price - allowable expenses
|   exemption  = individuals: the higher of RM10,000 or 10% of the gain
|                (never more than the gain). Companies and other bodies: none.
|                Private residence (once in a lifetime, Part I individuals,
|                only if the seller ticks it): the whole gain.
|   chargeable = gain - exemption   (never below 0)
|   RPGT       = chargeable x rate
|
| The retention sum a purchaser withholds under section 21B is a separate
| matter and is NOT calculated here.
|
*/

import { parseNumber } from "./housingLoan";

export const INDIVIDUAL_EXEMPTION_FLAT = 10_000;
export const INDIVIDUAL_EXEMPTION_PERCENT = 10;
export const MONEY_MAX = 1_000_000_000;
export const EARLIEST_YEAR = 1970;
export const LATEST_YEAR = 2100;

export type SellerCategory = "part1" | "part2" | "part3";
export type SellerKind = "individual" | "other";
export type RpgtBand = "within3" | "year4" | "year5" | "year6plus";

export const RATES: Record<SellerCategory, Record<RpgtBand, number>> = {
  part1: { within3: 30, year4: 20, year5: 15, year6plus: 0 },
  part2: { within3: 30, year4: 20, year5: 15, year6plus: 10 },
  part3: { within3: 30, year4: 30, year5: 30, year6plus: 10 },
};

export const BANDS: RpgtBand[] = ["within3", "year4", "year5", "year6plus"];

/* ------------------------------------------------------------------ dates */

export type YMD = { y: number; m: number; d: number }; // m = 1..12

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export const daysInMonth = (y: number, m: number) =>
  [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

/** Reads "YYYY-MM-DD" (what <input type="date"> gives). null if it is not a real date. */
export function parseDate(text: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export const compareDates = (a: YMD, b: YMD) =>
  a.y !== b.y ? a.y - b.y : a.m !== b.m ? a.m - b.m : a.d - b.d;

/** Same date n years later. 29 Feb in a non-leap year becomes 28 Feb. */
export function addYears(date: YMD, n: number): YMD {
  const y = date.y + n;
  return { y, m: date.m, d: Math.min(date.d, daysInMonth(y, date.m)) };
}

/** Same date n months later; the day is cut back to the end of a shorter month. */
export function addMonths(date: YMD, n: number): YMD {
  const index = date.y * 12 + (date.m - 1) + n;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return { y, m, d: Math.min(date.d, daysInMonth(y, m)) };
}

const utcDay = (d: YMD) => Date.UTC(d.y, d.m - 1, d.d) / 86_400_000;

export type HoldingPeriod = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  band: RpgtBand;
};

/** Holding period between two valid dates (disposal on or after acquisition). */
export function holdingPeriod(acquired: YMD, disposed: YMD): HoldingPeriod {
  // Whole years, then whole months, then the days left over.
  let years = 0;
  while (compareDates(addYears(acquired, years + 1), disposed) <= 0) years++;

  const afterYears = addYears(acquired, years);
  let months = 0;
  while (months < 11 && compareDates(addMonths(afterYears, months + 1), disposed) <= 0) months++;

  const afterMonths = addMonths(afterYears, months);
  const days = utcDay(disposed) - utcDay(afterMonths);

  let band: RpgtBand;
  if (compareDates(disposed, addYears(acquired, 3)) <= 0) band = "within3";
  else if (compareDates(disposed, addYears(acquired, 4)) <= 0) band = "year4";
  else if (compareDates(disposed, addYears(acquired, 5)) <= 0) band = "year5";
  else band = "year6plus";

  return { years, months, days, totalDays: utcDay(disposed) - utcDay(acquired), band };
}

/* ------------------------------------------------------------ calculation */

export const COST_FIELDS = ["costAcqLegal", "costDispLegal", "costStamp", "costReno", "costOther"] as const;
export type CostField = (typeof COST_FIELDS)[number];

export type RpgtField =
  | "category"
  | "sellerKind"
  | "acqPrice"
  | "dispPrice"
  | "acqDate"
  | "dispDate"
  | CostField;

export type RpgtInput = {
  category: SellerCategory | "";
  sellerKind: SellerKind | "";
  acqPrice: string;
  dispPrice: string;
  acqDate: string;
  dispDate: string;
  costAcqLegal: string;
  costDispLegal: string;
  costStamp: string;
  costReno: string;
  costOther: string;
  privateResidence: boolean;
};

export type FieldError =
  | "required"
  | "invalid"
  | "negative"
  | "zero"
  | "range"
  | "dateInvalid"
  | "dateEarly"
  | "dateOrder";

export type ExemptionKind = "individual" | "privateResidence" | "none";

export type RpgtResult = {
  complete: boolean;
  errors: Partial<Record<RpgtField, FieldError>>;
  fieldsLeft: number;
  holding: HoldingPeriod | null;
  band: RpgtBand | null;
  rate: number;
  acqPrice: number;
  dispPrice: number;
  totalCosts: number;
  adjustedGain: number; // can be negative (a loss)
  exemptionKind: ExemptionKind;
  exemption: number;
  chargeableGain: number;
  tax: number;
  privateResidenceApplied: boolean;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** The once-in-a-lifetime private residence exemption is for Part I individuals only. */
export function privateResidenceAllowed(category: SellerCategory | "", kind: SellerKind | ""): boolean {
  return category === "part1" && kind === "individual";
}

/** The RM10,000 / 10% exemption is for individuals only. */
export function isIndividual(kind: SellerKind | ""): boolean {
  return kind === "individual";
}

/** The exemption for a given gain (before any private residence election). */
export function individualExemption(gain: number): number {
  if (gain <= 0) return 0;
  const tenPercent = (gain * INDIVIDUAL_EXEMPTION_PERCENT) / 100;
  return round2(Math.min(gain, Math.max(INDIVIDUAL_EXEMPTION_FLAT, tenPercent)));
}

type Kind = "blank" | "negative" | "invalid" | "ok";

function readMoney(text: string): { kind: Kind; value: number } {
  const trimmed = text.trim();
  if (trimmed === "") return { kind: "blank", value: NaN };
  const stripped = trimmed.replace(/RM/gi, "").replace(/[,\s]/g, "");
  if (/^-\d*\.?\d+$/.test(stripped)) return { kind: "negative", value: NaN };
  const value = parseNumber(text);
  return Number.isFinite(value) ? { kind: "ok", value } : { kind: "invalid", value: NaN };
}

const EMPTY_RESULT = (errors: RpgtResult["errors"]): RpgtResult => ({
  complete: false,
  errors,
  fieldsLeft: Object.keys(errors).length,
  holding: null,
  band: null,
  rate: 0,
  acqPrice: 0,
  dispPrice: 0,
  totalCosts: 0,
  adjustedGain: 0,
  exemptionKind: "none",
  exemption: 0,
  chargeableGain: 0,
  tax: 0,
  privateResidenceApplied: false,
});

export function calculateRpgt(input: RpgtInput): RpgtResult {
  const errors: RpgtResult["errors"] = {};

  // Seller
  if (input.category === "") errors.category = "required";
  if (input.category !== "part2" && input.sellerKind === "") errors.sellerKind = "required";

  // Prices: required, above zero
  const prices: Record<"acqPrice" | "dispPrice", number> = { acqPrice: NaN, dispPrice: NaN };
  for (const field of ["acqPrice", "dispPrice"] as const) {
    const { kind, value } = readMoney(input[field]);
    if (kind === "blank") errors[field] = "required";
    else if (kind === "negative") errors[field] = "negative";
    else if (kind === "invalid") errors[field] = "invalid";
    else if (value === 0) errors[field] = "zero";
    else if (value > MONEY_MAX) errors[field] = "range";
    else prices[field] = value;
  }

  // Costs: optional (blank = 0), never negative
  const costs: number[] = [];
  for (const field of COST_FIELDS) {
    const { kind, value } = readMoney(input[field]);
    if (kind === "blank") costs.push(0);
    else if (kind === "negative") errors[field] = "negative";
    else if (kind === "invalid") errors[field] = "invalid";
    else if (value > MONEY_MAX) errors[field] = "range";
    else costs.push(value);
  }

  // Dates
  const dates: Partial<Record<"acqDate" | "dispDate", YMD>> = {};
  for (const field of ["acqDate", "dispDate"] as const) {
    const text = input[field].trim();
    if (text === "") {
      errors[field] = "required";
      continue;
    }
    const date = parseDate(text);
    if (!date) errors[field] = "dateInvalid";
    else if (date.y < EARLIEST_YEAR) errors[field] = "dateEarly";
    else if (date.y > LATEST_YEAR) errors[field] = "dateInvalid";
    else dates[field] = date;
  }
  if (dates.acqDate && dates.dispDate && compareDates(dates.dispDate, dates.acqDate) < 0) {
    errors.dispDate = "dateOrder";
  }

  if (Object.keys(errors).length > 0) return EMPTY_RESULT(errors);

  const category = input.category as SellerCategory;
  const kind: SellerKind = category === "part2" ? "other" : (input.sellerKind as SellerKind);
  const holding = holdingPeriod(dates.acqDate!, dates.dispDate!);
  const rate = RATES[category][holding.band];

  const totalCosts = round2(costs.reduce((a, b) => a + b, 0));
  const adjustedGain = round2(prices.dispPrice - prices.acqPrice - totalCosts);

  const privateResidenceApplied =
    input.privateResidence && privateResidenceAllowed(category, kind);

  let exemptionKind: ExemptionKind = "none";
  let exemption = 0;

  if (adjustedGain > 0) {
    if (privateResidenceApplied) {
      exemptionKind = "privateResidence";
      exemption = adjustedGain;
    } else if (isIndividual(kind)) {
      exemptionKind = "individual";
      exemption = individualExemption(adjustedGain);
    }
  } else if (privateResidenceApplied) {
    exemptionKind = "privateResidence";
  } else if (isIndividual(kind)) {
    exemptionKind = "individual";
  }

  const chargeableGain = round2(Math.max(0, adjustedGain - exemption));
  const tax = round2((chargeableGain * rate) / 100);

  return {
    complete: true,
    errors,
    fieldsLeft: 0,
    holding,
    band: holding.band,
    rate,
    acqPrice: prices.acqPrice,
    dispPrice: prices.dispPrice,
    totalCosts,
    adjustedGain,
    exemptionKind,
    exemption,
    chargeableGain,
    tax,
    privateResidenceApplied,
  };
}

export const EMPTY_INPUT: RpgtInput = {
  category: "",
  sellerKind: "",
  acqPrice: "",
  dispPrice: "",
  acqDate: "",
  dispDate: "",
  costAcqLegal: "",
  costDispLegal: "",
  costStamp: "",
  costReno: "",
  costOther: "",
  privateResidence: false,
};
