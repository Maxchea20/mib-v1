"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import TopBar from "./TopBar";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({
  children,
}: Props) {

  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (

    <div className="flex min-h-screen bg-slate-100">

      {/* Desktop Sidebar */}

      <div className="hidden md:block">

        <Sidebar />

      </div>

      {/* Mobile Sidebar */}

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main */}

      <main className="flex-1">

        <TopBar
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <div className="p-8">

          {children}

        </div>

      </main>

    </div>

  );

}