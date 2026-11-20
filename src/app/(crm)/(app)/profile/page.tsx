export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import ProfileForm, { type ProfileRow } from "@/components/profile/ProfileForm";

/*
| MIB > My profile. The owner's public profile: written once here, shown on
| maxproperty.my/about when "Show on the website" is ticked.
*/

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("agent_profile").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">My profile</h1>
      <p className="mt-2 text-slate-600">
        Your photo and introduction for the website. Write it once here. It appears on maxproperty.my/about in English, BM and Chinese when you
        tick &quot;Show on the website&quot;.
      </p>
      <ProfileForm initial={(data as ProfileRow | null) ?? null} setupNeeded={Boolean(error)} />
    </div>
  );
}
