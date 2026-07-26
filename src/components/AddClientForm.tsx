"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


export default function AddClientForm() {
  const router = useRouter();
  const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [status, setStatus] = useState("New Lead");
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
    .insert([
      {
        name,
        phone,
        status,
      },
    ]);

  if (error) {
    alert("Failed to save client.");
    console.error(error);
    return;
  }

  setName("");
setPhone("");
setStatus("New Lead");

router.refresh();
}
  return (
    <form
  onSubmit={handleSubmit}
  className="border-2 border-red-500 p-4 mt-4"
>
  <input
  type="text"
  placeholder="Client Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="border rounded px-3 py-2 w-full text-black placeholder-gray-400"
/>

  <input
  type="text"
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="border rounded px-3 py-2 w-full mt-3 text-black placeholder-gray-400"
/>

  <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="border rounded px-3 py-2 w-full mt-3 text-black"
>
  <option>New Lead</option>
  <option>Follow Up</option>
  <option>Viewing</option>
  <option>Closed</option>
</select>

<button
  type="submit"
  className="bg-blue-600 text-white rounded px-4 py-2 w-full mt-3"
>
  Save Client
</button>
</form>
  );
}