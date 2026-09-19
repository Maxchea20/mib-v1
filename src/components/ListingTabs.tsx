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
  const [tab, setTab] = useState<"details" | "gallery" | "ai" | "video">(
    "details"
  );

  const tabs = [
    { id: "details" as const, label: "Details" },
    { id: "gallery" as const, label: "Photos" },
    { id: "ai" as const, label: "Design" },
    { id: "video" as const, label: "Video" },
  ];

  return (
    <div className="w-full min-w-0">
      <div className="surface mb-4 overflow-hidden">
        <div className="grid grid-cols-4">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`min-h-12 px-1 py-3 text-xs sm:text-sm font-medium border-b-2 ${
                  active
                    ? "border-[var(--copper)] text-[var(--ink)] bg-[#fffaf3]"
                    : "border-transparent text-[var(--ink-muted)]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full min-w-0">
        {tab === "details" && details}
        {tab === "gallery" && gallery}
        {tab === "ai" && aiDesign}
        {tab === "video" && aiVideo}
      </div>
    </div>
  );
}
