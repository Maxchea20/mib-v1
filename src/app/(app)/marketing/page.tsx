// File: src/app/(app)/marketing/page.tsx

export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import MarketingTabs from "@/components/marketing/MarketingTabs";

export default async function MarketingPage() {
  const [
    { data: listings, error: listingsError },
    { data: facebookGroups, error: groupsError },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select(`
        *,
        property_photos (
  photo_type,
  image_url,
  sort_order,
  created_at
)
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("facebook_groups")
      .select(`
        id,
        name,
        group_url,
        language,
        region,
        is_active
      `)
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  if (listingsError) {
    console.error(
      "Marketing listings error:",
      listingsError
    );
  }

  if (groupsError) {
    console.error(
      "Facebook groups error:",
      groupsError
    );
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

      <MarketingTabs
  listings={listings ?? []}
  facebookGroups={facebookGroups ?? []}
/>

    </div>
  );
}