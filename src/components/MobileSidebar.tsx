"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/nav";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#1c1917]/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[80vw] max-w-xs bg-[#fffaf3] z-50 transform transition-transform duration-300 md:hidden pt-[env(safe-area-inset-top)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 border-b border-[var(--line)]">
          <p className="label-caption">Max Intelligence Board</p>
          <h1 className="font-display text-3xl mt-1">MIB</h1>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={onClose}
              className="flex items-center rounded-xl px-4 py-3 text-[var(--ink)] hover:bg-[var(--paper)]"
            >
              {menu.label}
            </Link>
          ))}
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center rounded-xl px-4 py-3 text-[var(--ink)] hover:bg-[var(--paper)]"
          >
            Settings
          </Link>
        </nav>
      </aside>
    </>
  );
}
