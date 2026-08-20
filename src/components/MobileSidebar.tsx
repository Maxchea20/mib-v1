"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
};

const menus = [
  { name: "Dashboard", href: "/dashboard", emoji: "🏠" },
  { name: "Contacts", href: "/contacts", emoji: "🛒" },
  { name: "AI Cobroke Match", href: "/cobroke-match", emoji: "🤝" },
  { name: "Listings", href: "/listings", emoji: "🏡" },
  { name: "Sales", href: "/sales", emoji: "💰" },
  { name: "Settings", href: "/settings", emoji: "⚙️" },
];

export default function MobileSidebar({
  open,
  onClose,
}: Props) {

  return (

    <>

      {/* Overlay */}

      {open && (

        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />

      )}

      {/* Sidebar */}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white p-6 z-50 transform transition-transform duration-300 md:hidden ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <h1 className="mb-10 text-2xl font-bold">
          MIB
        </h1>

        <nav className="space-y-2">

          {menus.map((menu) => (

            <Link
              key={menu.name}
              href={menu.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-slate-700 transition"
            >

              <span>{menu.emoji}</span>

              <span>{menu.name}</span>

            </Link>

          ))}

        </nav>

      </aside>

    </>

  );

}