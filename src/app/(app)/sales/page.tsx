export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

import KPISection from "@/components/sales/KPISection";
import YearlyChart from "@/components/sales/YearlyChart";
import MonthlyChart from "@/components/sales/MonthlyChart";
import SalesList from "@/components/sales/SalesList";
import AddSaleButton from "@/components/sales/AddSaleButton";
import ClaimStatus from "@/components/sales/ClaimStatus";
import TargetProjection from "@/components/sales/TargetProjection";

export default async function SalesPage() {
  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .order("year", { ascending: false });

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">
          Sales
        </h1>
        <AddSaleButton />
      </div>

      <KPISection deals={deals ?? []} />

      <ClaimStatus deals={deals ?? []} />

      <TargetProjection deals={deals ?? []} />

      <YearlyChart deals={deals ?? []} />

      <MonthlyChart deals={deals ?? []} />

      <SalesList deals={deals ?? []} />

    </div>
  );
}