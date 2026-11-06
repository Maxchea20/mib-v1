"use client";

import { useState } from "react";
import WhatsAppIcon from "@/components/site/WhatsAppIcon";
import {
  BANDS,
  COST_FIELDS,
  EMPTY_INPUT,
  RATES,
  calculateRpgt,
  parseDate,
  privateResidenceAllowed,
  type CostField,
  type FieldError,
  type RpgtBand,
  type RpgtField,
  type RpgtInput,
  type SellerCategory,
  type SellerKind,
  type YMD,
} from "@/site/calculators/rpgt";
import { formatRM, parseNumber } from "@/site/calculators/housingLoan";
import { BRAND } from "@/site/brand";
import { fieldsLeftText, fill, holdingText, t, type Lang } from "@/site/i18n";

/*
| RPGT calculator. Calculated in the browser (nothing is sent anywhere) and
| recalculated on every change. Nothing is shown until the required fields
| are valid. Maths lives in src/site/calculators/rpgt.ts (unit-tested).
*/

const groupDigits = (n: number) => n.toLocaleString("en-MY", { maximumFractionDigits: 2 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (d: YMD) => `${d.d} ${MONTHS[d.m - 1]} ${d.y}`;

const CATEGORIES: SellerCategory[] = ["part1", "part2", "part3"];

export default function RpgtCalculator({ lang }: { lang: Lang }) {
  const text = t(lang);

  const [values, setValues] = useState<RpgtInput>(EMPTY_INPUT);
  const [touched, setTouched] = useState<Partial<Record<RpgtField, boolean>>>({});

  const result = calculateRpgt(values);

  const touch = (field: RpgtField) => setTouched((s) => ({ ...s, [field]: true }));

  const setField = (field: Exclude<RpgtField, "category" | "sellerKind">, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    touch(field);
  };

  const tidy = (field: Exclude<RpgtField, "category" | "sellerKind" | "acqDate" | "dispDate">) => {
    touch(field);
    const n = parseNumber(values[field]);
    if (Number.isFinite(n)) setValues((v) => ({ ...v, [field]: groupDigits(n) }));
  };

  const chooseCategory = (category: SellerCategory) => {
    touch("category");
    setValues((v) => {
      const sellerKind: SellerKind | "" =
        category === "part1" ? "individual" : category === "part2" ? "other" : "";
      return {
        ...v,
        category,
        sellerKind,
        privateResidence: privateResidenceAllowed(category, sellerKind) ? v.privateResidence : false,
      };
    });
  };

  const chooseKind = (sellerKind: SellerKind) => {
    touch("sellerKind");
    setValues((v) => ({
      ...v,
      sellerKind,
      privateResidence: privateResidenceAllowed(v.category, sellerKind) ? v.privateResidence : false,
    }));
  };

  const canClaimPrivate = privateResidenceAllowed(values.category, values.sellerKind);
  const privateTicked = values.privateResidence && canClaimPrivate;

  const errorMessage = (e: FieldError): string => {
    switch (e) {
      case "required": return text.rpErrRequired;
      case "invalid": return text.rpErrInvalid;
      case "negative": return text.rpErrNegative;
      case "zero": return text.rpErrZero;
      case "range": return text.rpErrTooHigh;
      case "dateInvalid": return text.rpErrDateInvalid;
      case "dateEarly": return text.rpErrDateEarly;
      case "dateOrder": return text.rpErrDateOrder;
    }
  };

  // A blank field stays quiet until visited; anything typed wrongly is flagged at once.
  const visibleError = (field: RpgtField): FieldError | undefined => {
    const e = result.errors[field];
    if (!e) return undefined;
    if (e === "required" && !touched[field]) return undefined;
    return e;
  };

  const anyTouched = Object.keys(touched).length > 0;

  const inputClass = (field: RpgtField) =>
    `h-12 w-full rounded-[10px] border bg-[var(--mp-paper)] px-3 text-base text-[var(--mp-ink)] outline-none focus:border-[var(--mp-accent)] ${
      visibleError(field) ? "border-[#E5484D]" : "border-[var(--mp-line-strong)]"
    }`;

  const err = (field: RpgtField) => {
    const e = visibleError(field);
    return e ? (
      <p id={`rp-${field}-err`} role="alert" className="mt-1.5 text-sm font-semibold text-[#FF8A8E]">
        {errorMessage(e)}
      </p>
    ) : null;
  };

  const describedBy = (field: RpgtField, hint?: string) =>
    [hint, visibleError(field) ? `rp-${field}-err` : ""].filter(Boolean).join(" ") || undefined;

  const moneyField = (
    field: Exclude<RpgtField, "category" | "sellerKind" | "acqDate" | "dispDate">,
    label: string,
    required: boolean
  ) => (
    <div key={field}>
      <label htmlFor={`rp-${field}`} className="mb-2 block text-sm font-bold">
        {label}{" "}
        {required ? (
          <span aria-hidden="true" className="text-[var(--mp-accent)]">*</span>
        ) : (
          <span className="font-normal text-[var(--mp-muted)]">({text.rpOptional})</span>
        )}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--mp-muted)]">RM</span>
        <input
          id={`rp-${field}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          aria-required={required}
          value={values[field]}
          onChange={(e) => setField(field, e.target.value)}
          onBlur={() => tidy(field)}
          aria-invalid={Boolean(visibleError(field))}
          aria-describedby={describedBy(field)}
          className={`${inputClass(field)} pl-11`}
        />
      </div>
      {err(field)}
    </div>
  );

  const dateField = (field: "acqDate" | "dispDate", label: string) => (
    <div key={field}>
      <label htmlFor={`rp-${field}`} className="mb-2 block text-sm font-bold">
        {label} <span aria-hidden="true" className="text-[var(--mp-accent)]">*</span>
      </label>
      <input
        id={`rp-${field}`}
        type="date"
        min="1970-01-01"
        max="2100-12-31"
        required
        aria-required="true"
        value={values[field]}
        onChange={(e) => setField(field, e.target.value)}
        onBlur={() => touch(field)}
        aria-invalid={Boolean(visibleError(field))}
        aria-describedby={describedBy(field)}
        className={inputClass(field)}
      />
      {err(field)}
    </div>
  );

  const categoryLabel: Record<SellerCategory, string> = {
    part1: text.rpPart1,
    part2: text.rpPart2,
    part3: text.rpPart3,
  };
  const categoryDesc: Record<SellerCategory, string> = {
    part1: text.rpPart1Desc,
    part2: text.rpPart2Desc,
    part3: text.rpPart3Desc,
  };
  const costLabels: Record<CostField, string> = {
    costAcqLegal: text.rpCostAcqLegal,
    costDispLegal: text.rpCostDispLegal,
    costStamp: text.rpCostStamp,
    costReno: text.rpCostReno,
    costOther: text.rpCostOther,
  };
  const bandLabel: Record<RpgtBand, string> = {
    within3: text.rpBandWithin3,
    year4: text.rpBandYear4,
    year5: text.rpBandYear5,
    year6plus: text.rpBandYear6,
  };

  const exemptionLabel =
    result.exemptionKind === "privateResidence"
      ? text.rpExPrivate
      : result.exemptionKind === "individual"
        ? text.rpExIndividual
        : text.rpExNone;

  const acqDate = parseDate(values.acqDate);
  const dispDate = parseDate(values.dispDate);

  const waMessage =
    result.complete && result.band && acqDate && dispDate && values.category
      ? fill(text.rpWhatsappMsg, {
          category: categoryLabel[values.category],
          acq: fmtDate(acqDate),
          disp: fmtDate(dispDate),
          acqPrice: formatRM(result.acqPrice),
          dispPrice: formatRM(result.dispPrice),
          tax: formatRM(result.tax),
        })
      : "";
  const waHref = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  const row = (
    testId: string,
    label: string,
    value: string,
    op?: string,
    strong?: boolean,
    note?: string
  ) => (
    <div className="flex items-baseline gap-3 py-2.5">
      <span aria-hidden="true" className="w-4 flex-none text-center text-sm font-bold text-[var(--mp-accent)]">{op ?? ""}</span>
      <dt className="min-w-0 flex-1 text-[14px] text-[var(--mp-muted)]">
        {label}
        {note && <span className="mt-0.5 block text-[12px] leading-snug">{note}</span>}
      </dt>
      <dd data-testid={testId} className={`text-right ${strong ? "text-lg font-extrabold text-[var(--mp-accent)]" : "text-base font-extrabold"}`}>
        {result.complete ? value : "—"}
      </dd>
    </div>
  );

  const radioCard = (selected: boolean) =>
    `flex h-full cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-[var(--mp-accent)] ${
      selected
        ? "border-[var(--mp-accent)] bg-[#1D1A10]"
        : "border-[var(--mp-line)] bg-[var(--mp-paper)] hover:border-[var(--mp-accent)]"
    }`;

  const showCategoryError = Boolean(result.errors.category) && anyTouched;
  const showKindError =
    Boolean(result.errors.sellerKind) && values.category !== "" && (touched.sellerKind || anyTouched);

  return (
    <div className="grid items-start gap-6 pb-20 lg:grid-cols-[1fr_460px] lg:pb-0">
      {/* ---------------------------------------------------------------- INPUTS */}
      <div className="flex min-w-0 flex-col gap-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          noValidate
          className="flex flex-col gap-8 rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7"
        >
          {/* 1. Seller */}
          <fieldset className="flex flex-col gap-4" aria-describedby="rp-category-hint">
            <legend className="mp-display mb-1 text-xl font-bold">{text.rpSecCategory}</legend>
            <p id="rp-category-hint" className="-mt-2 text-sm text-[var(--mp-muted)]">{text.rpCategoryHint}</p>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-required="true">
              {CATEGORIES.map((c) => (
                <label key={c} className="relative block">
                  <input
                    type="radio"
                    name="rp-category"
                    value={c}
                    checked={values.category === c}
                    onChange={() => chooseCategory(c)}
                    className="peer sr-only"
                  />
                  <span className={radioCard(values.category === c)}>
                    <span className="text-base font-extrabold">{categoryLabel[c]}</span>
                    <span className="text-[13px] leading-snug text-[var(--mp-muted)]">{categoryDesc[c]}</span>
                  </span>
                </label>
              ))}
            </div>
            {showCategoryError && (
              <p id="rp-category-err" role="alert" className="text-sm font-semibold text-[#FF8A8E]">{text.rpErrCategory}</p>
            )}

            {(values.category === "part1" || values.category === "part3") && (
              <div className="mt-2 flex flex-col gap-3">
                <p className="text-sm font-bold">
                  {text.rpSellerKind} <span aria-hidden="true" className="text-[var(--mp-accent)]">*</span>
                </p>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-required="true">
                  {(["individual", "other"] as SellerKind[]).map((k) => (
                    <label key={k} className="relative block">
                      <input
                        type="radio"
                        name="rp-kind"
                        value={k}
                        checked={values.sellerKind === k}
                        onChange={() => chooseKind(k)}
                        className="peer sr-only"
                      />
                      <span className={radioCard(values.sellerKind === k)}>
                        <span className="text-[15px] font-bold">{k === "individual" ? text.rpIndividual : text.rpOtherBody}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-[var(--mp-muted)]">{text.rpSellerKindHint}</p>
                {showKindError && (
                  <p id="rp-sellerKind-err" role="alert" className="text-sm font-semibold text-[#FF8A8E]">{text.rpErrSellerKind}</p>
                )}
              </div>
            )}
          </fieldset>

          {/* 2. Property */}
          <fieldset className="flex flex-col gap-5">
            <legend className="mp-display mb-1 text-xl font-bold">{text.rpSecProperty}</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              {moneyField("acqPrice", text.rpAcqPrice, true)}
              {moneyField("dispPrice", text.rpDispPrice, true)}
              {dateField("acqDate", text.rpAcqDate)}
              {dateField("dispDate", text.rpDispDate)}
            </div>
            <p className="-mt-2 text-sm text-[var(--mp-muted)]">{text.rpDateHint}</p>
          </fieldset>

          {/* 3. Costs */}
          <fieldset className="flex flex-col gap-5">
            <legend className="mp-display mb-1 text-xl font-bold">{text.rpSecCosts}</legend>
            <p className="-mt-2 rounded-[10px] border border-[var(--mp-line)] bg-[var(--mp-paper)] p-3 text-sm leading-relaxed text-[var(--mp-ink2)]">
              {text.rpCostsNote}
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {COST_FIELDS.map((f) => moneyField(f, costLabels[f], false))}
            </div>
          </fieldset>

          {/* 4. Exemption */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mp-display mb-1 text-xl font-bold">{text.rpSecExemption}</legend>
            <label className={`flex items-start gap-3 rounded-xl border p-4 ${canClaimPrivate ? "cursor-pointer border-[var(--mp-line)]" : "cursor-not-allowed border-[var(--mp-line)] opacity-60"}`}>
              <input
                id="rp-private"
                type="checkbox"
                checked={privateTicked}
                disabled={!canClaimPrivate}
                onChange={(e) => setValues((v) => ({ ...v, privateResidence: e.target.checked }))}
                aria-describedby="rp-private-note"
                className="mt-1 h-5 w-5 accent-[var(--mp-accent)]"
              />
              <span className="text-[15px] font-bold leading-snug">{text.rpPrivate}</span>
            </label>
            <p id="rp-private-note" className="text-sm leading-relaxed text-[var(--mp-muted)]">
              {canClaimPrivate ? text.rpPrivateWarn : text.rpPrivateNA}
            </p>
            {privateTicked && (
              <p role="note" className="rounded-[10px] border border-[var(--mp-accent)] bg-[#1D1A10] p-3 text-sm font-semibold leading-relaxed text-[var(--mp-accent)]">
                {text.rpPrivateWarn}
              </p>
            )}
          </fieldset>
        </form>

        {/* Rates table */}
        <section aria-labelledby="rp-rates" className="rounded-2xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-5 sm:p-7">
          <h2 id="rp-rates" className="mp-display text-xl font-bold">{text.rpRatesTitle}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[380px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="text-[13px] text-[var(--mp-muted)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">{text.rpPeriod}</th>
                  {CATEGORIES.map((c) => (
                    <th key={c} scope="col" className={`px-3 py-2 text-center font-semibold ${values.category === c ? "text-[var(--mp-accent)]" : ""}`}>
                      {categoryLabel[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BANDS.map((b) => (
                  <tr key={b} className="border-t border-[var(--mp-line)]">
                    <th scope="row" className={`py-2.5 pr-3 font-semibold ${result.band === b ? "text-[var(--mp-accent)]" : ""}`}>{bandLabel[b]}</th>
                    {CATEGORIES.map((c) => {
                      const active = result.band === b && values.category === c;
                      return (
                        <td
                          key={c}
                          className={`px-3 py-2.5 text-center font-bold ${active ? "rounded-md bg-[var(--mp-accent)] text-[var(--mp-on-accent)]" : ""}`}
                          data-active={active ? "true" : undefined}
                        >
                          {RATES[c][b]}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* --------------------------------------------------------------- RESULTS */}
      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4">
        <section
          id="rp-results-card"
          aria-labelledby="rp-results"
          aria-live="polite"
          className="flex flex-col gap-5 rounded-2xl border border-[var(--mp-accent)] bg-[var(--mp-card)] p-5 sm:p-7"
        >
          <h2 id="rp-results" className="sr-only">{text.rpResult}</h2>

          {!result.complete ? (
            <div className="flex flex-col gap-2">
              <p className="mp-display text-2xl font-bold">{text.rpPending}</p>
              <p data-testid="progress" className="text-[15px] text-[var(--mp-muted)]">{fieldsLeftText(lang, result.fieldsLeft)}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[var(--mp-muted)]">{text.rpResTax}</p>
              <p data-testid="tax" className="mp-display break-words text-4xl font-bold text-[var(--mp-accent)] sm:text-5xl">
                {formatRM(result.tax)}
              </p>
              {result.adjustedGain <= 0 ? (
                <p data-testid="note" className="text-sm text-[var(--mp-ink2)]">{text.rpLossNote}</p>
              ) : result.chargeableGain === 0 ? (
                <p data-testid="note" className="text-sm text-[var(--mp-ink2)]">{text.rpNoGain}</p>
              ) : null}
            </div>
          )}

          <dl className="divide-y divide-[var(--mp-line)] border-t border-[var(--mp-line)] pt-2">
            {row("category", text.rpResCategory, values.category ? categoryLabel[values.category] : "—")}
            {row(
              "holding",
              text.rpResHolding,
              result.holding ? holdingText(lang, result.holding.years, result.holding.months, result.holding.days) : "—",
              undefined,
              false,
              result.band ? bandLabel[result.band] : undefined
            )}
            {row("rate", text.rpResRate, `${result.rate}%`)}
            {row("disp", text.rpResDisp, formatRM(result.dispPrice))}
            {row("acq", text.rpResAcq, formatRM(result.acqPrice), "−")}
            {row("costs", text.rpResCosts, formatRM(result.totalCosts), "−")}
            {row("adjusted", text.rpResAdjusted, formatRM(result.adjustedGain), "=")}
            {row("exemption", text.rpResExemption, formatRM(result.exemption), "−", false, exemptionLabel)}
            {row("chargeable", text.rpResChargeable, formatRM(result.chargeableGain), "=")}
            {row("taxrow", text.rpResTax, formatRM(result.tax), "×", true, `${text.rpResChargeable} × ${result.rate}%`)}
          </dl>

          {result.complete && (
            <a
              href={waHref}
              className="flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-[var(--mp-whatsapp)] px-4 text-base font-extrabold text-[var(--mp-on-whatsapp)]"
            >
              <WhatsAppIcon size={22} />
              {text.rpWhatsapp}
            </a>
          )}
        </section>

        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">
          {text.rpDisclaimer}
        </p>
        <p className="rounded-xl border border-[var(--mp-line)] bg-[var(--mp-card)] p-4 text-sm leading-relaxed text-[var(--mp-muted)]">
          {text.rpRetention}
        </p>
      </div>

      {/* Phone only: keeps the answer in view while the fields are being filled in. */}
      <a
        href="#rp-results-card"
        data-testid="mobile-bar"
        className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-[var(--mp-accent)] bg-[var(--mp-paper)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {result.complete ? (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{text.rpResTax}</span>
            <span className="mp-display text-xl font-bold text-[var(--mp-accent)]">{formatRM(result.tax)}</span>
          </>
        ) : (
          <>
            <span className="text-xs text-[var(--mp-muted)]">{text.dsrMobileWait}</span>
            <span className="text-sm font-bold text-[var(--mp-accent)]">{fieldsLeftText(lang, result.fieldsLeft)}</span>
          </>
        )}
      </a>
    </div>
  );
}
