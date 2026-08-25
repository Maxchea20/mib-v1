"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Props = {
  deals: any[];
};

export default function YearlyChart({
  deals,
}: Props) {

  const yearlyMap = new Map<number, number>();

  deals.forEach((deal) => {

    const year = Number(deal.year);

    const gross =
      Number(deal.gross_commission) || 0;

    yearlyMap.set(
      year,
      (yearlyMap.get(year) || 0) + gross
    );

  });

  const chartData = [...yearlyMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, gross]) => ({
      year,
      gross,
    }));

  return (

    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-bold mb-6">

        Gross Commission by Year

      </h2>

      <div className="h-80">

        <ResponsiveContainer>

          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="year" />

            <YAxis />

            <Tooltip
              formatter={(value: any) => [
                `RM ${Number(value).toLocaleString()}`,
                "Gross",
              ]}
            />

            <Bar
  dataKey="gross"
  fill="#2563EB"
  radius={[8, 8, 0, 0]}
/>

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}