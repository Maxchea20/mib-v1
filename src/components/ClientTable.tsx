import ClientRow from "@/components/ClientRow";

type Client = {
  id: string;
  name: string;
  phone: string;
  status: string;
};

export default function ClientTable({
  clients,
}: {
  clients: Client[];
}) {
  return (
    <div className="mt-6 bg-white rounded-lg p-4 shadow">
      <h2 className="text-xl font-semibold text-black">
        Client List
      </h2>

      <p className="text-gray-600 mb-4">
        Total Clients: {clients.length}
      </p>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-200 text-black">
            <th className="border p-3 text-left">
              Name
            </th>

            <th className="border p-3 text-left">
              Phone
            </th>

            <th className="border p-3 text-left">
              Status
            </th>

            <th className="border p-3 text-center">
              Action
            </th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}