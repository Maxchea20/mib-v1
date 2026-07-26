import { supabase } from "@/lib/supabase";
import AddClientForm from "@/components/AddClientForm";

export default async function clientsPage() {
   const { data, error } = await supabase
  .from("clients")
  .select("*");

  console.log(data);
  console.log(error);
  return (
    
    <div>
      <h1 className="text-3xl font-bold">
        Clients
      </h1>

      <AddClientForm />

      <p className="mt-2 text-slate-600">
  Total Clients: {data?.length}
</p>
    </div>
   
  );
}