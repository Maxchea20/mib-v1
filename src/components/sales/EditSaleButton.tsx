"use client";

import { useState } from "react";
import SaleForm from "./SaleForm";

type Props = {
  deal: any;
};

export default function EditSaleButton({ deal }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
      >
        Edit
      </button>

      {open && <SaleForm deal={deal} onClose={() => setOpen(false)} />}
    </>
  );
}
