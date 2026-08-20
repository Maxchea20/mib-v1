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

    <div className="flex min-h-screen w-full min-w-0 bg-slate-100">

      {/* ================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ================================= */}

      <div className="hidden md:block shrink-0">

        <Sidebar />

      </div>


      {/* ================================= */}
      {/* MOBILE SIDEBAR */}
      {/* ================================= */}

      <MobileSidebar
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />


      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <main className="flex-1 min-w-0 w-full">

        <TopBar
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />


        {/* ================================= */}
        {/* PAGE CONTENT */}
        {/* ================================= */}

        <div className="w-full min-w-0 px-3 py-4 sm:px-4 sm:py-5 md:p-8">

          {children}

        </div>

      </main>

    </div>

  );
}