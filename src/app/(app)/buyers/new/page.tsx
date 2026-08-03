// File: src/app/(app)/buyers/new/page.tsx

import Link from "next/link";
import BuyerForm from "@/components/buyers/BuyerForm";

export default function NewBuyerPage() {

  return (

    <div className="max-w-5xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-black">
          Add Buyer
        </h1>

        <Link
          href="/buyers"
          className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded"
        >
          Back
        </Link>

      </div>

      <BuyerForm
        mode="create"
      />

    </div>

  );

}