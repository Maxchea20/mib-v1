export const dynamic = "force-dynamic";

import Link from "next/link";
import { Users, Building2, UserCheck, FileEdit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MatchedListings from "@/components/dashboard/MatchedListings";
import Card, { CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const CURRENT_YEAR = new Date().getFullYear();

export default async function DashboardPage() {
  const [contactsResult, listingsResult, buyersResult, draftResult, dealsResult] =
    await Promise.all([
      supabase.from("buyers").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase
        .from("buyers")
        .select("*", { count: "exact", head: true })
        .eq("purpose", "Buy"),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("status", "Draft"),
      supabase.from("deals").select("*").eq("year", CURRENT_YEAR),
    ]);

  const totalContacts = contactsResult.count ?? 0;
  const totalListings = listingsResult.count ?? 0;
  const totalBuyers = buyersResult.count ?? 0;
  const draftListings = draftResult.count ?? 0;

  const salesTarget = 200000;

  const grossCommission = (dealsResult.data ?? []).reduce((sum, deal) => {
    const gross = Number(deal.gross_commission);
    if (!isNaN(gross) && gross > 0) return sum + gross;
    const sellingPrice = Number(deal.selling_price) || 0;
    const commissionRate = Number(deal.commission_rate) || 0;
    return sum + (sellingPrice * commissionRate) / 100;
  }, 0);

  const remainingToTarget = Math.max(salesTarget - grossCommission, 0);
  const targetProgress =
    salesTarget > 0 ? Math.min((grossCommission / salesTarget) * 100, 100) : 0;

  const { data: recentContacts } = await supabase
    .from("buyers")
    .select("id,name,status")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentListings } = await supabase
    .from("properties")
    .select("id,title,status,price")
    .order("created_at", { ascending: false })
    .limit(5);

  const formatMoney = (value: number) =>
    `RM ${value.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const progressGlow =
    targetProgress >= 100
      ? "bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.6)]"
      : targetProgress >= 50
      ? "bg-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.6)]"
      : "bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.6)]";

  const kpis = [
    { label: "Contacts", value: totalContacts, icon: Users },
    { label: "Listings", value: totalListings, icon: Building2 },
    { label: "Active Buyers", value: totalBuyers, icon: UserCheck },
    { label: "Draft Listings", value: draftListings, icon: FileEdit },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="label-caption mb-1">MIB / DASHBOARD</p>
        <h1 className="text-xl font-semibold text-[#e7ecf3]">
          Welcome back, Max
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="label-caption">{kpi.label}</p>
              <kpi.icon size={15} className="text-[#5a6472]" />
            </div>
            <p className="font-data text-3xl font-semibold text-[#e7ecf3]">
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Sales Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="label-caption">
            {CURRENT_YEAR} SALES PERFORMANCE / TARGET TRACKING
          </p>
          <span className="font-data text-sm font-semibold text-[#22d3ee]">
            {targetProgress.toFixed(1)}%
          </span>
        </div>

        <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all ${progressGlow}`}
            style={{ width: `${targetProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="label-caption mb-1.5">Gross Commission</p>
            <p className="font-data text-lg font-semibold text-[#e7ecf3]">
              {formatMoney(grossCommission)}
            </p>
          </div>
          <div>
            <p className="label-caption mb-1.5">Target</p>
            <p className="font-data text-lg font-semibold text-[#e7ecf3]">
              {formatMoney(salesTarget)}
            </p>
          </div>
          <div>
            <p className="label-caption mb-1.5">Remaining</p>
            <p className="font-data text-lg font-semibold text-[#fbbf24]">
              {formatMoney(remainingToTarget)}
            </p>
          </div>
        </div>
      </Card>

      {/* Matched Listings & Buyers */}
      <MatchedListings />

      {/* Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader caption="RECENT ACTIVITY" title="Recent Contacts" />
          <div className="divide-y divide-[#1e2733]">
            {recentContacts?.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex justify-between items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <p className="font-medium text-[#e7ecf3]">{contact.name}</p>
                {contact.status && (
                  <Badge status={contact.status}>{contact.status}</Badge>
                )}
              </Link>
            ))}
            {(!recentContacts || recentContacts.length === 0) && (
              <div className="px-6 py-8 text-center text-[#5a6472] text-sm">
                No contacts yet.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader caption="RECENT ACTIVITY" title="Recent Listings" />
          <div className="divide-y divide-[#1e2733]">
            {recentListings?.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex justify-between items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <p className="font-medium text-[#e7ecf3]">{listing.title}</p>
                  {listing.status && (
                    <Badge status={listing.status} className="mt-1">
                      {listing.status}
                    </Badge>
                  )}
                </div>
                <p className="font-data font-semibold text-[#e7ecf3]">
                  RM {Number(listing.price).toLocaleString()}
                </p>
              </Link>
            ))}
            {(!recentListings || recentListings.length === 0) && (
              <div className="px-6 py-8 text-center text-[#5a6472] text-sm">
                No listings yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}