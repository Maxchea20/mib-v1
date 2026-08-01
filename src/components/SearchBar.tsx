"use client";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({
  search,
  setSearch,
}: Props) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="🔍 Search client..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-4 py-2 w-full text-black"
      />
    </div>
  );
}