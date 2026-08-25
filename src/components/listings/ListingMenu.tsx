"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import DeleteListingButton from "@/components/DeleteListingButton";

type Props = {
  id: number;
  title: string;
};

export default function ListingMenu({
  id,
  title,
}: Props) {

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
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
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-full p-2 hover:bg-gray-100"
      >

        <EllipsisVerticalIcon className="w-7 h-7 text-black stroke-2" />

      </button>

      {open && (

        <div
          className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          <Link
            href={`/listings/${id}`}
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
          >

            <EyeIcon className="w-5 h-5" />

            View

          </Link>

          <Link
            href={`/listings/${id}/edit`}
            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100"
          >

            <PencilSquareIcon className="w-5 h-5" />

            Edit

          </Link>

          <div className="border-t">

            <DeleteListingButton
              id={id}
              title={title}
            />

          </div>

        </div>

      )}

    </div>

  );

}