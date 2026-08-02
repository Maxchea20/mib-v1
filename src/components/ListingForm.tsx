// File: src/components/ListingForm.tsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  mode: "create" | "edit";
  listing?: any;
  onCreated?: (
    propertyId: number,
    category: string
  ) => void;
};

export default function ListingForm({
  mode,
  listing,
  onCreated,
}: Props) {
  const [title, setTitle] = useState(listing?.title ?? "");
  const [category, setCategory] = useState(
    listing?.category ?? "Residential"
  );
  const [purpose, setPurpose] = useState(
    listing?.purpose ?? "For Sale"
  );
  const [price, setPrice] = useState(
    listing?.price?.toString() ?? ""
  );
  const [status, setStatus] = useState(
    listing?.status ?? "Available"
  );

  const [listingAgent, setListingAgent] = useState(
    listing?.listing_agent ?? ""
  );

  const [address, setAddress] = useState(
    listing?.address ?? ""
  );
  const [area, setArea] = useState(
    listing?.area ?? ""
  );
  const [state, setState] = useState(
    listing?.state ?? "Perak"
  );
  const [landSize, setLandSize] = useState(
    listing?.land_size ?? ""
  );
  const [builtUp, setBuiltUp] = useState(
    listing?.built_up ?? ""
  );
  const [bedrooms, setBedrooms] = useState(
    listing?.bedrooms?.toString() ?? ""
  );
  const [bathrooms, setBathrooms] = useState(
    listing?.bathrooms?.toString() ?? ""
  );
  const [description, setDescription] = useState(
  listing?.description ?? ""
);
const [created, setCreated] = useState(false);
  

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter listing title.");
      return;
    }

    if (mode === "create") {
  const { data, error } = await supabase
    .from("properties")
    .insert([
      {
        title,
        category,
        purpose,
        price: Number(price),
        status,
        listing_agent: listingAgent || null,
        address: address || null,
        area,
        state,
        land_size: landSize || null,
        built_up: builtUp || null,
        bedrooms: bedrooms
          ? Number(bedrooms)
          : null,
        bathrooms: bathrooms
          ? Number(bathrooms)
          : null,
        description:
          description || null,
      },
    ])
    .select()
    .single();

      if (error) {
  alert(error.message);
  return;
}

alert("Listing added successfully.");

setCreated(true);

if (onCreated) {
  onCreated(data.id, category);
}

return;
    }

    const { error } = await supabase
      .from("properties")
      .update({
        title,
        category,
        purpose,
        price: Number(price),
        status,
        listing_agent: listingAgent || null,
        address: address || null,
        area,
        state,
        land_size: landSize || null,
        built_up: builtUp || null,
        bedrooms: bedrooms
          ? Number(bedrooms)
          : null,
        bathrooms: bathrooms
          ? Number(bathrooms)
          : null,
        description:
          description || null,
      })
      .eq("id", listing.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Listing updated successfully.");

    window.location.href = `/listings/${listing.id}`;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">

      <h2 className="text-2xl font-semibold text-black mb-6">
        {mode === "create"
          ? "Add Listing"
          : "Edit Listing"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="text"
          placeholder="Listing Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded p-2 text-black"
        >
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Land</option>
        </select>

        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full border rounded p-2 text-black"
        >
          <option>For Sale</option>
          <option>For Rent</option>
        </select>

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2 text-black"
        >
          <option>Available</option>
          <option>Booked</option>
          <option>Sold</option>
          <option>Rented</option>
          <option>Inactive</option>
        </select>

        <input
          type="text"
          placeholder="Listing Agent"
          value={listingAgent}
          onChange={(e) => setListingAgent(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="text"
          placeholder="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="text"
          placeholder="Land Size"
          value={landSize}
          onChange={(e) => setLandSize(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="text"
          placeholder="Built-up"
          value={builtUp}
          onChange={(e) => setBuiltUp(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="number"
          placeholder="Bedrooms"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <input
          type="number"
          placeholder="Bathrooms"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <textarea
          rows={5}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 text-black"
        />

        <button
  type="submit"
  disabled={created}
  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded"
>
  {mode === "create"
    ? created
      ? "Listing Saved"
      : "Save Listing"
    : "Update Listing"}
</button>

      </form>

    </div>
  );
}