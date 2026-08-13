"use client";

import { useMemo } from "react";

type Props = {
  deals: any[];
};

export default function ClaimStatus({ deals }: Props) {
  const latestYear = useMemo(() => {
    const years = deals
      .map((deal) => Number(deal.year))
      .filter((year) => !isNaN(year));

    return years.length
      ? Math.max(...years)
      : new Date().getFullYear();
  }, [deals]);

  const yearDeals = useMemo(() => {
    return deals.filter(
      (deal) => Number(deal.year) === latestYear
    );
  }, [deals, latestYear]);

  const gross = yearDeals.reduce((sum, deal) => {
    const storedGross =
      Number(deal.gross_commission);

    if (
      !isNaN(storedGross) &&
      storedGross > 0
    ) {
      return sum + storedGross;
    }

    const sellingPrice =
      Number(deal.selling_price) || 0;

    const commissionRate =
      Number(deal.commission_rate) || 0;

    return (
      sum +
      (sellingPrice * commissionRate) / 100
    );
  }, 0);

  const claimed = yearDeals.reduce(
    (sum, deal) => {
      const remarks = String(
        deal.remarks ?? ""
      ).toLowerCase().trim();

      const grossCommission =
        Number(deal.gross_commission) || 0;

      if (remarks === "claimed") {
        return sum + grossCommission;
      }

      return sum;
    },
    0
  );

  const potential = Math.max(
    gross - claimed,
    0
  );

  const claimedPercent =
    gross > 0
      ? (claimed / gross) * 100
      : 0;

  const potentialPercent =
    gross > 0
      ? (potential / gross) * 100
      : 0;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-black">
            Claim Status
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {latestYear} Gross Commission
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <p className="text-sm text-gray-500">
            Claimed
          </p>

          <p className="mt-1 text-2xl font-bold text-black">
            {formatMoney(claimed)}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {claimedPercent.toFixed(1)}%
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Potential / Unclaimed
          </p>

          <p className="mt-1 text-2xl font-bold text-black">
            {formatMoney(potential)}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {potentialPercent.toFixed(1)}%
          </p>
        </div>

      </div>

      <div className="mt-6">

        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">

          <div
            className="h-full bg-black transition-all"
            style={{
              width: `${claimedPercent}%`,
            }}
          />

        </div>

        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>
            Claimed
          </span>

          <span>
            Potential
          </span>
        </div>

      </div>

    </div>
  );
}

function formatMoney(value: number) {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}