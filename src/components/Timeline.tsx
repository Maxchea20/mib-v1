// File: src/components/Timeline.tsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import EditTimelineForm from "@/components/EditTimelineForm";

type TimelineItem = {
  id: number;
  type: string;
  title: string;
  description: string | null;
  follow_up_date: string | null;
  created_at: string;
};

export default function Timeline({
  timeline,
}: {
  timeline: TimelineItem[];
}) {
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "Are you sure you want to delete this timeline?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("timelines")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.reload();
  }

  if (timeline.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-black mb-4">
          Timeline
        </h2>

        <p className="text-gray-500">
          No timeline entries yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-black mb-4">
        Timeline
      </h2>

      {timeline.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg p-4 mb-4"
        >
          {editingId === item.id ? (
            <EditTimelineForm
              id={item.id}
              type={item.type}
              title={item.title}
              description={item.description}
              followUpDate={item.follow_up_date}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <p className="font-semibold text-black">
                {item.type}
              </p>

              <p className="text-black">
                {item.title}
              </p>

              {item.description && (
                <p className="text-gray-600 mt-2">
                  {item.description}
                </p>
              )}

              <p className="text-sm text-gray-400 mt-2">
                {new Date(item.created_at).toISOString().split("T")[0]}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditingId(item.id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}