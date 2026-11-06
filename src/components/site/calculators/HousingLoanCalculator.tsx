"use client";

import { useState } from "react";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import {
  DEFAULTS,
  LIMITS,
  calculateHousingLoan,
  formatRM,
  parseNumber,
  type LoanErrorKey,
} from "@/site/calculators/housingLoan";
import { BRAND } from "@/site/brand";
import { fill, type Lang, t } from "@/site/i18n";

/*
| Housing loan calculator. Everything is calculated in the browser from the
| four inputs (nothing is sent anywhere), and recalculated on every keystroke.
| Maths lives in src/site/calculators/housingLoan.ts (unit-tested).
*/

const groupDigits = (n: number) => n.toLocaleString("en-MY", { maximumFractionDigits: 2 });

const MARGIN_PRESETS = [70, 80, 90];
const TENURE_PRESETS = [25, 30, 35];

export default function HousingLoanCalculator({ lang }: { lang: Lang }) {
  const text = t(lang);

  // What the visitor typed. Kept as text so partly typed values ("4.") work.
  const [priceText, setPriceText] = useState(groupDigits(DEFAULTS.price));
  const [marginText, setMarginText] = useState(String(DEFAULTS.margin));
  const [tenureText, setTenureText] = useState(String(DEFAULTS.tenure));
  const [rateText, setRateText] = useState(String(DEFAULTS.rate));

  const input = {
    price: parseNumber(priceText),
    margin: parseNumber(marginText),
    tenure: parseNumber(tenureText),
    rate: parseNumber(rateText),
  };

  // Recalculated on every render, so on every change.
  const result = calculateHousingLoan(input);

  const errorText: Record<LoanErrorKey, string> = {
    priceInvalid: text.hlErrPrice,
    priceTooHigh: text.hlErrPriceHigh,
    marginInvalid: text.hlErrMargin,
    tenureInvalid: text.hlErrTenure,
    rateInvalid: text.hlErrRate,
  };

  const interestShare =
    result.ok && result.totalRepayment > 0
      ? Math.round((result.totalInterest / result.totalRepayment) * 100)
      : 0;

  const dash = "—";
  const show = (value: number) => (result.ok ? formatRM(value) : dash);

  const waMessage = result.ok
    ? fill(text.hlWhatsappMsg, {
        price: formatRM(input.price),
        margin: input.margin,
        years: input.tenure,
        rate: input.rate,
        monthly: formatRM(result.monthly),
      })
    : "";
  const waHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  function reset() {
    setPriceText(groupDigits(DEFAULTS.price));
    setMarginText(String(DEFAULTS.margin));
    setTenureText(String(DEFAULTS.tenure));
    setRateText(String(DEFAULTS.rate));
  }

  function tidyPrice() {
    const n = parseNumber(priceText);
    if (Number.isFinite(n)) setPriceText(groupDigits(n));
  }

  const field =
    "h-12 w-full rounded-[10px] border bg-[var(--mp-paper)] px-3 text-base text-[var(--mp-ink)] outline-none focus:border-[var(--mp-accent)]";
  const border = (bad: boolean) =>
    bad ? "border-[#E5484D]" : "border-[var(--mp-line-strong)]";
  const chip = (active: boolean) =>
    `inline-flex min-h-10 min-w-12 items-center justify-center rounded-full border px-4 text-sm font-bold ${
      active
        ? "border-[var(--mp-accent)] bg-[var(--mp-accent)] text-[var(--mp-on-accent)]"
        : "border-[var(--mp-line)] bg-[var(--mp-card)] text-[var(--mp-ink)] hover:border-[var(--mp-accent)]"
    }`;

  const err = (id: string, k?: LoanErrorKey) =>
    k ? (
      <p id={id} role="alert" className="mt-1.5 text-sm font-semibold text-[#FF8A8E]">
        {errorText[k]}
      </p>
    ) : null;

  return (
    <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_440px] lg:pb-0">
      {/* ---------------------------------------------------------------- INPUTS */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7"
        noValidate
      >
        {/* Property price */}
        <div>
          <label htmlFor="hl-price" className="mb-2 block text-sm font-bold">
            {text.hlPrice}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--mp-muted)]">
              RM
            </span>
            <input
              id="hl-price"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              onBlur={tidyPrice}
              aria-invalid={Boolean(result.errors.price)}
              aria-describedby={result.errors.price ? "hl-price-err" : undefined}
              className={`${field} ${border(Boolean(result.errors.price))} pl-11 text-lg font-bold`}
            />
          </div>
          {err("hl-price-err", result.errors.price)}
        </div>

        {/* Loan margin */}
        <div>
          <label htmlFor="hl-margin" className="mb-2 block text-sm font-bold">
            {text.hlMargin}
          </label>
          <div className="flex items-center gap-3">
            <input
              id="hl-margin"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={marginText}
              onChange={(e) => setMarginText(e.target.value)}
              aria-invalid={Boolean(result.errors.margin)}
              aria-describedby={`hl-margin-hint${result.errors.margin ? " hl-margin-err" : ""}`}
              className={`${field} ${border(Boolean(result.errors.margin))} max-w-[120px]`}
            />
            <input
              type="range"
              min={LIMITS.marginMin}
              max={LIMITS.marginMax}
              step={1}
              value={Number.isFinite(input.margin) ? Math.min(Math.max(input.margin, LIMITS.marginMin), LIMITS.marginMax) : DEFAULTS.margin}
              onChange={(e) => setMarginText(e.target.value)}
              aria-label={text.hlMargin}
              className="h-2 flex-1 cursor-pointer accent-[var(--mp-accent)]"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {MARGIN_PRESETS.map((m) => (
              <button key={m} type="button" onClick={() => setMarginText(String(m))} className={chip(input.margin === m)}>
                {m}%
              </button>
            ))}
          </div>
          <p id="hl-margin-hint" className="mt-2 text-sm text-[var(--mp-muted)]">{text.hlMarginHint}</p>
          {err("hl-margin-err", result.errors.margin)}
        </div>

        {/* Tenure */}
        <div>
          <label htmlFor="hl-tenure" className="mb-2 block text-sm font-bold">
            {text.hlTenure}
          </label>
          <div className="flex items-center gap-3">
            <input
              id="hl-tenure"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={tenureText}
              onChange={(e) => setTenureText(e.target.value)}
              aria-invalid={Boolean(result.errors.tenure)}
              aria-describedby={`hl-tenure-hint${result.errors.tenure ? " hl-tenure-err" : ""}`}
              className={`${field} ${border(Boolean(result.errors.tenure))} max-w-[120px]`}
            />
            <input
              type="range"
              min={LIMITS.tenureMin}
              max={LIMITS.tenureMax}
              step={1}
              value={Number.isFinite(input.tenure) ? Math.min(Math.max(input.tenure, LIMITS.tenureMin), LIMITS.tenureMax) : DEFAULTS.tenure}
              onChange={(e) => setTenureText(e.target.value)}
              aria-label={text.hlTenure}
              className="h-2 flex-1 cursor-pointer accent-[var(--mp-accent)]"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TENURE_PRESETS.map((y) => (
              <button key={y} type="button" onClick={() => setTenureText(String(y))} className={chip(input.tenure === y)}>
                {y} {text.hlYears}
              </button>
            ))}
          </div>
          <p id="hl-tenure-hint" className="mt-2 text-sm text-[var(--mp-muted)]">{text.hlTenureHint}</p>
          {err("hl-tenure-err", result.errors.tenure)}
        </div>

        {/* Interest rate */}
        <div>
          <label htmlFor="hl-rate" className="mb-2 block text-sm font-bold">
            {text.hlRate}
          </label>
          <input
            id="hl-rate"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={rateText}
            onChange={(e) => setRateText(e.target.value)}
            aria-invalid={Boolean(result.errors.rate)}
            aria-describedby={`hl-rate-hint${result.errors.rate ? " hl-rate-err" : ""}`}
            className={`${field} ${border(Boolean(result.errors.rate))} max-w-[160px]`}
          />
          <p id="hl-rate-hint" className="mt-2 text-sm text-[var(--mp-muted)]">{text.hlRateHint}</p>
          {err("hl-rate-err", result.errors.rate)}
        </div>

        <button
          type="button"
          onClick={reset}
          className="self-start text-sm font-bold text-[var(--mp-accent)] underline"
        >
          {text.hlReset}
        </button>
      </form>

      {/* --------------------------------------------------------------- RESULTS */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <section
          id="hl-results-card"
          aria-labelledby="hl-results"
          aria-live="polite"
          className="flex flex-col gap-5 rounded-2xl border border-[var(--mp-accent)] bg-[var(--mp-card)] p-5 sm:p-7"
        >
          <h2 id="hl-results" className="sr-only">{text.hlResults}</h2>

          <div>
            <p className="text-sm text-[var(--mp-muted)]">{text.hlMonthly}</p>
            <p data-testid="monthly" className="mp-display mt-1 break-words text-4xl font-bold text-[var(--mp-accent)] sm:text-5xl">
              {show(result.monthly)}
            </p>
            {result.ok && (
              <p className="mt-1 text-sm text-[var(--mp-muted)]">
                {fill(text.hlMonthsLabel, { n: result.months })}
              </p>
            )}
          </div>

          {!result.ok && (
            <p className="rounded-[10px] border border-[#E5484D] bg-[#2A1315] p-3 text-sm font-semibold text-[#FF8A8E]">
              {text.hlInvalid}
            </p>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[var(--mp-line)] pt-5">
            <div>
              <dt className="text-[13px] text-[var(--mp-muted)]">{text.hlLoanAmount}</dt>
              <dd data-testid="loan" className="mt-1 break-words text-lg font-extrabold">{show(result.loanAmount)}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[var(--mp-muted)]">{text.hlDownPayment}</dt>
              <dd data-testid="down" className="mt-1 break-words text-lg font-extrabold">{show(result.downPayment)}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[var(--mp-muted)]">{text.hlTotalInterest}</dt>
              <dd data-testid="interest" className="mt-1 break-words text-lg font-extrabold">{show(result.totalInterest)}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-[var(--mp-muted)]">{text.hlTotalRepayment}</dt>
              <dd data-testid="total" className="mt-1 break-words text-lg font-extrabold">{show(result.totalRepayment)}</dd>
            </div>
          </dl>

          {result.ok && result.totalRepayment > 0 && (
            <div className="border-t border-[var(--mp-line)] pt-5">
              <p className="mb-2 text-sm font-bold">{text.hlBreakdown}</p>
              <div
                className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--mp-line)]"
                role="img"
                aria-label={`${text.hlPrincipal} ${100 - interestShare}%, ${text.hlInterest} ${interestShare}%`}
              >
                <div className="h-full bg-[var(--mp-accent)]" style={{ width: `${100 - interestShare}%` }} />
                <div className="h-full bg-[#F4EFE4]" style={{ width: `${interestShare}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-[13px] text-[var(--mp-muted)]">
                <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-[var(--mp-accent)]" />{text.hlPrincipal} {100 - interestShare}%</span>
                <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-[#F4EFE4]" />{text.hlInterest} {interestShare}%</span>
              </div>
            </div>
          )}

          <a
            href={waHref}
            className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]"
          >
            <WhatsAppIcon size={22} />
            {text.hlWhatsapp}
          </a>
        </section>

        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">
          {text.hlDisclaimer}
        </p>
      </div>

      {/* Phone only: keeps the answer in view while the inputs are being changed. */}
      <a
        href="#hl-results-card"
        data-testid="mobile-bar"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-[var(--mp-accent)] bg-[var(--mp-paper)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <span className="text-xs text-[var(--mp-muted)]">{text.hlMonthly}</span>
        <span className="mp-display text-xl font-bold text-[var(--mp-accent)]">{show(result.monthly)}</span>
      </a>
    </div>
  );
}
