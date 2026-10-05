"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  MONTHS as months,
  formatMoney,
  getGross,
  parseClaimMonth,
} from "@/lib/sales";

type Props = {
  deals: any[];
};

const colors = [
  "#2563EB", // Blue
  "#EF4444", // Red
  "#22C55E", // Green
  "#A855F7", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#EAB308", // Yellow
  "#EC4899", // Pink
];

export default function MonthlyChart({
  deals,
}: Props) {

  // Find all available years
  const years = Array.from(
    new Set(
      deals
        .map((d) => Number(d.year))
        .filter((y) => !isNaN(y))
    )
  ).sort();

  // Create Jan-Dec rows
  const chartData = months.map((month) => {
    const row: any = {
      month,
    };

    years.forEach((year) => {
      row[year] = 0;
    });

    return row;
  });

  // Sum gross commission into month/year. The year line is the deal's
  // year (same as the yearly chart and KPIs); the claim month only picks
  // the point on the line. Deals with no usable claim month are totalled
  // separately so the chart still reconciles with the other numbers.
  let unscheduled = 0;

  deals.forEach((deal) => {
    const year = Number(deal.year);
    if (isNaN(year)) return;

    const claim = parseClaimMonth(deal.claim_month);

    if (!claim) {
      unscheduled += getGross(deal);
      return;
    }

    chartData[claim.month][year] += getGross(deal);
  });

  return (

    <div className="bg-white rounded-xl border shadow-sm p-6">

      <h2 className="text-xl font-bold mb-6">

        Monthly Gross Commission Comparison

      </h2>

      <div className="h-96">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 10,
            }}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip
              formatter={(value: any) => [
                `RM ${Number(value).toLocaleString()}`,
                "Gross Commission",
              ]}
            />

            <Legend />

            {years.map((year, index) => (

              <Line
                key={year}
                type="monotone"
                dataKey={String(year)}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />

            ))}

          </LineChart>

        </ResponsiveContainer>

      </div>

      {unscheduled > 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Not shown (no claim month set): {formatMoney(unscheduled)}
        </p>
      )}

    </div>

  );

}