"use client";

import { useState, type ReactNode } from "react";
import { formatRM, parseNumber } from "@/site/calculators/housingLoan";
import type { CostBreakdown } from "@/site/calculators/costs";
import type { FieldError } from "@/site/calculators/costCalcs";
import { ct } from "@/site/costText";
import { fill, type Lang } from "@/site/i18n";

/*
| Pieces shared by the three purchase-cost calculators: form state, amount
| fields, the transaction options, and the cost breakdown.
*/

export const groupDigits = (n: number) => n.toLocaleString("en-MY", { maximumFractionDigits: 2 });

/** Today as YYYY-MM-DD in the visitor's own time zone. */
export const localToday = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/* ------------------------------------------------------------- form state */

export function useCalcForm<T extends object>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  // A blank field only shows "required" after the visitor has been in it.
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setField = <K extends keyof T>(field: K, value: T[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    setTouched((t) => ({ ...t, [field as string]: true }));
  };
  const touch = (field: keyof T) => setTouched((t) => ({ ...t, [field as string]: true }));
  // Tidy "500000" into "500,000" when leaving a money field.
  const tidy = (field: keyof T) => {
    touch(field);
    const raw = values[field];
    if (typeof raw !== "string") return;
    const n = parseNumber(raw);
    if (Number.isFinite(n) && raw.trim() !== "") setValues((v) => ({ ...v, [field]: groupDigits(n) }));
  };
  const reset = () => {
    setValues(initial);
    setTouched({});
  };
  return { values, touched, setField, touch, tidy, reset };
}

export type CalcForm<T extends object> = ReturnType<typeof useCalcForm<T>>;

/* ----------------------------------------------------------------- errors */

export type AnyError = FieldError | "required" | "invalid" | "negative" | "zero" | "range";

export function errorText(lang: Lang, error: AnyError, field: string): string {
  const c = ct(lang);
  switch (error) {
    case "required": return c.errRequired;
    case "invalid": return c.errInvalid;
    case "negative": return c.errNegative;
    case "zero": return c.errZero;
    case "loanTooHigh": return c.errLoanTooHigh;
    default:
      if (field === "margin") return c.errMargin;
      if (field === "tenure") return c.errTenure;
      if (field === "rate") return c.errRate;
      if (field === "discount") return c.errDiscount;
      return c.errRange;
  }
}

/** Blank fields stay quiet until visited; anything typed wrongly is flagged at once. */
export function visibleError(
  errors: Partial<Record<string, AnyError>>,
  touched: Record<string, boolean>,
  field: string
): AnyError | undefined {
  const e = errors[field];
  if (!e) return undefined;
  if (e === "required" && !touched[field]) return undefined;
  return e;
}

/* ----------------------------------------------------------------- inputs */

