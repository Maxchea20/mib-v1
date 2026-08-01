// File: src/components/Timeline.tsx

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
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}