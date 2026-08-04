import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {

  const [
    contactsResult,
    listingsResult,
    buyersResult,
    draftResult,
  ] = await Promise.all([

    supabase
      .from("buyers")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("properties")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("buyers")
      .select("*", { count: "exact", head: true })
      .eq("purpose", "Buy"),

    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "Draft"),

  ]);

  const totalContacts =
    contactsResult.count ?? 0;

  const totalListings =
    listingsResult.count ?? 0;

  const totalBuyers =
    buyersResult.count ?? 0;

  const draftListings =
    draftResult.count ?? 0;

  return (

    <div className="rounded-xl bg-white p-8 shadow">

      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p className="mt-3 text-slate-600">
        Welcome back, Max.
      </p>

    </div>

  );

}