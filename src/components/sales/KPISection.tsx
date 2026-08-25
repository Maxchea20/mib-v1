"use client";

import { useMemo } from "react";

type Props = {
  deals: any[];
};

export default function KPISection({
  deals,
}: Props) {
  /*
   * Get the latest year available in the database.
   * This means the KPI section defaults to the latest
   * sales year automatically.
   */
  const latestYear = useMemo(() => {
    const years = deals
      .map((deal) => Number(deal.year))
      .filter((year) => !isNaN(year));

    return years.length
      ? Math.max(...years)
      : new Date().getFullYear();
  }, [deals]);

  /*
   * Only calculate KPIs for the latest year.
   */
  const yearDeals = useMemo(() => {
    return deals.filter(
      (deal) => Number(deal.year) === latestYear
    );
  }, [deals, latestYear]);

  /*
   * Gross commission
   */
  const gross = yearDeals.reduce((sum, deal) => {
    const grossCommission =
      Number(deal.gross_commission);

    if (
      !isNaN(grossCommission) &&
      grossCommission > 0
    ) {
      return sum + grossCommission;
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

  /*
   * Net commission
   */
  const net = yearDeals.reduce((sum, deal) => {
    const netCommission =
      Number(deal.net_commission);

    if (
      !isNaN(netCommission) &&
      netCommission > 0
    ) {
      return sum + netCommission;
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

  /*
   * Number of deals
   */
  const dealCount = yearDeals.length;

  /*
   * Gross commission for individual deals.
   *
   * We use the stored gross_commission first.
   * If it doesn't exist, calculate it from
   * selling price × commission rate.
   */
  const commissions = yearDeals
    .map((deal) => {
      const storedGross =
        Number(deal.gross_commission);

      if (
        !isNaN(storedGross) &&
        storedGross > 0
      ) {
        return storedGross;
      }

      const sellingPrice =
        Number(deal.selling_price) || 0;

      const commissionRate =
        Number(deal.commission_rate) || 0;

      return (
        (sellingPrice * commissionRate) / 100
      );
    })
    .filter((value) => value > 0);

  /*
   * Highest commission
   */
  const highest =
    commissions.length > 0
      ? Math.max(...commissions)
      : 0;

  /*
   * Lowest commission
   */
  const lowest =
    commissions.length > 0
      ? Math.min(...commissions)
      : 0;

  /*
   * Average commission
   */
  const average =
    commissions.length > 0
      ? commissions.reduce(
          (sum, value) => sum + value,
          0
        ) / commissions.length
      : 0;

  /*
   * Claimed amount
   */
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

  /*
   * Potential / unclaimed commission
   */
  const potential = Math.max(
    gross - claimed,
    0
  );

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">
          {latestYear} Performance
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Card
          title="Gross Commission"
          value={formatMoney(gross)}
        />

        <Card
          title="Net Commission"
          value={formatMoney(net)}
        />

        <Card
          title="Deals"
          value={dealCount}
        />

        <Card
          title="Claimed"
          value={formatMoney(claimed)}
        />

        <Card
          title="Potential"
          value={formatMoney(potential)}
        />

        <Card
          title="Highest Commission"
          value={formatMoney(highest)}
        />

        <Card
          title="Lowest Commission"
          value={formatMoney(lowest)}
        />

        <Card
          title="Average Commission"
          value={formatMoney(average)}
        />

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

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-black">
        {value}
      </h2>

    </div>
  );
}