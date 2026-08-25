// File: src/app/(app)/listings/[id]/edit/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ListingForm from "@/components/ListingForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditListingPage({
  params,
}: Props) {
  const { id } = await params;

  const { data: listing } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-black">
          Edit Listing
        </h1>

        <Link
          href={`/listings/${listing.id}`}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
        >
          Cancel
        </Link>

      </div>

      <ListingForm
        mode="edit"
        listing={listing}
      />

    </div>
  );
}