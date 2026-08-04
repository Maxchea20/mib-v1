import Link from "next/link";

const menus = [
  { name: "Dashboard", href: "/dashboard", emoji: "🏠" },
  { name: "Contacts", href: "/contacts", emoji: "🛒" },
  { name: "Listings", href: "/listings", emoji: "🏡" },
  { name: "Sales", href: "/sales", emoji: "💰" },
  { name: "Settings", href: "/settings", emoji: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="mb-10 text-2xl font-bold">
        MIB
      </h1>

      <nav className="space-y-2">
        {menus.map((menu) => (
          <Link
            key={menu.name}
            href={menu.href}
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-slate-700"
          >
            <span>{menu.emoji}</span>
            <span>{menu.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}