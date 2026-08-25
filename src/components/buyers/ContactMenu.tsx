"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DeleteBuyerButton from "@/components/DeleteBuyerButton";
import {
  EyeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

type Props = {
  id: number;
  name: string;
};

export default function ContactMenu({
  id,
  name,
}: Props) {

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

  }, []);

  return (

    <div
      className="relative"
      ref={menuRef}
    >

      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg hover:bg-gray-100 text-2xl font-bold"
      >
        ⋮
      </button>

      {open && (

        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">

          <Link
            href={`/contacts/${id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
          >
            <EyeIcon className="w-5 h-5" />
            View
          </Link>

          <Link
            href={`/contacts/${id}/edit`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
          >
            <PencilSquareIcon className="w-5 h-5" />
            Edit
          </Link>

          <div className="border-t">

            <DeleteBuyerButton
              id={id}
              name={name}
            />

          </div>

        </div>

      )}

    </div>

  );

}