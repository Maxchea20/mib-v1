import { supabase } from "@/lib/supabase";
import AddClientForm from "@/components/AddClientForm";
import ClientList from "@/components/ClientList";

export default async function ClientsPage() {
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold">
        Client CRM
      </h1>

      <AddClientForm />

      <ClientList clients={clients ?? []} />
    </div>
  );
}