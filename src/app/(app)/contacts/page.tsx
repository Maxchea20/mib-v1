// File: src/app/(app)/buyers/page.tsx
import DeleteBuyerButton from "@/components/DeleteBuyerButton";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyerList from "@/components/buyers/BuyerList";

export default async function BuyersPage() {

  const { data: buyers } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (

    <div className="max-w-7xl mx-auto p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-black">
          Contacts
        </h1>

        <Link
          href="/contacts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          + Add Contact
        </Link>

      </div>

      <BuyerList
        buyers={buyers ?? []}
      />

    </div>

  );

}