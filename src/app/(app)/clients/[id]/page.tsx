import { supabase } from "@/lib/supabase";
export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

const { data: client, error } = await supabase
  .from("clients")
  .select("*")
  .eq("id", id)
  .single();

  return (
    <div className="bg-white p-6 rounded-lg">
      <h1 className="text-3xl font-bold text-black">
        Edit Client
      </h1>

      <div className="mt-4 text-black space-y-2">
  <p>
    <strong>Name:</strong> {client?.name}
  </p>

  <p>
    <strong>Phone:</strong> {client?.phone}
  </p>

  <p>
    <strong>Status:</strong> {client?.status}
  </p>
</div>
    </div>
  );
}