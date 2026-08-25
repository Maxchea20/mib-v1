"use client";

import { useMemo, useState } from "react";
import DeleteSaleButton from "@/components/sales/DeleteSaleButton";
import EditSaleButton from "@/components/sales/EditSaleButton";

type Props = {
  deals: any[];
};

export default function SalesList({ deals }: Props) {
  // Get all available years from the sales data
  const years = useMemo(() => {
    return Array.from(
      new Set(
        deals
          .map((deal) => Number(deal.year))
          .filter((year) => !isNaN(year))
      )
    ).sort((a, b) => b - a);
  }, [deals]);

  // Default to the latest year
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const activeYear = selectedYear ?? years[0];

  // Show only deals from the selected year
  const filteredDeals = useMemo(() => {
  if (!activeYear) return [];

  return deals
    .filter(
      (deal) => Number(deal.year) === Number(activeYear)
    )
    .sort(
      (a, b) => Number(a.deal_no) - Number(b.deal_no)
    );
}, [deals, activeYear]);

  const formatMoney = (value: any) => {
    const number = Number(value);

    if (isNaN(number)) {
      return "-";
    }

    return `RM ${number.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Sales List</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredDeals.length} deals in {activeYear || "-"}
          </p>
        </div>

        {/* Year Selector */}
        <select
          value={activeYear || ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-3 pr-4 font-semibold">Deal</th>
              <th className="py-3 pr-4 font-semibold">Area</th>
              <th className="py-3 pr-4 font-semibold">Property</th>
              <th className="py-3 pr-4 font-semibold text-right">
                Selling Price
              </th>
              <th className="py-3 pr-4 font-semibold text-right">
                Gross Commission
              </th>
              <th className="py-3 font-semibold">Status</th>
              <th className="py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDeals.map((deal, index) => (
              <tr
                key={`${deal.year}-${deal.deal_no}-${index}`}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="py-3 pr-4">
                  #{deal.deal_no ?? "-"}
                </td>

                <td className="py-3 pr-4">
                  {deal.area || "-"}
                </td>

                <td className="py-3 pr-4">
                  {deal.property || "-"}
                </td>

                <td className="py-3 pr-4 text-right whitespace-nowrap">
                  {formatMoney(deal.selling_price)}
                </td>

                <td className="py-3 pr-4 text-right whitespace-nowrap">
                  {formatMoney(deal.gross_commission)}
                </td>

                <td className="py-3">
                  {deal.remarks || deal.status || "-"}
                </td>
                <td className="py-3">
                   <EditSaleButton deal={deal} />
  <DeleteSaleButton id={deal.id} />
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredDeals.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No sales found for {activeYear || "this year"}.
        </div>
      )}
    </div>
  );
}