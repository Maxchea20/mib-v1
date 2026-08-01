// File: src/components/StatusFilter.tsx

"use client";

type Props = {
  status: string;
  setStatus: (value: string) => void;
};

const statuses = [
  "All",
  "New Lead",
  "Follow Up",
  "Viewing",
  "Closed",
];

export default function StatusFilter({
  status,
  setStatus,
}: Props) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {statuses.map((item) => (
        <button
          key={item}
          onClick={() => setStatus(item)}
          className={`px-4 py-2 rounded ${
            status === item
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}