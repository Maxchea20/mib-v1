export const dynamic = "force-dynamic";

import ListingList from "@/components/listings/ListingList";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ListingsPage() {
  const { data: listings } = await supabase
  .from("properties")
  .select(`
    *,
    property_photos (
      photo_type,
      image_url
    )
  `)
  .order("created_at", { ascending: false });

  return (
    <div className="page-wrap">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <p className="label-caption">Inventory</p>
          <h1 className="text-3xl sm:text-4xl font-display">
            Listings
          </h1>
        </div>
        <Link href="/listings/new" className="btn-primary">
          Add listing
        </Link>
      </div>

      {listings?.length === 0 && (
        <p className="text-gray-500">
          No listings found.
        </p>
      )}

      <ListingList listings={listings ?? []} />
    </div>
  );
}
