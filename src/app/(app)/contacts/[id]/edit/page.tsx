// File: src/app/(app)/buyers/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import BuyerForm from "@/components/buyers/BuyerForm";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBuyerPage({
  params,
}: Props) {

  const { id } = await params;

  const { data: buyer } = await supabase
    .from("buyers")
    .select("*")
    .eq("id", id)
    .single();

  if (!buyer) {

    notFound();

  }

  return (

    <div className="max-w-7xl mx-auto p-6">

      <BuyerForm
        mode="edit"
        buyer={buyer}
      />

    </div>

  );

}