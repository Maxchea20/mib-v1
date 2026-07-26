import Link from "next/link";
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

<div className="mt-6">
  <h2 className="text-xl font-semibold mb-3">
    Client List
  </h2>

  <table className="w-full border border-gray-300 bg-white text-black">
    <thead>
      <tr className="bg-gray-200 text-black">
  <th className="border p-2">Name</th>
  <th className="border p-2">Phone</th>
  <th className="border p-2">Status</th>
  <th className="border p-2">Action</th>
</tr>
    </thead>

    <tbody>
      {data?.map((client) => (
        <tr key={client.id} className="text-black">
          <td className="border p-2 text-black">{client.name}</td>
          <td className="border p-2 text-black">{client.phone}</td>
          <td className="border p-2 text-black">{client.status}</td>
          <td className="border p-2 text-center">
  <Link
    href={`/clients/${client.id}`}
    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-block"
  >
    Edit
  </Link>
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
   
  );
}