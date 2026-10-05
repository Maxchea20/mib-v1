"use client";

import { useMemo } from "react";
import {
  formatMoney,
  getClaimed,
  getGross,
  getLatestYear,
  getNet,
} from "@/lib/sales";

type Props = {
  deals: any[];
};

export default function KPISection({
  deals,
}: Props) {
  // KPIs default to the latest sales year in the database.
  const latestYear = useMemo(() => getLatestYear(deals), [deals]);

  const yearDeals = useMemo(
    () => deals.filter((deal) => Number(deal.year) === latestYear),
    [deals, latestYear]
  );

  const grossList = yearDeals.map(getGross);
  const gross = grossList.reduce((sum, v) => sum + v, 0);
  const net = yearDeals.reduce((sum, deal) => sum + getNet(deal), 0);
  const dealCount = yearDeals.length;

  const commissions = grossList.filter((v) => v > 0);
  const highest = commissions.length ? Math.max(...commissions) : 0;
  const lowest = commissions.length ? Math.min(...commissions) : 0;
  const average = commissions.length
    ? commissions.reduce((sum, v) => sum + v, 0) / commissions.length
    : 0;

  const claimed = yearDeals.reduce((sum, deal) => sum + getClaimed(deal), 0);
  const potential = Math.max(gross - claimed, 0);

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