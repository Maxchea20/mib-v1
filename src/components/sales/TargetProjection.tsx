"use client";

import { useMemo } from "react";
import { formatMoney, getGross, getLatestYear } from "@/lib/sales";

type Props = {
  deals: any[];
};

const TARGET = 200000;

export default function TargetProjection({ deals }: Props) {
  const latestYear = useMemo(() => getLatestYear(deals), [deals]);

  const yearDeals = useMemo(
    () => deals.filter((deal) => Number(deal.year) === latestYear),
    [deals, latestYear]
  );

  const gross = useMemo(
    () => yearDeals.reduce((sum, deal) => sum + getGross(deal), 0),
    [yearDeals]
  );

  const currentMonth = new Date().getMonth() + 1;

  const progress = Math.min(
    (gross / TARGET) * 100,
    100
  );

  const remaining = Math.max(
    TARGET - gross,
    0
  );

  const monthlyAverage =
    currentMonth > 0
      ? gross / currentMonth
      : 0;

  const projectedGross =
    monthlyAverage * 12;

  const projectedProgress =
    (projectedGross / TARGET) * 100;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-black">
            Target Projection
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {latestYear} Gross Commission Target
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Annual Target
          </p>

          <p className="text-xl font-bold text-black">
            {formatMoney(TARGET)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Metric
          title="Current Gross"
          value={formatMoney(gross)}
        />

        <Metric
          title="Remaining"
          value={formatMoney(remaining)}
        />

        <Metric
          title="Progress"
          value={`${progress.toFixed(1)}%`}
        />

        <Metric
          title="Projected Year-End"
          value={formatMoney(projectedGross)}
        />

      </div>

      <div className="mt-6">

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">
            Target Progress
          </span>

          <span className="font-medium text-black">
            {progress.toFixed(1)}%
          </span>
        </div>

        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">

          <div
            className="h-full bg-black transition-all"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">
            Monthly Average
          </p>

          <p className="mt-1 text-xl font-bold text-black">
            {formatMoney(monthlyAverage)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">
            Projected Target Progress
          </p>

          <p className="mt-1 text-xl font-bold text-black">
            {projectedProgress.toFixed(1)}%
          </p>
        </div>

      </div>

    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-black">
        {value}
      </p>

    </div>
  );
}

