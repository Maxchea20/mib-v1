// File: src/components/sales/SalesList.tsx
"use client";

import { useMemo, useState } from "react";
import DeleteSaleButton from "@/components/sales/DeleteSaleButton";
import EditSaleButton from "@/components/sales/EditSaleButton";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

type Props = {
  deals: any[];
};

export default function SalesList({ deals }: Props) {
  const years = useMemo(() => {
    return Array.from(
      new Set(deals.map((deal) => Number(deal.year)).filter((year) => !isNaN(year)))
    ).sort((a, b) => b - a);
  }, [deals]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const activeYear = selectedYear ?? years[0];

  const filteredDeals = useMemo(() => {
    if (!activeYear) return [];
    return deals
      .filter((deal) => Number(deal.year) === Number(activeYear))
      .sort((a, b) => Number(a.deal_no) - Number(b.deal_no));
  }, [deals, activeYear]);

  const totals = useMemo(() => {
    return filteredDeals.reduce(
      (acc, deal) => {
        acc.selling += Number(deal.selling_price) || 0;
        acc.commission += Number(deal.gross_commission) || 0;
        return acc;
      },
      { selling: 0, commission: 0 }
    );
  }, [filteredDeals]);

  const formatMoney = (value: any) => {
    const number = Number(value);
    if (isNaN(number)) return "-";
    return `RM ${number.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card>
      <CardHeader
        title="Sales list"
        subtitle={`${filteredDeals.length} deals in ${activeYear || "-"}`}
        action={
          <select
            value={activeYear || ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        }
      />

      {/* TOTALS SUMMARY */}
      <div className="grid grid-cols-2 gap-3 px-6 pt-5">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Total selling price</p>
          <p className="text-xl font-semibold text-slate-900">
            {formatMoney(totals.selling)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Total commission</p>
          <p className="text-xl font-semibold text-slate-900">
            {formatMoney(totals.commission)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto px-6 py-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-3 pr-4 font-medium">Deal</th>
              <th className="py-3 pr-4 font-medium">Area</th>
              <th className="py-3 pr-4 font-medium">Property</th>
              <th className="py-3 pr-4 font-medium text-right">Selling price</th>
              <th className="py-3 pr-4 font-medium text-right">Gross commission</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal, index) => (
              <tr
                key={`${deal.year}-${deal.deal_no}-${index}`}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
              >
                <td className="py-3 pr-4 text-slate-900">#{deal.deal_no ?? "-"}</td>
                <td className="py-3 pr-4 text-slate-600">{deal.area || "-"}</td>
                <td className="py-3 pr-4 text-slate-600">{deal.property || "-"}</td>
                <td className="py-3 pr-4 text-right whitespace-nowrap text-slate-900">
                  {formatMoney(deal.selling_price)}
                </td>
                <td className="py-3 pr-4 text-right whitespace-nowrap text-slate-900">
                  {formatMoney(deal.gross_commission)}
                </td>
                <td className="py-3">
                  {deal.remarks || deal.status ? (
                    <Badge status={deal.status}>{deal.remarks || deal.status}</Badge>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    <EditSaleButton deal={deal} />
                    <DeleteSaleButton id={deal.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDeals.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            No sales found for {activeYear || "this year"}.
          </div>
        )}
      </div>
    </Card>
  );
}
