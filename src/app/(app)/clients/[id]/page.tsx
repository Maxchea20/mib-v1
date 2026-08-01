import EditClientForm from "@/components/EditClientForm";
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
  <EditClientForm client={client} />
);
}