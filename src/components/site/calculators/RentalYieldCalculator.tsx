"use client";

import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import {
  ANNUAL_EXPENSES, EMPTY_INPUT, MONTHLY_EXPENSES, calculateRental, type RentalField, type RentalInput,
} from "@/site/calculators/rental";
import { formatRM } from "@/site/calculators/housingLoan";
import { BRAND } from "@/site/brand";
import { ct } from "@/site/costText";
import { fieldsLeftText, fill, type Lang } from "@/site/i18n";
import {
  AmountField, CheckField, MobileBar, ResetButton, errorText, useCalcForm, visibleError,
} from "./costShared";

/*
| Rental yield calculator. Loan instalments are never part of the yield; the
| optional "cash flow after the loan" is shown as a separate figure.
| Maths: src/site/calculators/rental.ts (unit-tested).
*/

const GREEN = "#3DD68C";
const RED = "#FF6B6F";

export default function RentalYieldCalculator({ lang }: { lang: Lang }) {
  const c = ct(lang);
  const form = useCalcForm<RentalInput>(EMPTY_INPUT);
  const { values, touched } = form;
  const r = calculateRental(values);

  const field = (name: RentalField, label: string, opts: { hint?: string; required?: boolean; optional?: boolean; prefix?: string } = {}) => {
    const e = visibleError(r.errors, touched, name);
    return (
      <AmountField
        key={name}
        prefix={opts.prefix ?? "RM"}
        idBase="ry"
        field={name}
        label={label}
        hint={opts.hint}
        required={opts.required}
        optionalTag={opts.optional ? c.optional : undefined}
        placeholder={opts.required ? c.placeholder : undefined}
        value={values[name]}
        error={e ? errorText(lang, e, name) : undefined}
        onChange={(v) => form.setField(name, v)}
        onBlur={() => (opts.prefix === "" ? form.touch(name) : form.tidy(name))}
      />
    );
  };

  const pct = (n: number) => `${n.toFixed(2)}%`;
  const negative = r.complete && r.annualNet < 0;
  const netColor = negative ? RED : GREEN;
  const border = r.complete ? netColor : "var(--mp-line-strong)";

  const stat = (id: string, label: string, value: string | null, color?: string) => (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-[var(--mp-muted)]">{label}</dt>
      <dd data-testid={id} className="text-right text-base font-bold" style={color ? { color } : undefined}>{value ?? "—"}</dd>
    </div>
  );

  const monthlyLabels: Record<(typeof MONTHLY_EXPENSES)[number], string> = {
    maintenance: c.maintenance, sinking: c.sinking, otherMonthly: c.otherMonthly,
  };
  const annualLabels: Record<(typeof ANNUAL_EXPENSES)[number], string> = {
    assessment: c.assessment, quitRent: c.quitRent, insurance: c.insurance, repairs: c.repairs, otherAnnual: c.otherAnnual,
  };

  const waMessage = r.complete
    ? fill(c.ryWhatsappMsg, {
        price: r.price.toLocaleString("en-MY"),
        rent: (r.annualGross / 12).toLocaleString("en-MY"),
        gross: r.grossYield.toFixed(2),
        net: r.netYield.toFixed(2),
      })
    : "";
  const waHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_460px] lg:pb-0">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-8 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7">
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secIncome}</legend>
          {field("price", c.ryPrice, { hint: c.ryPriceHint, required: true })}
          {field("rent", c.ryRent, { hint: c.ryRentHint, required: true })}
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secMonthly}</legend>
          <p className="-mt-2 text-sm text-[var(--mp-muted)]">{c.ryNoteBlank}</p>
          {MONTHLY_EXPENSES.map((f) => field(f, monthlyLabels[f], { optional: true }))}
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secAnnual}</legend>
          {ANNUAL_EXPENSES.map((f) => field(f, annualLabels[f], { optional: true }))}
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secFinancing}</legend>
          <CheckField id="ry-financing" label={c.finToggle} hint={c.finHint} checked={values.financing} onChange={(v) => form.setField("financing", v)} />
          {values.financing && (
            <div className="grid gap-5 sm:grid-cols-3">
              {field("margin", c.margin, { prefix: "", required: true })}
              {field("tenure", c.tenure, { prefix: "", required: true })}
              {field("rate", c.rate, { prefix: "", required: true })}
            </div>
          )}
        </fieldset>

        <div><ResetButton lang={lang} onClick={form.reset} /></div>
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <section id="ry-results-card" aria-labelledby="ry-results" aria-live="polite" className="flex flex-col gap-4 rounded-2xl border bg-[var(--mp-card)] p-5 sm:p-7" style={{ borderColor: border }}>
          <h2 id="ry-results" className="sr-only">{c.ryResult}</h2>
          {!r.complete ? (
            <div className="flex flex-col gap-2">
              <p className="mp-display text-2xl font-bold">{c.ryPending}</p>
              <p data-testid="progress" className="text-[15px] text-[var(--mp-muted)]">{fieldsLeftText(lang, r.fieldsLeft)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--mp-muted)]">{c.rGrossYield}</p>
                <p data-testid="gross-yield" className="mp-display text-3xl font-bold sm:text-4xl">{pct(r.grossYield)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--mp-muted)]">{c.rNetYield}</p>
                <p data-testid="net-yield" data-negative={negative} className="mp-display text-3xl font-bold sm:text-4xl" style={{ color: netColor }}>{pct(r.netYield)}</p>
              </div>
            </div>
          )}
          {negative && <p data-testid="negative-note" className="text-sm font-semibold" style={{ color: RED }}>{c.rNegative}</p>}

          <dl className="divide-y divide-[var(--mp-line)] border-t border-[var(--mp-line)] pt-1">
            {stat("annual-gross", c.rGrossIncome, r.complete ? formatRM(r.annualGross) : null)}
            {stat("operating", c.rOperating, r.complete ? formatRM(r.annualOperating) : null)}
            {stat("annual-net", c.rNetIncome, r.complete ? formatRM(r.annualNet) : null, r.complete ? netColor : undefined)}
            {stat("monthly-net", c.rMonthlyNet, r.complete ? formatRM(r.monthlyNet) : null, r.complete ? netColor : undefined)}
          </dl>
          {r.complete && (
            <p className="text-[13px] text-[var(--mp-muted)]">
              {fill(c.rExpensesNote, { monthly: formatRM(r.monthlyExpenses), annual: formatRM(r.annualExpensesTotal) })}
            </p>
          )}

          {r.financing && (
            <dl className="divide-y divide-[var(--mp-line)] border-t border-[var(--mp-line)] pt-1" data-testid="financing">
              {stat("loan", c.rLoan, formatRM(r.financing.loanAmount))}
              {stat("instalment", c.rInstalment, formatRM(r.financing.monthlyInstalment))}
              {stat("cashflow", c.rCashFlow, formatRM(r.financing.monthlyCashFlow), r.financing.monthlyCashFlow < 0 ? RED : GREEN)}
              {stat("cashflow-year", c.rCashFlowYear, formatRM(r.financing.annualCashFlow), r.financing.annualCashFlow < 0 ? RED : GREEN)}
            </dl>
          )}

          {r.complete && (
            <a href={waHref} className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]">
              <WhatsAppIcon size={22} />
              {c.ryWhatsapp}
            </a>
          )}
        </section>
        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">{c.ryDisclaimer}</p>
      </div>

      <MobileBar targetId="ry-results-card" borderColor={border}>
        {r.complete ? (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{c.ryMobileNet}</span>
            <span className="flex items-center gap-3">
              <span className="text-xs text-[var(--mp-muted)]">{pct(r.grossYield)}</span>
              <span className="mp-display text-xl font-bold" style={{ color: netColor }}>{pct(r.netYield)}</span>
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{c.ryMobileWait}</span>
            <span className="text-sm font-bold text-[var(--mp-accent)]">{fieldsLeftText(lang, r.fieldsLeft)}</span>
          </>
        )}
      </MobileBar>
    </div>
  );
}
