"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddSaleButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    deal_no: "",
    area: "",
    property: "",
    selling_price: "",
    banker: "",
    commission_rate: "",
    mark_up: "",
    gross_commission: "",
    net_commission: "",
    status: "",
    remarks: "",
    owner_lawyer: "",
    buyer_lawyer: "",
    referral: "",
    claim_month: "",
    claimed_amount: "",
    deal_type: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("deals").insert({
      year: Number(form.year),
      deal_no: form.deal_no || null,
      area: form.area || null,
      property: form.property,
      selling_price: form.selling_price
        ? Number(form.selling_price)
        : null,
      banker: form.banker || null,
      commission_rate: form.commission_rate
        ? Number(form.commission_rate)
        : null,
      mark_up: form.mark_up
        ? Number(form.mark_up)
        : null,
      gross_commission: form.gross_commission
        ? Number(form.gross_commission)
        : null,
      net_commission: form.net_commission
        ? Number(form.net_commission)
        : null,
      status: form.status || null,
      remarks: form.remarks || null,
      owner_lawyer: form.owner_lawyer || null,
      buyer_lawyer: form.buyer_lawyer || null,
      referral: form.referral || null,
      claim_month: form.claim_month || null,
      claimed_amount: form.claimed_amount
        ? Number(form.claimed_amount)
        : 0,
      deal_type: form.deal_type || null,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage("Failed to save deal.");
      return;
    }

    setMessage("Deal saved successfully.");

setTimeout(() => {
  setOpen(false);
  router.refresh();
}, 800);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        + Add Sale
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Add Sale
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Deal No.
                  </label>
                  <input
                    name="deal_no"
                    value={form.deal_no}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Area
                  </label>
                  <input
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Property
                  </label>
                  <input
                    name="property"
                    value={form.property}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="selling_price"
                    value={form.selling_price}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Banker
                  </label>
                  <input
                    name="banker"
                    value={form.banker}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Commission Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="commission_rate"
                    value={form.commission_rate}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mark Up
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="mark_up"
                    value={form.mark_up}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Gross Commission
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="gross_commission"
                    value={form.gross_commission}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Net Commission
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="net_commission"
                    value={form.net_commission}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <input
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Claim Month
                  </label>
                  <input
                    name="claim_month"
                    value={form.claim_month}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Claimed Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="claimed_amount"
                    value={form.claimed_amount}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Deal Type
                  </label>
                  <input
                    name="deal_type"
                    value={form.deal_type}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Owner Lawyer
                  </label>
                  <input
                    name="owner_lawyer"
                    value={form.owner_lawyer}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Buyer Lawyer
                  </label>
                  <input
                    name="buyer_lawyer"
                    value={form.buyer_lawyer}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Referral
                  </label>
                  <input
                    name="referral"
                    value={form.referral}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

              </div>

              {message && (
                <div className="rounded-lg border px-4 py-3 text-sm">
                  {message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Deal"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}