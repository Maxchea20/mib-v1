"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import GenerateBrochureButton from "@/components/pdf/GenerateBrochureButton";
import GenerateInternalSheetButton from "@/components/pdf/GenerateInternalSheetButton";
import AIGeneratePropertyPosterButton from "@/components/ai/AIGeneratePropertyPosterButton";
import ShareListingSheet from "@/components/listings/ShareListingSheet";

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
      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="w-11 h-11 flex items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink)] text-xl"
        aria-label="Listing actions"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 surface p-1">
          <div className="px-2 py-2">
            <ShareListingSheet listing={listing} />
          </div>
          <div className="m-0 p-0">
            <AIGeneratePropertyPosterButton
              listing={listing}
              onComplete={() =>
                setOpen(false)
              }
            />
          </div>
          <div className="m-0 p-0">
            <GenerateBrochureButton
              listing={listing}
            />
          </div>
          <div className="m-0 p-0">
            <GenerateInternalSheetButton
              listing={listing}
            />
          </div>
          <Link
            href={`/listings/${listing.id}/edit`}
            onClick={() =>
              setOpen(false)
            }
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          >
            Edit Listing
          </Link>
        </div>
      )}
    </div>
  );
}
