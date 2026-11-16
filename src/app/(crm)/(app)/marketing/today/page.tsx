export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateMatchScore } from "@/lib/matching";
import { orderedPhotoUrls, type ShareListing, type SharePhoto } from "@/lib/shareKit";
import { thumbUrlFor } from "@/lib/photoSize";
import TodayBoard, { type TodayListing } from "@/components/marketing/TodayBoard";
import type { ShareEntry } from "@/lib/todayPlan";

/*
| MARKETING > TODAY
| Suggests what to share today from the listings and the share history.
| Reads with the logged-in user's own access. Nothing is posted automatically.
*/

type Row = ShareListing & { id: number; property_photos?: SharePhoto[] | null; created_at?: string | null };

/** Kept outside the page so the page itself stays pure. */
const nowMs = () => Date.now();

export default async function TodayPage() {
  const supabase = await createClient();

  const [{ data: rows, error: listingsError }, { data: buyers }, { data: log, error: logError }] = await Promise.all([
    supabase.from("properties").select("*, property_photos(photo_type, image_url, sort_order)").order("id", { ascending: true }),
    supabase.from("buyers").select("*").eq("purpose", "Buy"),
    supabase.from("share_log").select("id, property_id, idea_key, platform, shared_at").order("shared_at", { ascending: false }).limit(600),
  ]);

  if (listingsError) console.error("Today listings error:", listingsError);

  const listings: TodayListing[] = ((rows ?? []) as Row[]).map((r) => {
    const photos = Array.isArray(r.property_photos) ? r.property_photos : [];
    const urls = orderedPhotoUrls(r.category, photos);
    const matches = (buyers ?? []).reduce((n: number, b: unknown) => n + (calculateMatchScore(b, r).score >= 60 ? 1 : 0), 0);
    return {
      id: r.id,
      title: r.title ?? null,
      category: r.category ?? null,
      purpose: r.purpose ?? null,
      price: r.price ?? null,
      status: r.status ?? null,
      is_public: r.is_public ?? null,
      area: r.area ?? null,
      city: r.city ?? null,
      state: r.state ?? null,
      property_type: r.property_type ?? null,
      property_sub_type: r.property_sub_type ?? null,
      land_type: r.land_type ?? null,
      bedrooms: r.bedrooms ?? null,
      bathrooms: r.bathrooms ?? null,
      built_up: r.built_up ?? null,
      land_size: r.land_size ?? null,
      tenure: r.tenure ?? null,
      created_at: r.created_at ?? null,
      photoCount: urls.length,
      matches,
      cover: urls[0] ? thumbUrlFor(urls[0]) ?? urls[0] : null,
    };
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-caption mb-1">MARKETING</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Today</h1>
        </div>
        <Link href="/marketing" className="min-h-11 inline-flex items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800">
          Back to Marketing
        </Link>
      </div>

      <TodayBoard listings={listings} history={(log ?? []) as ShareEntry[]} historyReady={!logError} serverNow={nowMs()} />
    </div>
  );
}
