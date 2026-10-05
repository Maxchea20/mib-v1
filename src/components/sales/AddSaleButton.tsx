"use client";

import { useState } from "react";
import SaleForm from "./SaleForm";

export default function AddSaleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        + Add Sale
      </button>

      {open && <SaleForm onClose={() => setOpen(false)} />}
    </>
  );
}