export function AmountField(props: {
  prefix: string;
  idBase: string;
  field: string;
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  optionalTag?: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const { idBase, field, error } = props;
  const id = `${idBase}-${field}`;
  const describedBy = [props.hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold">
        {props.label}{" "}
        {props.required ? (
          <span aria-hidden="true" className="text-[var(--mp-accent)]">*</span>
        ) : props.optionalTag ? (
          <span className="text-xs font-semibold text-[var(--mp-muted)]">({props.optionalTag})</span>
        ) : null}
      </label>
      <div className="relative">
        {props.prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--mp-muted)]">
            {props.prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={props.required}
          aria-required={props.required ? "true" : undefined}
          placeholder={props.placeholder}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onBlur={props.onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-[10px] border bg-[var(--mp-paper)] px-3 text-base text-[var(--mp-ink)] outline-none focus:border-[var(--mp-accent)] ${
            props.prefix ? "pl-11" : ""
          } ${error ? "border-[#E5484D]" : "border-[var(--mp-line-strong)]"}`}
        />
      </div>
      {props.hint && <p id={`${id}-hint`} className="mt-2 text-sm text-[var(--mp-muted)]">{props.hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-semibold text-[#FF8A8E]">{error}</p>
      )}
    </div>
  );
}

export function SelectField(props: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-2 block text-sm font-bold">{props.label}</label>
      <select
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-12 w-full rounded-[10px] border border-[var(--mp-line-strong)] bg-[var(--mp-paper)] px-3 text-base text-[var(--mp-ink)] outline-none focus:border-[var(--mp-accent)]"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function CheckField(props: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="flex cursor-pointer items-start gap-3 py-2 text-sm font-bold">
        <input
          id={props.id}
          type="checkbox"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
          aria-describedby={props.hint ? `${props.id}-hint` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--mp-accent)]"
        />
        <span>{props.label}</span>
      </label>
      {props.hint && <p id={`${props.id}-hint`} className="-mt-1 ml-8 text-sm font-normal text-[var(--mp-muted)]">{props.hint}</p>}
    </div>
  );
}

export function ResetButton({ lang, onClick }: { lang: Lang; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="reset"
      className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[var(--mp-line-strong)] px-4 text-sm font-bold hover:border-[var(--mp-accent)]"
    >
      {ct(lang).reset}
    </button>
  );
}

/* --------------------------------------------- transaction option fields */

type OptionValues = {
  transaction: string;
  propertyType: string;
  firstHome: boolean;
  serviceTax: boolean;
  subsidiary: boolean;
  discount: string;
  disbursements: string;
  other: string;
};

export function TransactionFields<T extends OptionValues>({
  lang, idBase, form, errors,
}: {
  lang: Lang;
  idBase: string;
  form: CalcForm<T>;
  errors: Partial<Record<string, AnyError>>;
}) {
  const c = ct(lang);
  const { values, touched } = form;
  const set = form.setField as (field: keyof OptionValues, value: string | boolean) => void;
  const money = (field: "discount" | "disbursements" | "other", label: string, hint: string, prefix: string) => {
    const e = visibleError(errors, touched, field);
    return (
      <AmountField
        prefix={prefix}
        idBase={idBase}
        field={field}
        label={label}
        hint={hint}
        optionalTag={c.optional}
        value={values[field]}
        placeholder={field === "discount" ? "0" : undefined}
        error={e ? errorText(lang, e, field) : undefined}
        onChange={(v) => set(field, v)}
        onBlur={() => (field === "discount" ? form.touch(field) : form.tidy(field))}
      />
    );
  };
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id={`${idBase}-transaction`}
          label={c.transaction}
          value={values.transaction}
          options={[{ value: "subsale", label: c.txSubsale }, { value: "developer", label: c.txDeveloper }]}
          onChange={(v) => set("transaction", v)}
        />
        <SelectField
          id={`${idBase}-propertyType`}
          label={c.propertyType}
          value={values.propertyType}
          options={[{ value: "residential", label: c.ptResidential }, { value: "other", label: c.ptOther }]}
          onChange={(v) => set("propertyType", v)}
        />
      </div>
      <CheckField id={`${idBase}-firstHome`} label={c.firstHome} hint={c.firstHomeHint} checked={values.firstHome} onChange={(v) => set("firstHome", v)} />
      <CheckField id={`${idBase}-serviceTax`} label={c.serviceTax} hint={c.serviceTaxHint} checked={values.serviceTax} onChange={(v) => set("serviceTax", v)} />
      <CheckField id={`${idBase}-subsidiary`} label={c.subsidiary} hint={c.subsidiaryHint} checked={values.subsidiary} onChange={(v) => set("subsidiary", v)} />
      {money("discount", c.discount, c.discountHint, "%")}
      {money("disbursements", c.disbursements, c.disbursementsHint, "RM")}
      {money("other", c.other, c.otherHint, "RM")}
    </>
  );
}

/* ------------------------------------------------------------- breakdown */

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 inline-block rounded-full border border-[var(--mp-line-strong)] px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-[var(--mp-muted)]">
      {children}
    </span>
  );
}

function Row({ id, label, value, tag, strong }: { id: string; label: string; value: number; tag?: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className="text-[14px] text-[var(--mp-muted)]">
        {label}
        {tag && <Tag>{tag}</Tag>}
      </dt>
      <dd data-testid={id} className={`shrink-0 text-right ${strong ? "text-base font-extrabold" : "text-[15px] font-bold"}`}>
        {formatRM(value)}
      </dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-3">
      <h3 className="text-xs font-extrabold uppercase tracking-wide text-[var(--mp-accent)]">{title}</h3>
      <dl className="divide-y divide-[var(--mp-line)]">{children}</dl>
    </div>
  );
}

export function BreakdownView({ lang, costs, defaultOpen = false, firstHomeAsked }: {
  lang: Lang;
  costs: CostBreakdown;
  defaultOpen?: boolean;
  firstHomeAsked: boolean;
}) {
  const c = ct(lang);
  const notes: string[] = [];
  if (costs.hda) notes.push(c.noteHda);
  if (costs.discountIgnoredForHda) notes.push(c.noteDiscountIgnored);
  if (costs.discountApplied > 0) notes.push(fill(c.noteDiscount, { pct: costs.discountApplied }));
  if (costs.aboveScaleCap) notes.push(c.noteAboveScale);
  if (firstHomeAsked) {
    const reason = costs.exemption.reason;
    notes.push(
      reason === "ok" ? c.exApplied
        : reason === "notResidential" ? c.exNotResidential
        : reason === "priceTooHigh" ? c.exPriceTooHigh
        : reason === "expired" ? c.exExpired
        : ""
    );
    notes.push(c.exBudget);
  }

  return (
    <details open={defaultOpen} className="group rounded-xl border border-[var(--mp-line)] bg-[var(--mp-paper)]" data-testid="breakdown">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-extrabold">
        <span className="group-open:hidden">{c.showBreakdown}</span>
        <span className="hidden group-open:inline">{c.hideBreakdown}</span>
        <span aria-hidden="true" className="text-[var(--mp-accent)] transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="px-4 pb-4">
        <Group title={c.grpLegal}>
          <Row id="row-spa" label={c.spaFee} value={costs.spaFee} tag={c.tagScale} />
          {costs.loanFee > 0 && <Row id="row-loanfee" label={c.loanFee} value={costs.loanFee} tag={c.tagScale} />}
          {costs.subsidiaryFee > 0 && <Row id="row-subsidiary" label={c.subsidiaryFee} value={costs.subsidiaryFee} tag={c.tagScale} />}
          <Row id="row-legal" label={c.legalFees} value={costs.legalFees} strong />
          {costs.serviceTax > 0 && <Row id="row-servicetax" label={c.serviceTaxRow} value={costs.serviceTax} tag={c.tagEstimate} />}
        </Group>

        <Group title={c.grpDuty}>
          <Row id="row-transferduty" label={c.transferDuty} value={costs.transferDuty} tag={c.tagStatutory} />
          <Row id="row-loanduty" label={c.loanDuty} value={costs.loanDuty} tag={c.tagStatutory} />
        </Group>

        <Group title={c.grpEstimate}>
          <Row
            id="row-disbursements"
            label={c.disbursementsRow}
            value={costs.disbursements}
            tag={costs.disbursementsAreEstimate ? c.tagEstimate : c.tagYours}
          />
          {costs.otherCosts > 0 && <Row id="row-other" label={c.otherRow} value={costs.otherCosts} tag={c.tagYours} />}
        </Group>

        <dl className="mt-3 border-t border-[var(--mp-line)]">
          <Row id="row-total" label={c.total} value={costs.total} strong />
        </dl>

        {costs.transferBands.length > 0 && (
          <details className="mt-3 text-sm text-[var(--mp-muted)]">
            <summary className="cursor-pointer font-bold">{c.dutyBands}</summary>
            <ul className="mt-2 flex flex-col gap-1">
              {costs.transferBands.map((b) => (
                <li key={b.from} className="flex justify-between gap-3">
                  <span>{fill(c.bandLine, { rate: b.ratePct, amount: formatRM(b.amount) })}</span>
                  <span className="font-bold text-[var(--mp-ink)]">{formatRM(b.duty)}</span>
                </li>
              ))}
              {costs.exemption.applied && (
                <li>{fill(c.beforeExemption, { amount: formatRM(costs.transferDutyBeforeExemption) })}</li>
              )}
            </ul>
          </details>
        )}

        {notes.length > 0 && (
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[13px] text-[var(--mp-muted)]" data-testid="notes">
            {notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}
      </div>
    </details>
  );
}

/* ----------------------------------------------------------- mobile bar */

export function MobileBar({ targetId, borderColor, children }: { targetId: string; borderColor: string; children: ReactNode }) {
  return (
    <a
      href={`#${targetId}`}
      data-testid="mobile-bar"
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t bg-[var(--mp-paper)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      style={{ borderColor }}
    >
      {children}
    </a>
  );
}
