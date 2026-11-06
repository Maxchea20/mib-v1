"use client";

import { useState } from "react";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import { PURCHASE_DEFAULTS, evaluatePurchaseCost, type PurchaseCostInput } from "@/site/calculators/costCalcs";
import { formatRM } from "@/site/calculators/housingLoan";
import { BRAND } from "@/site/brand";
import { ct } from "@/site/costText";
import { fieldsLeftText, fill, type Lang } from "@/site/i18n";
import {
  AmountField, BreakdownView, MobileBar, ResetButton, TransactionFields,
  errorText, localToday, useCalcForm, visibleError,
} from "./costShared";

/*
| Total property purchase cost: down payment + legal fees + stamp duty +
| other purchase costs, and the monthly instalment. Same cost engine as the
| legal fees calculator, so nothing is counted twice.
*/

export default function PurchaseCostCalculator({ lang }: { lang: Lang }) {
  const c = ct(lang);
  const form = useCalcForm<PurchaseCostInput>(PURCHASE_DEFAULTS);
  const [today] = useState(localToday);
  const { values, touched } = form;
  const result = evaluatePurchaseCost(values, today);
  const costs = result.costs;

  const field = (name: "price" | "margin" | "tenure" | "rate", label: string, hint: string, prefix: string, required: boolean) => {
    const e = visibleError(result.errors, touched, name);
    return (
      <AmountField
        prefix={prefix}
        idBase="pc"
        field={name}
        label={label}
        hint={hint}
        required={required}
        placeholder={name === "price" ? c.placeholder : undefined}
        value={values[name]}
        error={e ? errorText(lang, e, name) : undefined}
        onChange={(v) => form.setField(name, v)}
        onBlur={() => (name === "price" ? form.tidy(name) : form.touch(name))}
      />
    );
  };

  const fmt = (n: number) => n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const stat = (id: string, label: string, value: number | null) => (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-[var(--mp-muted)]">{label}</dt>
      <dd data-testid={id} className="text-right text-base font-bold">{value === null ? "—" : formatRM(value)}</dd>
    </div>
  );

  const waMessage = costs ? fill(c.pcWhatsappMsg, { price: result.price.toLocaleString("en-MY"), upfront: fmt(result.upfrontCash), monthly: fmt(result.monthly) }) : "";
  const waHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waMessage)}`;
  const border = costs ? "var(--mp-accent)" : "var(--mp-line-strong)";

  return (
    <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_460px] lg:pb-0">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-8 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7">
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secProperty}</legend>
          {field("price", c.price, c.priceHint, "RM", true)}
        </fieldset>
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secLoan}</legend>
          <div className="grid gap-5 sm:grid-cols-3">
            {field("margin", c.margin, c.marginHint, "", true)}
            {field("tenure", c.tenure, c.tenureHint, "", true)}
            {field("rate", c.rate, c.rateHint, "", true)}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-5">
          <legend className="mp-display mb-1 text-xl font-bold">{c.secOptions}</legend>
          <TransactionFields lang={lang} idBase="pc" form={form} errors={result.errors} />
        </fieldset>
        <div><ResetButton lang={lang} onClick={form.reset} /></div>
      </form>

      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <section id="pc-results-card" aria-labelledby="pc-results" aria-live="polite" className="flex flex-col gap-4 rounded-2xl border bg-[var(--mp-card)] p-5 sm:p-7" style={{ borderColor: border }}>
          <h2 id="pc-results" className="sr-only">{c.pcResult}</h2>
          {!costs ? (
            <div className="flex flex-col gap-2">
              <p className="mp-display text-2xl font-bold">{c.pcPending}</p>
              <p data-testid="progress" className="text-[15px] text-[var(--mp-muted)]">{fieldsLeftText(lang, result.fieldsLeft)}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-[var(--mp-muted)]">{c.pcUpfront}</p>
              <p data-testid="upfront" className="mp-display text-4xl font-bold text-[var(--mp-accent)] sm:text-5xl">{formatRM(result.upfrontCash)}</p>
              <p className="text-[13px] text-[var(--mp-muted)]">{c.pcUpfrontNote}</p>
            </div>
          )}

          <dl className="divide-y divide-[var(--mp-line)] border-t border-[var(--mp-line)] pt-1">
            {stat("price", c.pcPrice, costs ? result.price : null)}
            {stat("loan", c.pcLoanAmount, costs ? result.loanAmount : null)}
            {stat("down", c.pcDown, costs ? result.downPayment : null)}
            {stat("costs", c.pcCosts, costs ? costs.total : null)}
            {stat("monthly", c.pcMonthly, costs ? result.monthly : null)}
          </dl>

          {costs && <BreakdownView lang={lang} costs={costs} firstHomeAsked={values.firstHome} />}

          {costs && (
            <a href={waHref} className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]">
              <WhatsAppIcon size={22} />
              {c.pcWhatsapp}
            </a>
          )}
        </section>
        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">{c.pcDisclaimer}</p>
      </div>

      <MobileBar targetId="pc-results-card" borderColor={border}>
        {costs ? (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{c.pcMobileWait}</span>
            <span className="mp-display text-xl font-bold text-[var(--mp-accent)]">{formatRM(result.upfrontCash)}</span>
          </>
        ) : (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{c.pcMobileWait}</span>
            <span className="text-sm font-bold text-[var(--mp-accent)]">{fieldsLeftText(lang, result.fieldsLeft)}</span>
          </>
        )}
      </MobileBar>
    </div>
  );
}
