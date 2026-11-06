"use client";

import { useState } from "react";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import {
  COMMITMENT_FIELDS,
  DSR_LIMIT,
  EMPTY_INPUT,
  calculateDsr,
  formatRM,
  type DsrField,
  type DsrInput,
  type FieldError,
} from "@/site/calculators/dsr";
import { parseNumber } from "@/site/calculators/housingLoan";
import { BRAND } from "@/site/brand";
import { fieldsLeftText, fill, t, type Lang } from "@/site/i18n";

/*
| DSR calculator. Calculated in the browser (nothing is sent anywhere) and
| recalculated on every keystroke. Nothing is shown until every required
| field is valid. Maths lives in src/site/calculators/dsr.ts (unit-tested).
*/

const GREEN = "#3DD68C";
const RED = "#FF6B6F";

const groupDigits = (n: number) => n.toLocaleString("en-MY", { maximumFractionDigits: 2 });

export default function DsrCalculator({ lang }: { lang: Lang }) {
  const text = t(lang);

  const [values, setValues] = useState<DsrInput>(EMPTY_INPUT);
  // A blank field only shows its "required" message after the visitor has been in it.
  const [touched, setTouched] = useState<Partial<Record<DsrField, boolean>>>({});

  const result = calculateDsr(values);

  const set = (field: DsrField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const touch = (field: DsrField) => setTouched((t) => ({ ...t, [field]: true }));

  // Tidy "500000" into "500,000" when leaving a money field.
  const tidy = (field: DsrField) => {
    touch(field);
    const n = parseNumber(values[field]);
    if (Number.isFinite(n)) setValues((v) => ({ ...v, [field]: groupDigits(n) }));
  };

  const errorMessage = (error: FieldError, field: DsrField): string => {
    if (error === "required") return text.dsrErrRequired;
    if (error === "invalid") return text.dsrErrInvalid;
    if (error === "negative") return text.dsrErrNegative;
    if (error === "zero") return text.dsrErrZero;
    // range
    if (field === "margin") return text.hlErrMargin;
    if (field === "tenure") return text.hlErrTenure;
    if (field === "rate") return text.hlErrRate;
    return text.dsrErrTooHigh;
  };

  // Blank fields stay quiet until visited; anything typed wrongly is flagged at once.
  const visibleError = (field: DsrField): FieldError | undefined => {
    const e = result.errors[field];
    if (!e) return undefined;
    if (e === "required" && !touched[field]) return undefined;
    return e;
  };

  const inputClass = (field: DsrField) =>
    `h-12 w-full rounded-[10px] border bg-[var(--mp-paper)] px-3 text-base text-[var(--mp-ink)] outline-none focus:border-[var(--mp-accent)] ${
      visibleError(field) ? "border-[#E5484D]" : "border-[var(--mp-line-strong)]"
    }`;

  const describedBy = (field: DsrField, hint?: string) =>
    [hint, visibleError(field) ? `dsr-${field}-err` : ""].filter(Boolean).join(" ") || undefined;

  const err = (field: DsrField) => {
    const e = visibleError(field);
    return e ? (
      <p id={`dsr-${field}-err`} role="alert" className="mt-1.5 text-sm font-semibold text-[#FF8A8E]">
        {errorMessage(e, field)}
      </p>
    ) : null;
  };

  const moneyField = (
    field: DsrField,
    label: string,
    options: { hint?: string; zeroChip?: boolean } = {}
  ) => (
    <div key={field}>
      <label htmlFor={`dsr-${field}`} className="mb-2 block text-sm font-bold">
        {label} <span aria-hidden="true" className="text-[var(--mp-accent)]">*</span>
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--mp-muted)]">
            RM
          </span>
          <input
            id={`dsr-${field}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            required
            aria-required="true"
            placeholder={text.dsrPlaceholderAmount}
            value={values[field]}
            onChange={(e) => set(field, e.target.value)}
            onBlur={() => tidy(field)}
            aria-invalid={Boolean(visibleError(field))}
            aria-describedby={describedBy(field, options.hint ? `dsr-${field}-hint` : undefined)}
            className={`${inputClass(field)} pl-11`}
          />
        </div>
        {options.zeroChip && (
          <button
            type="button"
            onClick={() => set(field, "0")}
            className="inline-flex min-h-12 min-w-[64px] items-center justify-center rounded-[10px] border border-[var(--mp-line)] bg-[var(--mp-card)] px-3 text-sm font-bold hover:border-[var(--mp-accent)]"
          >
            {text.dsrZeroChip}
          </button>
        )}
      </div>
      {options.hint && (
        <p id={`dsr-${field}-hint`} className="mt-2 text-sm text-[var(--mp-muted)]">{options.hint}</p>
      )}
      {err(field)}
    </div>
  );

  const smallField = (field: DsrField, label: string, hint: string, width: string) => (
    <div key={field}>
      <label htmlFor={`dsr-${field}`} className="mb-2 block text-sm font-bold">{label}</label>
      <input
        id={`dsr-${field}`}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={values[field]}
        onChange={(e) => set(field, e.target.value)}
        onBlur={() => touch(field)}
        aria-invalid={Boolean(visibleError(field))}
        aria-describedby={describedBy(field, `dsr-${field}-hint`)}
        className={`${inputClass(field)} ${width}`}
      />
      <p id={`dsr-${field}-hint`} className="mt-2 text-sm text-[var(--mp-muted)]">{hint}</p>
      {err(field)}
    </div>
  );

  const commitmentLabels: Record<(typeof COMMITMENT_FIELDS)[number], string> = {
    car: text.dsrCar,
    personal: text.dsrPersonal,
    housing: text.dsrHousing,
    ptptn: text.dsrPtptn,
    card: text.dsrCard,
    expenses: text.dsrExpenses,
  };

  const color = result.status === "red" ? RED : GREEN;
  const dsrText = `${result.dsr.toFixed(2)}%`;
  const barWidth = Math.min(result.dsr, 100);

  const waMessage = result.complete
    ? fill(text.dsrWhatsappMsg, {
        income: formatRM(result.income),
        existing: formatRM(result.existing),
        instalment: formatRM(result.instalment),
        total: formatRM(result.total),
        dsr: result.dsr.toFixed(2),
      })
    : "";
  const waHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  const row = (testId: string, label: string, value: number) => (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-[var(--mp-muted)]">{label}</dt>
      <dd data-testid={testId} className="text-right text-base font-extrabold">
        {result.complete ? formatRM(value) : "—"}
      </dd>
    </div>
  );

  return (
    <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_440px] lg:pb-0">
      {/* ---------------------------------------------------------------- INPUTS */}
      <form
        onSubmit={(e) => e.preventDefault()}
        noValidate
        className="flex flex-col gap-8 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7"
      >
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{text.dsrSecProperty}</legend>
          {moneyField("price", text.hlPrice, { hint: text.dsrPriceHint })}
          <div className="grid gap-5 sm:grid-cols-3">
            {smallField("margin", text.hlMargin, text.hlMarginHint, "")}
            {smallField("tenure", text.hlTenure, text.hlTenureHint, "")}
            {smallField("rate", text.hlRate, text.hlRateHint, "")}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{text.dsrSecIncome}</legend>
          {moneyField("income", text.dsrIncome, { hint: text.dsrIncomeHint })}
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{text.dsrSecCommit}</legend>
          <p className="-mt-2 text-sm text-[var(--mp-muted)]">{text.dsrCommitNote}</p>
          {COMMITMENT_FIELDS.map((f) => moneyField(f, commitmentLabels[f], { zeroChip: true }))}
        </fieldset>
      </form>

      {/* --------------------------------------------------------------- RESULTS */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <section
          id="dsr-results-card"
          aria-labelledby="dsr-results"
          aria-live="polite"
          className="flex flex-col gap-5 rounded-2xl border bg-[var(--mp-card)] p-5 sm:p-7"
          style={{ borderColor: result.complete ? color : "var(--mp-accent)" }}
        >
          <h2 id="dsr-results" className="sr-only">{text.dsrResult}</h2>

          {!result.complete ? (
            <div className="flex flex-col gap-2">
              <p className="mp-display text-2xl font-bold">{text.dsrPending}</p>
              <p data-testid="progress" className="text-[15px] text-[var(--mp-muted)]">
                {fieldsLeftText(lang, result.fieldsLeft)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--mp-muted)]">{text.dsrDsr}</p>
              <p data-testid="dsr" className="mp-display text-5xl font-bold" style={{ color }}>
                {dsrText}
              </p>
              <p
                data-testid="status"
                data-status={result.status ?? ""}
                className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-extrabold"
                style={{ color, borderColor: color }}
              >
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                {result.status === "red" ? text.dsrRedTag : text.dsrGreenTag}
                <span className="font-semibold">{result.status === "red" ? text.dsrRed : text.dsrGreen}</span>
              </p>

              <div className="mt-1">
                <div
                  className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--mp-line)]"
                  role="img"
                  aria-label={`${text.dsrDsr} ${dsrText}`}
                >
                  <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: color }} />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-[#F4EFE4]"
                    style={{ left: `${DSR_LIMIT}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="relative mt-1.5 h-4 text-xs text-[var(--mp-muted)]" aria-hidden="true">
                  <span className="absolute left-0">0%</span>
                  <span className="absolute -translate-x-1/2 font-bold text-[var(--mp-ink)]" style={{ left: `${DSR_LIMIT}%` }}>
                    {DSR_LIMIT}%
                  </span>
                  <span className="absolute right-0">100%</span>
                </div>
              </div>
            </div>
          )}

          <dl className="divide-y divide-[var(--mp-line)] border-t border-[var(--mp-line)] pt-2">
            {row("income", text.dsrNetIncome, result.income)}
            {row("existing", text.dsrExisting, result.existing)}
            {row("instalment", text.dsrNewInstalment, result.instalment)}
            {row("total", text.dsrTotalCommit, result.total)}
          </dl>

          {result.complete && (
            <div className="flex flex-col gap-1.5 text-[13px] text-[var(--mp-muted)]">
              <p>{fill(text.dsrLimitLine, { amount: formatRM(result.limitAmount) })}</p>
              <p>
                {fill(text.dsrLoanLine, {
                  loan: formatRM(result.loanAmount),
                  years: parseNumber(values.tenure),
                  rate: parseNumber(values.rate),
                })}
              </p>
            </div>
          )}

          {result.complete && (
            <a
              href={waHref}
              className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]"
            >
              <WhatsAppIcon size={22} />
              {text.dsrWhatsapp}
            </a>
          )}
        </section>

        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">
          {text.dsrDisclaimer}
        </p>
      </div>

      {/* Phone only: keeps the answer in view while the fields are being filled in. */}
      <a
        href="#dsr-results-card"
        data-testid="mobile-bar"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t bg-[var(--mp-paper)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
        style={{ borderColor: result.complete ? color : "var(--mp-accent)" }}
      >
        {result.complete ? (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{text.dsrDsr}</span>
            <span className="flex items-center gap-2">
              <span className="text-xs font-extrabold" style={{ color }}>
                {result.status === "red" ? text.dsrRedTag : text.dsrGreenTag}
              </span>
              <span className="mp-display text-xl font-bold" style={{ color }}>{dsrText}</span>
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{text.dsrMobileWait}</span>
            <span className="text-sm font-bold text-[var(--mp-accent)]">
              {fieldsLeftText(lang, result.fieldsLeft)}
            </span>
          </>
        )}
      </a>
    </div>
  );
}
