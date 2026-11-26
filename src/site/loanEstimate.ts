import { calculateHousingLoan } from "./calculators/housingLoan";

/*
|--------------------------------------------------------------------------
| LOAN ESTIMATE FOR A LISTING (pure, unit-tested)
|--------------------------------------------------------------------------
|
| One place for the numbers shown on the public listing page AND on the
| video's financing card, so they always agree. The percentages are examples
| of what banks commonly give; the real offer depends on the bank and the
| buyer. The rate is the HIGHEST rate assumed, so the instalment shown is on
| the cautious side. Only for-sale listings with a price get an estimate.
|
*/

export type LoanLang = "en" | "ms" | "zh";

/** Share of the price financed, and the loan period, for each kind of property. Change them here only. */
export const LOAN_ASSUMPTIONS: Record<string, { margin: number; years: number }> = {
  Residential: { margin: 90, years: 35 },
  Commercial: { margin: 80, years: 30 },
  Industrial: { margin: 80, years: 30 },
  Land: { margin: 50, years: 20 },
};

/** The highest interest rate assumed, per year. */
export const LOAN_RATE = 4.5;

export type LoanEstimate = {
  price: number;
  margin: number;
  years: number;
  rate: number;
  downPayment: number;
  loanAmount: number;
  monthly: number;
};

type Input = { category?: string | null; purpose?: string | null; price?: number | string | null };

/** The estimate for a listing, or null when it does not apply (for rent, no price, unknown category). */
export function loanEstimate(l: Input): LoanEstimate | null {
  if (l.purpose === "For Rent") return null;
  const a = LOAN_ASSUMPTIONS[l.category ?? ""];
  const price = Number(l.price);
  if (!a || l.price === null || l.price === undefined || l.price === "" || !Number.isFinite(price) || price <= 0) return null;
  const r = calculateHousingLoan({ price, margin: a.margin, tenure: a.years, rate: LOAN_RATE });
  if (!r.ok) return null;
  return {
    price,
    margin: a.margin,
    years: a.years,
    rate: LOAN_RATE,
    downPayment: Math.round(r.downPayment),
    loanAmount: Math.round(r.loanAmount),
    monthly: Math.round(r.monthly),
  };
}

export const rm = (n: number) => `RM ${n.toLocaleString("en-MY")}`;

export type LoanCopy = {
  heading: string;
  downPayment: string;
  loanAmount: string;
  monthly: string;
  perMonth: string;
  note: string;
};

/** Words for the listing page and the video card, in each language. The note always says it is only an estimate. */
export function loanCopy(e: LoanEstimate, lang: LoanLang): LoanCopy {
  const pct = `${e.margin}%`;
  if (lang === "zh")
    return {
      heading: "贷款估算",
      downPayment: `首期（${100 - e.margin}%）`,
      loanAmount: `贷款额（${pct}）`,
      monthly: "每月还款",
      perMonth: "／月",
      note: `仅供参考。以${pct}贷款、年利率${e.rate}%（最高）、${e.years}年计算，实际以银行批准为准。`,
    };
  if (lang === "ms")
    return {
      heading: "Anggaran pembiayaan",
      downPayment: `Bayaran muka (${100 - e.margin}%)`,
      loanAmount: `Jumlah pinjaman (${pct})`,
      monthly: "Ansuran bulanan",
      perMonth: "/ bulan",
      note: `Sebagai panduan sahaja. Berdasarkan pembiayaan ${pct}, kadar ${e.rate}% setahun (kadar tertinggi) selama ${e.years} tahun. Tertakluk kepada kelulusan bank.`,
    };
  return {
    heading: "Estimated financing",
    downPayment: `Down payment (${100 - e.margin}%)`,
    loanAmount: `Loan amount (${pct})`,
    monthly: "Monthly instalment",
    perMonth: "/ month",
    note: `Indicative only. Based on ${pct} financing, ${e.rate}% a year (highest rate assumed) over ${e.years} years. Subject to bank approval.`,
  };
}
