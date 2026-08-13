"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
};

export default function DeleteSaleButton({ id }: Props) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("deals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete sale.");
      setDeleting(false);
      return;
    }

    router.refresh();
    setDeleting(false);
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