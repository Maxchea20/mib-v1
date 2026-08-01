// File: src/components/AddTimelineForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  clientId: number;
};

export default function AddTimelineForm({
  clientId,
}: Props) {
  const router = useRouter();

  const [type, setType] = useState("Phone Call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const { error } = await supabase
      .from("timelines")
      .insert([
        {
          client_id: clientId,
          type,
          title,
          description: description || null,
          follow_up_date: followUpDate || null,
        },
      ]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    // Clear form
    setType("Phone Call");
    setTitle("");
    setDescription("");
    setFollowUpDate("");

    // Refresh page
    router.refresh();
  }

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-black mb-4">
        Add Timeline
      </h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded p-2 text-black"
        >
          <option>Phone Call</option>
          <option>WhatsApp</option>
          <option>Viewing</option>
          <option>Property Sent</option>
          <option>Follow Up</option>
          <option>Note</option>
        </select>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <textarea
          placeholder="Description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save Timeline
        </button>
      </form>
    </div>
  );
}