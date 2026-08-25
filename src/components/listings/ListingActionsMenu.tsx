"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import GenerateBrochureButton from "@/components/pdf/GenerateBrochureButton";
import GenerateInternalSheetButton from "@/components/pdf/GenerateInternalSheetButton";
import AIGeneratePropertyPosterButton from "@/components/ai/AIGeneratePropertyPosterButton";

type Props = {
  listing: any;
};

export default function ListingActionsMenu({
  listing,
}: Props) {
  const [open, setOpen] = useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

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

    if (open) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* 3 DOT BUTTON */}

      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="w-9 h-9 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 text-2xl font-bold"
        aria-label="Listing actions"
      >
        ⋮
      </button>

      {/* ACTION MENU */}

      {open && (
        <div className="absolute right-0 top-11 z-50 w-60 bg-white border rounded-lg shadow-lg p-1">

          {/* AI PROPERTY POSTER */}

          <div className="m-0 p-0">
            <AIGeneratePropertyPosterButton
              listing={listing}
              onComplete={() =>
                setOpen(false)
              }
            />
          </div>

          {/* GENERATE BROCHURE */}

          <div className="m-0 p-0">
            <GenerateBrochureButton
              listing={listing}
            />
          </div>

          {/* INTERNAL SHEET */}

          <div className="m-0 p-0">
            <GenerateInternalSheetButton
              listing={listing}
            />
          </div>

          {/* EDIT LISTING */}

          <Link
            href={`/listings/${listing.id}/edit`}
            onClick={() =>
              setOpen(false)
            }
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            ✏️ Edit Listing
          </Link>

        </div>
      )}
    </div>
  );
}