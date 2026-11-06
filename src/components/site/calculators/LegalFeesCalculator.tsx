"use client";

import { useState } from "react";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { COST_DEFAULTS, evaluateLegalFees, type LegalFeesInput } from "@/site/calculators/costCalcs";
import { formatRM } from "@/site/calculators/housingLoan";
import { BRAND } from "@/site/brand";
import { ct } from "@/site/costText";
import { fieldsLeftText, fill, type Lang } from "@/site/i18n";
import {
  AmountField, BreakdownView, MobileBar, ResetButton, TransactionFields,
  errorText, localToday, useCalcForm, visibleError,
} from "./costShared";

/*
| Legal fees + stamp duty calculator. Calculated in the browser and updated on
| every keystroke. The maths is in src/site/calculators/costs.ts (unit-tested).
*/

const INITIAL: LegalFeesInput = { ...COST_DEFAULTS, loan: "" };

export default function LegalFeesCalculator({ lang }: { lang: Lang }) {
  const c = ct(lang);
  const form = useCalcForm<LegalFeesInput>(INITIAL);
  const [today] = useState(localToday);
  const { values, touched } = form;
  const result = evaluateLegalFees(values, today);
  const costs = result.costs;

  const amount = (field: "price" | "loan", label: string, hint: string) => {
    const e = visibleError(result.errors, touched, field);
    return (
      <AmountField
        prefix="RM"
        idBase="ll"
        field={field}
        label={label}
        hint={hint}
        required
        placeholder={c.placeholder}
        value={values[field]}
        error={e ? errorText(lang, e, field) : undefined}
        onChange={(v) => form.setField(field, v)}
        onBlur={() => form.tidy(field)}
      />
    );
  };

  const stat = (id: string, label: string, value: number | null, strong = false) => (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-[var(--mp-muted)]">{label}</dt>
      <dd data-testid={id} className={`text-right ${strong ? "text-lg font-extrabold" : "text-base font-bold"}`}>
        {value === null ? "—" : formatRM(value)}
      </dd>
    </div>
  );

  const waMessage = costs
    ? fill(c.llWhatsappMsg, { price: result.price.toLocaleString("en-MY"), loan: result.loan.toLocaleString("en-MY"), total: costs.total.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })
    : "";
  const waHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waMessage)}`;
  const border = costs ? "var(--mp-accent)" : "var(--mp-line-strong)";

  return (
    <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_460px] lg:pb-0">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-8 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7">
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secProperty}</legend>
          {amount("price", c.price, c.priceHint)}
          {amount("loan", c.loan, c.loanHint)}
        </fieldset>
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secTransaction}</legend>
          <TransactionFields lang={lang} idBase="ll" form={form} errors={result.errors} />
        </fieldset>
        <div><ResetButton lang={lang} onClick={form.reset} /></div>
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <section id="ll-results-card" aria-labelledby="ll-results" aria-live="polite" className="flex flex-col gap-4 rounded-2xl border bg-[var(--mp-card)] p-5 sm:p-7" style={{ borderColor: border }}>
          <h2 id="ll-results" className="sr-only">{c.llResult}</h2>
          {!costs ? (
            <div className="flex flex-col gap-2">
              <p className="mp-display text-2xl font-bold">{c.llPending}</p>
              <p data-testid="progress" className="text-[15px] text-[var(--mp-muted)]">{fieldsLeftText(lang, result.fieldsLeft)}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-[var(--mp-muted)]">{c.llTotal}</p>
              <p data-testid="total" className="mp-display text-4xl font-bold text-[var(--mp-accent)] sm:text-5xl">{formatRM(costs.total)}</p>
            </div>
          )}

          <dl className="divide-y divide-[var(--mp-line)] border-t border-[var(--mp-line)] pt-1">
            {stat("legal", c.llLegalTotal, costs ? costs.legalFees + costs.serviceTax : null)}
            {stat("statutory", c.llStatutoryTotal, costs ? costs.transferDuty + costs.loanDuty : null)}
            {stat("estimates", c.llEstimateTotal, costs ? costs.disbursements + costs.otherCosts : null)}
          </dl>

          {costs && <BreakdownView lang={lang} costs={costs} defaultOpen firstHomeAsked={values.firstHome} />}

          {costs && (
            <a href={waHref} className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]">
              <WhatsAppIcon size={22} />
              {c.llWhatsapp}
            </a>
          )}
        </section>
        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">{c.llDisclaimer}</p>
      </div>

      <MobileBar targetId="ll-results-card" borderColor={border}>
        {costs ? (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{c.llTotal}</span>
            <span className="mp-display text-xl font-bold text-[var(--mp-accent)]">{formatRM(costs.total)}</span>
          </>
        ) : (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{c.llMobileWait}</span>
            <span className="text-sm font-bold text-[var(--mp-accent)]">{fieldsLeftText(lang, result.fieldsLeft)}</span>
          </>
        )}
      </MobileBar>
    </div>
  );
}
