export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import VlogManager, { type AdminVideo, type ListingOption } from "@/components/vlog/VlogManager";

/*
| MIB > Vlog. Add the YouTube videos that appear on maxproperty.my/vlog.
| The videos stay on YouTube: only the link and the words are kept here.
*/

export default async function VlogPage() {
  const supabase = await createClient();
  const [{ data: videos, error }, { data: listings }] = await Promise.all([
    supabase.from("vlog_videos").select("*").order("sort_order", { ascending: true }).order("id", { ascending: false }).limit(300),
    supabase.from("properties").select("id, title").order("id", { ascending: false }).limit(400),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Vlog</h1>
      <p className="mt-2 text-slate-600">
        Upload your video to YouTube first, then paste its link here. It appears on maxproperty.my/vlog in English, BM and Chinese. The video stays
        on YouTube, so it does not use your Supabase storage or data allowance.
      </p>
      <VlogManager initial={(videos ?? []) as AdminVideo[]} listings={(listings ?? []) as ListingOption[]} setupNeeded={Boolean(error)} />
    </div>
  );
}
