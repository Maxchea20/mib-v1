"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  onMenuClick?: () => void;
};

export default function TopBar({ onMenuClick }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden rounded-full p-2 min-w-11 min-h-11 border border-[var(--line)]"
          aria-label="Open menu"
        >
          <span className="block w-4 h-px bg-[var(--ink)] mb-1" />
          <span className="block w-4 h-px bg-[var(--ink)] mb-1" />
          <span className="block w-3 h-px bg-[var(--ink)]" />
        </button>
        <div>
          <p className="label-caption leading-none">Desk</p>
          <h1 className="font-display text-xl leading-tight">MIB</h1>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-full px-4 min-h-11 border border-[var(--line)] text-sm disabled:opacity-50"
      >
        {loggingOut ? "Logging out..." : "Log out"}
      </button>
    </header>
  );
}
