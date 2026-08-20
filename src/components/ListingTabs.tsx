"use client";

import { useState } from "react";

type Props = {
  details: React.ReactNode;
  gallery: React.ReactNode;
  aiDesign: React.ReactNode;
  aiVideo: React.ReactNode;
};

export default function ListingTabs({
  details,
  gallery,
  aiDesign,
  aiVideo,
}: Props) {
  const [tab, setTab] = useState<
    "details" | "gallery" | "ai" | "video"
  >("details");

  const tabs = [
    {
      id: "details" as const,
      label: "Property Details",
      icon: "📋",
      active: "border-blue-600 text-blue-600 bg-blue-50",
    },
    {
      id: "gallery" as const,
      label: "Property Gallery",
      icon: "📷",
      active: "border-blue-600 text-blue-600 bg-blue-50",
    },
    {
      id: "ai" as const,
      label: "AI Design",
      icon: "🎨",
      active: "border-purple-600 text-purple-600 bg-purple-50",
    },
    {
      id: "video" as const,
      label: "AI Video",
      icon: "🎬",
      active: "border-red-600 text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden">

      {/* ================================= */}
      {/* TAB NAVIGATION */}
      {/* ================================= */}

      <div className="w-full min-w-0 max-w-full bg-white rounded-xl shadow border mb-4 sm:mb-6 overflow-hidden">

        <div className="grid grid-cols-4 w-full min-w-0">

          {tabs.map((item) => {
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`
                  min-w-0
                  w-full
                  px-1
                  sm:px-3
                  md:px-6
                  py-3
                  sm:py-4
                  font-semibold
                  text-[10px]
                  sm:text-xs
                  md:text-sm
                  leading-tight
                  transition-all
                  border-b-4
                  flex
                  items-center
                  justify-center
                  gap-1
                  sm:gap-2
                  text-center
                  break-words
                  ${
                    active
                      ? item.active
                      : "border-transparent text-gray-500 hover:bg-gray-50"
                  }
                `}
              >
                <span className="shrink-0">
                  {item.icon}
                </span>

                <span className="min-w-0">
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </div>


      {/* ================================= */}
      {/* TAB CONTENT */}
      {/* ================================= */}

      <div className="w-full min-w-0 max-w-full overflow-hidden">

        {tab === "details" && details}

        {tab === "gallery" && gallery}

        {tab === "ai" && aiDesign}

        {tab === "video" && aiVideo}

      </div>

    </div>
  );
}