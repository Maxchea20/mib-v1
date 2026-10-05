"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  deal?: any;
  onClose: () => void;
};

const inputClass = "w-full rounded-lg border px-3 py-2";

const num = (v: string | number) => (v === "" ? null : Number(v));

function claimMonthOptions(current: string) {
  const now = new Date();
  const options: { value: string; label: string }[] = [];

  // Last 6 months to next 12, so past claims can be logged too.
  for (let i = -6; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-MY", { month: "long", year: "numeric" }),
    });
  }

  // Keep whatever is already saved selectable (e.g. older "Oct" values).
  if (current && !options.some((o) => o.value === current)) {
    options.unshift({ value: current, label: current });
  }

  return options;
}

export default function SaleForm({ deal, onClose }: Props) {
  const router = useRouter();
  const editing = Boolean(deal);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showMore, setShowMore] = useState(false);
  // Gross follows price x rate until the user types their own figure.
  const [grossTouched, setGrossTouched] = useState(
    Boolean(Number(deal?.gross_commission))
  );

  const [form, setForm] = useState({
    year: deal?.year ?? new Date().getFullYear(),
    deal_type: deal?.deal_type ?? "",
    property: deal?.property ?? "",
    selling_price: deal?.selling_price ?? "",
    commission_rate: deal?.commission_rate ?? "",
    gross_commission: deal?.gross_commission ?? "",
    claim_month: deal?.claim_month ?? "",
    remarks: deal?.remarks ?? "Pending",
    area: deal?.area ?? "",
    banker: deal?.banker ?? "",
    mark_up: deal?.mark_up ?? "",
    net_commission: deal?.net_commission ?? "",
    status: deal?.status ?? "",
    owner_lawyer: deal?.owner_lawyer ?? "",
    buyer_lawyer: deal?.buyer_lawyer ?? "",
    referral: deal?.referral ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "gross_commission") {
        setGrossTouched(value !== "");
      } else if (
        (name === "selling_price" || name === "commission_rate") &&
        (!grossTouched || value === "")
      ) {
        const auto =
          ((Number(next.selling_price) || 0) *
            (Number(next.commission_rate) || 0)) /
          100;
        if (!grossTouched) {
          next.gross_commission = auto > 0 ? auto.toFixed(2) : "";
        }
      }

      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const fields = {
      year: Number(form.year),
      area: form.area || null,
      property: form.property,
      selling_price: num(form.selling_price),
      banker: form.banker || null,
      commission_rate: num(form.commission_rate),
      mark_up: num(form.mark_up),
      gross_commission: num(form.gross_commission),
      net_commission: num(form.net_commission),
      status: form.status || null,
      remarks: form.remarks || null,
      owner_lawyer: form.owner_lawyer || null,
      buyer_lawyer: form.buyer_lawyer || null,
      referral: form.referral || null,
      claim_month: form.claim_month || null,
      deal_type: form.deal_type || null,
    };

    let error;

    if (editing) {
      ({ error } = await supabase
        .from("deals")
        .update(fields)
        .eq("id", deal.id));
    } else {
      const { data: existing, error: lookupError } = await supabase
        .from("deals")
        .select("deal_no")
        .eq("year", fields.year);

      if (lookupError) {
        console.error(lookupError);
        setSaving(false);
        setMessage("Unable to determine the next Deal No.");
        return;
      }

      const nextDealNo =
        (existing || [])
          .map((d) => Number(String(d.deal_no ?? "").replace(/\D/g, "")))
          .filter((n) => Number.isFinite(n))
          .reduce((max, n) => Math.max(max, n), 0) + 1;

      ({ error } = await supabase.from("deals").insert({
        ...fields,
        deal_no: String(nextDealNo),
        claimed_amount: 0,
      }));
    }

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage(editing ? "Failed to update deal." : "Failed to save deal.");
      return;
    }

    setMessage(editing ? "Deal updated." : "Deal saved.");
    setTimeout(() => {
      onClose();
      router.refresh();
    }, 600);
  };

  const remarksOptions = ["Pending", "Claimed"];
  if (form.remarks && !remarksOptions.includes(form.remarks)) {
    remarksOptions.push(form.remarks);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editing ? "Edit Sale" : "Add Sale"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Deal Type">
              <select
                name="deal_type"
                value={form.deal_type}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select</option>
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
              </select>
            </Field>

            <Field label="Property">
              <input
                name="property"
                value={form.property}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Selling Price">
              <input
                type="number"
                step="0.01"
                name="selling_price"
                value={form.selling_price}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Commission Rate (%)">
              <input
                type="number"
                step="0.01"
                name="commission_rate"
                value={form.commission_rate}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Gross Commission (auto, editable)">
              <input
                type="number"
                step="0.01"
                name="gross_commission"
                value={form.gross_commission}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Claim Month">
              <select
                name="claim_month"
                value={form.claim_month}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Not set</option>
                {claimMonthOptions(form.claim_month).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Claimed?">
              <select
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className={inputClass}
              >
                {remarksOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Year">
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            {showMore ? "− Hide details" : "+ More details"}
          </button>

          {showMore && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(
                [
                  ["area", "Area"],
                  ["banker", "Banker"],
                  ["mark_up", "Mark Up", "number"],
                  ["net_commission", "Net Commission", "number"],
                  ["status", "Status"],
                  ["owner_lawyer", "Owner Lawyer"],
                  ["buyer_lawyer", "Buyer Lawyer"],
                  ["referral", "Referral"],
                ] as [keyof typeof form, string, string?][]
              ).map(([name, label, type]) => (
                <Field key={name} label={label}>
                  <input
                    type={type ?? "text"}
                    step={type === "number" ? "0.01" : undefined}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          )}

          {message && (
            <div className="rounded-lg border px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Save Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
