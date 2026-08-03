"use client";

import { useRouter } from "next/navigation";
import { deleteBuyer } from "@/lib/buyers";

type Props = {
  id: number;
  name: string;
};

export default function DeleteBuyerButton({
  id,
  name,
}: Props) {

  const router = useRouter();

  async function handleDelete() {

    const ok = confirm(
      `Delete buyer "${name}"?`
    );

    if (!ok) return;

    try {

      await deleteBuyer(id);

      router.refresh();

    } catch {

      alert("Failed to delete buyer.");

    }

  }

  return (

    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
    >
      Delete
    </button>

  );

}