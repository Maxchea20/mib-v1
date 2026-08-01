"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditClientForm({
  client,
}: {
  client: any;
}) {
  const router = useRouter();

  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [status, setStatus] = useState(client.status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter client name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter phone number.");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({
        name,
        phone,
        status,
      })
      .eq("id", client.id);

    if (error) {
      alert("Failed to update client.");
      console.error(error);
      return;
    }

    router.push("/clients");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 mt-6 space-y-4"
    >
      <div>
        <label className="block text-black mb-1">
          Client Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full text-black"
        />
      </div>

      <div>
        <label className="block text-black mb-1">
          Phone Number
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border rounded px-3 py-2 w-full text-black"
        />
      </div>

      <div>
        <label className="block text-black mb-1">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 w-full text-black"
        >
          <option>New Lead</option>
          <option>Follow Up</option>
          <option>Viewing</option>
          <option>Closed</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </form>
  );
}