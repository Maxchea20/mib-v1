// File: src/components/EditTimelineForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  id: number;
  type: string;
  title: string;
  description: string | null;
  followUpDate: string | null;
  onCancel: () => void;
};

export default function EditTimelineForm({
  id,
  type: initialType,
  title: initialTitle,
  description: initialDescription,
  followUpDate: initialFollowUpDate,
  onCancel,
}: Props) {
  const router = useRouter();

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [followUpDate, setFollowUpDate] = useState(
    initialFollowUpDate ?? ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    const { error } = await supabase
      .from("timelines")
      .update({
        type,
        title,
        description: description || null,
        follow_up_date: followUpDate || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  return (
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
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded p-2 text-black"
      />

      <textarea
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

      <div className="space-x-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}