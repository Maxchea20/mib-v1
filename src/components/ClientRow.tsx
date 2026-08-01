// File: src/components/ClientRow.tsx

import Link from "next/link";

type Client = {
  id: string;
  name: string;
  phone: string;
  status: string;
};

export default function ClientRow({
  client,
}: {
  client: Client;
}) {
  const phone = client.phone.replace(/\D/g, "");

  const whatsappNumber = phone.startsWith("0")
    ? `6${phone}`
    : phone;

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <tr className="hover:bg-slate-100">
      <td className="border p-3 text-black">
        {client.name}
      </td>

      <td className="border p-3 text-black">
        {client.phone}
      </td>

      <td className="border p-3 text-black">
        {client.status}
      </td>

      <td className="border p-3 text-center space-x-2">

        <Link
          href={`/clients/${client.id}`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded inline-block"
        >
          Edit
        </Link>

        <Link
          href={`/clients/${client.id}/delete`}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded inline-block"
        >
          Delete
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded inline-block"
        >
          WhatsApp
        </a>

      </td>
    </tr>
  );
}