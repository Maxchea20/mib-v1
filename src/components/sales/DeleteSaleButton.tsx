"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
};

export default function DeleteSaleButton({
  id,
}: Props) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      // 1. Get the deal before deleting it
      const {
        data: deletedDeal,
        error: fetchError,
      } = await supabase
        .from("deals")
        .select("id, year, deal_no")
        .eq("id", id)
        .single();

      if (fetchError || !deletedDeal) {
        console.error(fetchError);
        alert("Unable to find this sale.");
        return;
      }

      const year = Number(deletedDeal.year);

      // 2. Delete the selected deal
      const {
        error: deleteError,
      } = await supabase
        .from("deals")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error(deleteError);
        alert("Failed to delete sale.");
        return;
      }

      // 3. Get remaining deals for the same year
      const {
        data: remainingDeals,
        error: listError,
      } = await supabase
        .from("deals")
        .select("id, deal_no")
        .eq("year", year);

      if (listError) {
        console.error(listError);
        alert(
          "Sale deleted, but deal numbers could not be renumbered."
        );
        router.refresh();
        return;
      }

      // 4. Sort by current Deal No.
      const sortedDeals = [
        ...(remainingDeals || []),
      ].sort((a, b) => {
        const aNumber = Number(
          String(a.deal_no ?? "").replace(/\D/g, "")
        );

        const bNumber = Number(
          String(b.deal_no ?? "").replace(/\D/g, "")
        );

        return aNumber - bNumber;
      });

      // 5. Temporarily give every deal a unique number
      //    so Supabase never sees duplicate Deal Nos.
      const batchId = Date.now();

      for (let i = 0; i < sortedDeals.length; i++) {
        const deal = sortedDeals[i];

        const { error } = await supabase
          .from("deals")
          .update({
            deal_no: `TEMP-${batchId}-${i}-${deal.id}`,
          })
          .eq("id", deal.id);

        if (error) {
          console.error(error);
          alert(
            "Sale deleted, but renumbering failed."
          );
          router.refresh();
          return;
        }
      }

      // 6. Give them their final sequential numbers
      for (let i = 0; i < sortedDeals.length; i++) {
        const deal = sortedDeals[i];

        const { error } = await supabase
          .from("deals")
          .update({
            deal_no: String(i + 1),
          })
          .eq("id", deal.id);

        if (error) {
          console.error(error);
          alert(
            "Sale deleted, but final renumbering failed."
          );
          router.refresh();
          return;
        }
      }

      // 7. Refresh the Sales page
      router.refresh();

    } catch (error) {
      console.error(
        "Delete sale failed:",
        error
      );

      alert(
        "Something went wrong while deleting the sale."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}