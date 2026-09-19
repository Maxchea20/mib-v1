"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-[var(--paper)]">
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 min-w-0 w-full pb-20 md:pb-0">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <div className="w-full min-w-0 px-4 py-4 sm:px-5 md:p-8">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
