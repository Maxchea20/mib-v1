// File: src/app/(app)/cobroke-match/page.tsx

export const dynamic = "force-dynamic";

import AICobrokeMatcher from "@/components/matching/AICobrokeMatcher";

export default function CobrokeMatchPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-black">
          🤖 Cobroke Match
        </h1>

        <p className="text-gray-500 mt-2">
          Paste a WhatsApp cobroke requirement
          and find matching Max listings.
        </p>

      </div>


      {/* ================================= */}
      {/* AI COBROKE MATCHER */}
      {/* ================================= */}

      <AICobrokeMatcher />

    </div>
  );
}