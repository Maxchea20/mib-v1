export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BuyerList from "@/components/buyers/BuyerList";


export default async function ContactsPage() {

  // Load all contacts
  const { data: buyers } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  // Load all properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*");

  // Attach first owner property to each contact
  const contacts =
    (buyers ?? []).map((buyer) => {

      const ownerProperty =
        (properties ?? []).find(
          (property) =>
            property.owner_id === buyer.id
        );

      return {

        ...buyer,

        ownerProperty,

      };

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
        buyers={contacts}
      />

    </div>

  );

}