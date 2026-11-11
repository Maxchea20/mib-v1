"use client";

import { useState } from "react";

type Props = {
  details: React.ReactNode;
  gallery: React.ReactNode;
  aiDesign: React.ReactNode;
  aiVideo: React.ReactNode;
  share?: React.ReactNode;
};

export default function ListingTabs({
  details,
  gallery,
  aiDesign,
  aiVideo,
  share,
}: Props) {
  const [tab, setTab] = useState<"details" | "gallery" | "ai" | "video" | "share">(
    "details"
  );

  const tabs = [
    { id: "details" as const, label: "Details" },
    { id: "gallery" as const, label: "Photos" },
    { id: "ai" as const, label: "Design" },
    { id: "video" as const, label: "Video" },
    ...(share ? [{ id: "share" as const, label: "Share" }] : []),
  ];

  return (
    <div className="w-full min-w-0">
      <div className="surface mb-4 overflow-hidden">
        <div className={`grid ${share ? "grid-cols-5" : "grid-cols-4"}`}>
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
        {tab === "share" && share}
      </div>
    </div>
  );
}
