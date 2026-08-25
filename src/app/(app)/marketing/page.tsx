// File: src/app/(app)/marketing/page.tsx

export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import MarketingListingSelector from "@/components/marketing/MarketingListingSelector";

export default async function MarketingPage() {
  const { data: listings, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_photos (
        photo_type,
        image_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Marketing listings error:", error);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-black">
          📣 Marketing
        </h1>

        <p className="text-gray-500 mt-2">
          Select a listing to create and publish marketing content.
        </p>

      </div>

      {/* LISTING SELECTOR */}

      <MarketingListingSelector
        listings={listings ?? []}
      />

    </div>
  );
}