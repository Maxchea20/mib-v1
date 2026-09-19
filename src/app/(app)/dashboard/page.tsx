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
      ? "bg-[#1f4d2c]"
      : targetProgress >= 50
      ? "bg-[#9a4b24]"
      : "bg-[#b45309]";

  const kpis = [
    { label: "Contacts", value: totalContacts, icon: Users },
    { label: "Listings", value: totalListings, icon: Building2 },
    { label: "Active Buyers", value: totalBuyers, icon: UserCheck },
    { label: "Draft Listings", value: draftListings, icon: FileEdit },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="label-caption mb-1">MIB / Dashboard</p>
        <h1 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
          Welcome back, Max
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="label-caption">{kpi.label}</p>
              <kpi.icon size={15} className="text-[var(--ink-muted)]" />
            </div>
            <p className="font-data text-3xl font-semibold text-[var(--ink)]">
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="label-caption">
            {CURRENT_YEAR} sales performance / target tracking
          </p>
          <span className="font-data text-sm font-semibold text-[var(--copper)]">
            {targetProgress.toFixed(1)}%
          </span>
        </div>

        <div className="w-full bg-[#e8dfd0] rounded-full h-1.5 overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all ${progressGlow}`}
            style={{ width: `${targetProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="label-caption mb-1.5">Gross Commission</p>
            <p className="font-data text-lg font-semibold text-[var(--ink)]">
              {formatMoney(grossCommission)}
            </p>
          </div>
          <div>
            <p className="label-caption mb-1.5">Target</p>
            <p className="font-data text-lg font-semibold text-[var(--ink)]">
              {formatMoney(salesTarget)}
            </p>
          </div>
          <div>
            <p className="label-caption mb-1.5">Remaining</p>
            <p className="font-data text-lg font-semibold text-[var(--copper)]">
              {formatMoney(remainingToTarget)}
            </p>
          </div>
        </div>
      </Card>

      <MatchedListings />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader caption="RECENT ACTIVITY" title="Recent Contacts" />
          <div className="divide-y divide-[var(--line)]">
            {recentContacts?.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex justify-between items-center px-6 py-4 hover:bg-[#f3eee6] transition-colors"
              >
                <p className="font-medium text-[var(--ink)]">{contact.name}</p>
                {contact.status && (
                  <Badge status={contact.status}>{contact.status}</Badge>
                )}
              </Link>
            ))}
            {(!recentContacts || recentContacts.length === 0) && (
              <div className="px-6 py-8 text-center text-[var(--ink-muted)] text-sm">
                No contacts yet.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader caption="RECENT ACTIVITY" title="Recent Listings" />
          <div className="divide-y divide-[var(--line)]">
            {recentListings?.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex justify-between items-center px-6 py-4 hover:bg-[#f3eee6] transition-colors"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{listing.title}</p>
                  {listing.status && (
                    <Badge status={listing.status} className="mt-1">
                      {listing.status}
                    </Badge>
                  )}
                </div>
                <p className="font-data font-semibold text-[var(--ink)]">
                  RM {Number(listing.price).toLocaleString()}
                </p>
              </Link>
            ))}
            {(!recentListings || recentListings.length === 0) && (
              <div className="px-6 py-8 text-center text-[var(--ink-muted)] text-sm">
                No listings yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
