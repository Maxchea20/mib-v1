"use client";

import { useEffect, useState } from "react";

type Listing = {
  id: number;
  title?: string | null;
  headline?: string | null;
  price?: number | string | null;
  area?: string | null;
  [key: string]: any;
};

const WHATSAPP_KEY = "mib_whatsapp_number";

export default function GoogleBusinessMarketing({
  listings,
}: {
  listings: Listing[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [search, setSearch] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    try {
      setWhatsapp(localStorage.getItem(WHATSAPP_KEY) ?? "");
    } catch {}
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = listings.filter(
    (l) =>
      !keyword ||
      `${l.title ?? ""} ${l.area ?? ""}`.toLowerCase().includes(keyword)
  );

  async function post() {
    if (!selectedId) {
      setError("Please select a listing.");
      return;
    }

    setPosting(true);
    setError("");
    setSuccess("");
    setPreview(null);

    try {
      try {
        localStorage.setItem(WHATSAPP_KEY, whatsapp);
      } catch {}

      const response = await fetch("/api/marketing/google-business/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedId,
          whatsappNumber: whatsapp,
          dryRun,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to queue Google Business post.");
      }

      setPreview(data.preview);
      setSuccess(
        dryRun
          ? `✅ Queued as a test (fills the post but does not publish). Job ID: ${data.jobId}`
          : `✅ Google Business post queued. Job ID: ${data.jobId}`
      );
    } catch (err: any) {
      setError(err?.message || "Failed to queue Google Business post.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-black mb-1">
            Google Business Profile
          </h2>
          <p className="text-sm text-gray-500">
            Adds the listing to your profile as a Product: photo, name, price,
            description and a WhatsApp link.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Your WhatsApp number
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="60123456789 (with country code)"
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Listing</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="mb-2 w-full rounded-lg border px-3 py-2"
          />
          <select
            value={selectedId ?? ""}
            onChange={(e) =>
              setSelectedId(e.target.value ? Number(e.target.value) : null)
            }
            size={6}
            className="w-full rounded-lg border px-3 py-2"
          >
            {filtered.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title || l.headline || `Listing #${l.id}`}
                {l.area ? ` — ${l.area}` : ""}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
          />
          Test run — fill the product but don&apos;t publish (recommended the
          first time)
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-sm text-green-700">{success}</p>
            {preview && (
              <pre className="whitespace-pre-wrap text-xs text-gray-700">
                {preview.description ?? preview.summary}
                {"\n\n"}Link: {preview.button_url}
              </pre>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={post}
          disabled={posting || !selectedId}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg font-semibold"
        >
          {posting
            ? "Queuing..."
            : dryRun
              ? "Test Google Business Post"
              : "Post to Google Business"}
        </button>
      </div>
    </div>
  );
}
