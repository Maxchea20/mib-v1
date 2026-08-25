"use client";

import ContactCard from "./ContactCard";
import { useState } from "react";

type Props = {
  buyers: any[];
};

export default function BuyerList({ buyers }: Props) {

  const [filter, setFilter] = useState<
    "all" | "buyer" | "owner" | "tenant"
  >("all");

  const filteredBuyers = buyers.filter((buyer) => {

    if (filter === "buyer") return buyer.is_buyer;

    if (filter === "owner") return buyer.is_owner;

    if (filter === "tenant") return buyer.is_tenant;

    return true;

  });

  return (

    <div className="space-y-4">

      <div className="space-y-3">

        <div className="flex flex-wrap gap-2">

          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("buyer")}
            className={`px-4 py-2 rounded-full ${
              filter === "buyer"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Buyers
          </button>

          <button
            onClick={() => setFilter("owner")}
            className={`px-4 py-2 rounded-full ${
              filter === "owner"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Owners
          </button>

          <button
            onClick={() => setFilter("tenant")}
            className={`px-4 py-2 rounded-full ${
              filter === "tenant"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Tenants
          </button>

        </div>

        <p className="text-gray-500">
          Total Contacts
          <span className="font-semibold ml-1">
            {filteredBuyers.length}
          </span>
        </p>

      </div>

      {filteredBuyers.length === 0 && (

        <div className="bg-white rounded-lg shadow border p-8 text-center text-gray-500">

          No Contact found.

        </div>

      )}

      {/* ONE COLUMN */}

      <div className="space-y-2">

        {filteredBuyers.map((buyer) => (

          <ContactCard
            key={buyer.id}
            buyer={buyer}
          />

        ))}

      </div>

    </div>

  );

}