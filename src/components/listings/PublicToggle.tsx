"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/*
| One-tap "show on the public website" switch for a listing.
| Saves straight to properties.is_public. The public site reads the same
| row, so there is no second place to update.
|
| A listing is only actually visible when it is switched on AND its status
| is Available or Booked (Sold, Rented and Inactive stay hidden).
*/

const LIVE_STATUSES = ["Available", "Booked"];

export default function PublicToggle({
  id,
  isPublic,
  status,
  showLink = false,
}: {
  id: number | string;
  isPublic: boolean;
  status: string | null | undefined;
  showLink?: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(isPublic);
  const [saving, setSaving] = useState(false);

  const statusHidesIt = on && !LIVE_STATUSES.includes(status ?? "");

  async function toggle() {
    const next = !on;
    setSaving(true);
    setOn(next);

    const { error } = await supabase
      .from("properties")
      .update({ is_public: next })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setOn(!next);
      alert(`Could not update the public website setting: ${error.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        aria-pressed={on}
        title="Show this listing on the public website"
        className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold ring-1 ring-inset disabled:opacity-60 ${
          on
            ? "bg-emerald-50 text-emerald-800 ring-emerald-300"
            : "bg-slate-100 text-slate-600 ring-slate-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-400"}`}
        />
        {on ? "Public website: ON" : "Public website: OFF"}
      </button>

      {statusHidesIt && (
        <span className="text-xs text-amber-700">
          Not shown: status is {status || "not set"}
        </span>
      )}

      {showLink && on && !statusHidesIt && (
        <Link
          href={`/site/listing/${id}`}
          className="text-xs font-semibold text-emerald-700 underline"
        >
          View public page
        </Link>
      )}
    </div>
  );
}
