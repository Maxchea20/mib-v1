// File: src/app/(app)/clients/[id]/page.tsx

import EditClientForm from "@/components/EditClientForm";
import Timeline from "@/components/Timeline";
import AddTimelineForm from "@/components/AddTimelineForm";
import { supabase } from "@/lib/supabase";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get Client
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  // Get Timeline
  const { data: timeline } = await supabase
    .from("timelines")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  if (error || !client) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Client not found
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Client Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Panel */}
        <div className="bg-white rounded-lg shadow p-6">

          <h2 className="text-xl font-semibold text-black mb-4">
            Client Snapshot
          </h2>

          <p className="text-black">
            <strong>Name:</strong> {client.name}
          </p>

          <p className="text-black mt-2">
            <strong>Phone:</strong> {client.phone}
          </p>

          <p className="text-black mt-2">
            <strong>Status:</strong> {client.status}
          </p>

          <div className="mt-6">
            <EditClientForm client={client} />
          </div>

        </div>

        {/* Right Panel */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">

          <AddTimelineForm clientId={client.id} />

          <Timeline timeline={timeline ?? []} />

        </div>

      </div>

    </div>
  );
}