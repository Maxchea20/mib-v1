// File: src/components/buyers/BuyerList.tsx

"use client";

import Link from "next/link";
import DeleteBuyerButton from "@/components/DeleteBuyerButton";

type Props = {
  buyers: any[];
};

export default function BuyerList({
  buyers,
}: Props) {

  return (

    <div className="space-y-4">

      <p className="text-gray-500">

        Total Contacts
        <span className="font-semibold ml-1">
          {buyers.length}
        </span>

      </p>

      {buyers.length === 0 && (

        <div className="bg-white rounded-lg shadow border p-8 text-center text-gray-500">

          No Contact found.

        </div>

      )}

      {buyers.map((buyer) => (

        <div
          key={buyer.id}
          className="bg-white border rounded-lg shadow-sm p-5"
        >

          <div className="flex justify-between items-start">

            <div>

              <h2 className="text-2xl font-bold text-black">
                {buyer.name}
              </h2>

              <p className="text-gray-600 mt-2">
                📞 {buyer.phone}
              </p>

              <div className="mt-3 space-y-1">

                <p className="text-gray-700">
                  Category: {buyer.category || "-"}
                </p>

                <p className="text-gray-700">
                  Budget:
                  {buyer.budget
                    ? ` RM ${Number(
                        buyer.budget
                      ).toLocaleString()}`
                    : " -"}
                </p>

                <p className="text-gray-700">
                  Status: {buyer.status}
                </p>

              </div>

            </div>

            <div className="flex gap-2">

              <Link
  href={`/contacts/${buyer.id}`}
  className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded"
>
  View
</Link>

              <DeleteBuyerButton
                id={buyer.id}
                name={buyer.name}
              />

            </div>

          </div>

        </div>

      ))}

    </div>

  );

}