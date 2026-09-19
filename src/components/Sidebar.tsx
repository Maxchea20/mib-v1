"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export default function Sidebar({ userInitial = "M" }: { userInitial?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 min-h-screen flex flex-col bg-[#1c1917] text-[#f3eee6]">
      <div className="px-6 py-7 border-b border-white/10">
        <p className="label-caption text-[#c46a3a]">Private desk</p>
        <p className="font-display text-2xl mt-1">MIB</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm transition ${
                isActive
                  ? "bg-[#f3eee6] text-[#1c1917]"
                  : "text-[#d6d3d1] hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={`flex items-center px-3 py-2.5 rounded-xl text-sm ${
            pathname?.startsWith("/settings")
              ? "bg-[#f3eee6] text-[#1c1917]"
              : "text-[#d6d3d1] hover:bg-white/5"
          }`}
        >
          Settings
        </Link>
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <div className="w-9 h-9 rounded-full bg-[#c46a3a] text-white text-sm flex items-center justify-center">
          {userInitial}
        </div>
      </div>
    </aside>
  );
}
