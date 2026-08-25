"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";

type Props = {
  onMenuClick?: () => void;
};

export default function TopBar({
  onMenuClick,
}: Props) {

  return (

    <header className="flex items-center justify-between border-b bg-white px-6 py-4">

      <div className="flex items-center gap-3">

        {/* Mobile Hamburger */}

        <button
          onClick={onMenuClick}
          className="md:hidden rounded-lg p-2 hover:bg-gray-100"
        >
          <Bars3Icon className="w-7 h-7 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold text-slate-800">

          MIB

        </h1>

      </div>

    </header>

  );

}