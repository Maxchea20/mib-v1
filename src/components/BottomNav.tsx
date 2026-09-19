"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) =>
    ["/dashboard", "/contacts", "/listings", "/sales", "/marketing"].includes(
      item.href
    )
  );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line)] bg-[var(--paper-raised)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-14 text-[11px] ${
                active ? "text-[var(--copper)]" : "text-[var(--ink-muted)]"
              }`}
            >
              <span className="font-medium">{item.short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
