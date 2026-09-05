// File: src/components/dashboard/MatchedListings.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { calculateMatchScore } from "@/lib/matching";
import Card, { CardHeader } from "@/components/ui/Card";
import ScoreBar from "@/components/ui/ScoreBar";

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function MatchedListings() {
  const { data: buyers } = await supabase
    .from("buyers")
    .select("*")
    .eq("purpose", "Buy");

  const { data: listings } = await supabase.from("properties").select("*");

  if (!buyers || buyers.length === 0 || !listings || listings.length === 0) {
    return (
      <Card>
        <CardHeader title="Matched listings and buyers" />
        <div className="px-6 py-10 text-center text-slate-500 text-sm">
          No buyers or listings available for matching yet.
        </div>
      </Card>
    );
  }

  const matches: any[] = [];
  buyers.forEach((buyer) => {
    listings.forEach((listing) => {
      const result = calculateMatchScore(buyer, listing);
      if (result.score >= 60) {
        matches.push({ buyer, listing, score: result.score });
      }
    });
  });

  matches.sort((a, b) => b.score - a.score);
  const topMatches = matches.slice(0, 5);

  return (
    <Card>
      <CardHeader
        caption="AI COBROKE MATCH / LIVE"
        title="Matched listings and buyers"
        subtitle="Top property matches based on buyer requirements"
        action={
          <span className="font-data text-sm text-[#8b95a5]">
            {matches.length} total matches
          </span>
        }
      />

      <div className="divide-y divide-[#1e2733]">
        {topMatches.length === 0 ? (
          <div className="px-6 py-10 text-center text-[#5a6472] text-sm">
            No matching listings found.
          </div>
        ) : (
          topMatches.map((match) => (
            <div
              key={`${match.buyer.id}-${match.listing.id}`}
              className="px-6 py-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/25 text-[#22d3ee] flex items-center justify-center text-xs font-semibold flex-shrink-0 font-data">
                    {initials(match.buyer.name)}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/buyers/${match.buyer.id}`}
                      className="font-semibold text-[#e7ecf3] hover:text-[#22d3ee] truncate block"
                    >
                      {match.buyer.name}
                    </Link>
                    <p className="font-data text-sm text-[#8b95a5]">
                      Budget RM {Number(match.buyer.budget).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex md:col-span-1 justify-center text-[#3a4657]">
                  <ArrowRight size={18} />
                </div>

                <div className="md:col-span-4 min-w-0">
                  <Link
                    href={`/listings/${match.listing.id}`}
                    className="font-semibold text-[#e7ecf3] hover:text-[#22d3ee] truncate block"
                  >
                    {match.listing.title}
                  </Link>
                  <p className="text-sm text-[#8b95a5]">
                    {match.listing.area || "-"}
                  </p>
                </div>

                <div className="md:col-span-3">
                  <ScoreBar score={match.score} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {matches.length > 5 && (
        <div className="border-t border-[#1e2733] px-6 py-4">
          <Link
            href="/match"
            className="text-sm font-medium text-[#22d3ee] hover:underline"
          >
            View all matches →
          </Link>
        </div>
      )}
    </Card>
  );
}