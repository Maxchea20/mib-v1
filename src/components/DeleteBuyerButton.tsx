"use client";

import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";
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
      `Delete contact "${name}"?`
    );

    if (!ok) return;

    try {

      await deleteBuyer(id);

      router.refresh();

    } catch {

      alert("Failed to delete contact.");

    }

  }

  return (

    <button
      onClick={handleDelete}
      className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
    >
      <TrashIcon className="w-5 h-5" />
      Delete
    </button>

  );

}