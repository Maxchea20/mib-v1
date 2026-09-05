// File: src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Building2,
  Megaphone,
  Receipt,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "AI Cobroke Match", href: "/cobroke-match", icon: Sparkles },
  { label: "Listings", href: "/listings", icon: Building2 },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Sales", href: "/sales", icon: Receipt },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ userInitial = "N" }: { userInitial?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0a0e16] border-r border-[#1e2733] min-h-screen flex flex-col">
      <div className="px-6 py-6 flex items-center gap-2 border-b border-[#1e2733]">
        <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
        <span className="font-data text-sm font-semibold text-[#e7ecf3] tracking-wide">
          MIB
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[#22d3ee]/[0.08] text-[#e7ecf3]"
                  : "text-[#5a6472] hover:text-[#8b95a5] hover:bg-white/[0.02]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-[#22d3ee] shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
              )}
              <Icon
                size={17}
                strokeWidth={1.75}
                className={isActive ? "text-[#22d3ee]" : ""}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-[#1e2733]">
        <div className="w-8 h-8 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] text-xs font-medium flex items-center justify-center font-data">
          {userInitial}
        </div>
      </div>
    </aside>
  );
}
