export const dynamic = "force-dynamic";

import Link from "next/link";
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

  const { data: recentContacts } =
    await supabase
      .from("buyers")
      .select("id,name,status")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

  const { data: recentListings } =
    await supabase
      .from("properties")
      .select("id,title,status,price")
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

  return (

    <div className="space-y-8">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-black">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Welcome back, Max.
        </p>

      </div>

      {/* KPI Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500 text-sm">
            Contacts
          </p>

          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {totalContacts}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500 text-sm">
            Listings
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {totalListings}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500 text-sm">
            Active Buyers
          </p>

          <h2 className="text-3xl font-bold text-purple-600 mt-2">
            {totalBuyers}
          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <p className="text-gray-500 text-sm">
            Draft Listings
          </p>

          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {draftListings}
          </h2>

        </div>

      </div>

      {/* Recent */}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Contacts */}

        <div className="bg-white rounded-xl shadow">

          <div className="border-b px-6 py-4">

            <h2 className="text-xl font-bold">
              Recent Contacts
            </h2>

          </div>

          <div className="divide-y">

            {recentContacts?.map((contact) => (

              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50"
              >

                <div>

                  <p className="font-semibold text-black">
                    {contact.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {contact.status}
                  </p>

                </div>

              </Link>

            ))}

          </div>

        </div>

        {/* Recent Listings */}

        <div className="bg-white rounded-xl shadow">

          <div className="border-b px-6 py-4">

            <h2 className="text-xl font-bold">
              Recent Listings
            </h2>

          </div>

          <div className="divide-y">

            {recentListings?.map((listing) => (

              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50"
              >

                <div>

                  <p className="font-semibold text-black">
                    {listing.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    {listing.status}
                  </p>

                </div>

                <p className="font-bold text-green-600">
                  RM {Number(
                    listing.price
                  ).toLocaleString()}
                </p>

              </Link>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}