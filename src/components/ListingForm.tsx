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

  const [created, setCreated] =
    useState(false);

  const [title, setTitle] =
    useState(listing?.title ?? "");

  const [category, setCategory] =
    useState(
      listing?.category ??
      "Residential"
    );

  const [purpose, setPurpose] =
    useState(
      listing?.purpose ??
      "For Sale"
    );

  const [price, setPrice] =
    useState(
      listing?.price?.toString() ??
      ""
    );

  const [status, setStatus] =
    useState(
      listing?.status ??
      "Available"
    );

  const [listingAgent, setListingAgent] =
    useState(
      listing?.listing_agent ??
      ""
    );

  const [address, setAddress] =
    useState(
      listing?.address ??
      ""
    );

  const [area, setArea] =
    useState(
      listing?.area ??
      ""
    );

  const [state, setState] =
    useState(
      listing?.state ??
      "Perak"
    );

  const [landSize, setLandSize] =
    useState(
      listing?.land_size ??
      ""
    );

  const [builtUp, setBuiltUp] =
    useState(
      listing?.built_up ??
      ""
    );

  const [bedrooms, setBedrooms] =
    useState(
      listing?.bedrooms?.toString() ??
      ""
    );

  const [bathrooms, setBathrooms] =
    useState(
      listing?.bathrooms?.toString() ??
      ""
    );

  const [description, setDescription] =
    useState(
      listing?.description ??
      ""
    );

  // ====================================
  // Residential
  // ====================================

  const [
    residentialType,
    setResidentialType,
  ] = useState(
    listing?.residential_type ?? ""
  );

  const [
    residentialStorey,
    setResidentialStorey,
  ] = useState(
    listing?.residential_storey ?? ""
  );

  // ====================================
  // Commercial
  // ====================================

  const [
    commercialType,
    setCommercialType,
  ] = useState(
    listing?.commercial_type ?? ""
  );

  // ====================================
  // Industrial
  // ====================================

  const [
    industrialPropertyType,
    setIndustrialPropertyType,
  ] = useState(
    listing?.industrial_property_type ?? ""
  );

  const [
    industrialZoning,
    setIndustrialZoning,
  ] = useState(
    listing?.industrial_zoning ?? ""
  );

  const [
    industrialCeilingHeight,
    setIndustrialCeilingHeight,
  ] = useState(
    listing?.industrial_ceiling_height ?? ""
  );

  const [
    industrialPowerSupply,
    setIndustrialPowerSupply,
  ] = useState(
    listing?.industrial_power_supply ?? ""
  );

  // ====================================
  // Land
  // ====================================

  const [
    landType,
    setLandType,
  ] = useState(
    listing?.land_type ?? ""
  );

  // ====================================
  // CONTINUE PASTING PART 2 BELOW
  // ====================================
    async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!title.trim()) {

      alert("Please enter listing title.");

      return;

    }

    const payload = {

      title,

      category,

      purpose,

      price: Number(price),

      status,

      listing_agent:
        listingAgent || null,

      address:
        address || null,

      area,

      state,

      land_size:
        landSize || null,

      built_up:
        builtUp || null,

      bedrooms:
        bedrooms
          ? Number(bedrooms)
          : null,

      bathrooms:
        bathrooms
          ? Number(bathrooms)
          : null,

      description:
        description || null,

      residential_type:
        residentialType || null,

      residential_storey:
        residentialStorey || null,

      commercial_type:
        commercialType || null,

      industrial_property_type:
        industrialPropertyType || null,

      industrial_zoning:
        industrialZoning || null,

      industrial_ceiling_height:
        industrialCeilingHeight || null,

      industrial_power_supply:
        industrialPowerSupply || null,

      land_type:
        landType || null,

    };

    if (
      mode === "create"
    ) {

      const {

        data,

        error,

      } = await supabase

        .from("properties")

        .insert([payload])

        .select()

        .single();

      if (error) {

        alert(error.message);

        return;

      }

      alert(
        "Listing added successfully."
      );

      setCreated(true);

      if (onCreated) {

        onCreated(
          data.id,
          category
        );

      }

      return;

    }

    const { error } =

      await supabase

        .from("properties")

        .update(payload)

        .eq(
          "id",
          listing.id
        );

    if (error) {

      alert(error.message);

      return;

    }

    alert(
      "Listing updated successfully."
    );

    window.location.href =
      `/listings/${listing.id}`;

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

        {/* ============================== */}
        {/* Residential */}
        {/* ============================== */}

        {category === "Residential" && (
          <>
            <select
              value={residentialType}
              onChange={(e) =>
                setResidentialType(
                  e.target.value
                )
              }
              className="w-full border rounded p-2 text-black"
            >
              <option value="">
                Residential Type
              </option>
              <option>Terrace</option>
              <option>Semi-D</option>
              <option>Bungalow</option>
              <option>Apartment</option>
              <option>Condominium</option>
            </select>

            <select
              value={residentialStorey}
              onChange={(e) =>
                setResidentialStorey(
                  e.target.value
                )
              }
              className="w-full border rounded p-2 text-black"
            >
              <option value="">
                Storey
              </option>
              <option>Single Storey</option>
              <option>Double Storey</option>
              <option>Triple Storey</option>
            </select>
          </>
        )}

        {/* ============================== */}
        {/* Commercial */}
        {/* ============================== */}

        {category === "Commercial" && (
          <select
            value={commercialType}
            onChange={(e) =>
              setCommercialType(
                e.target.value
              )
            }
            className="w-full border rounded p-2 text-black"
          >
            <option value="">
              Commercial Type
            </option>
            <option>Shoplot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        )}

        {/* ============================== */}
        {/* CONTINUE PASTING PART 4 BELOW */}
        {/* ============================== */}

                {/* ============================== */}
        {/* Industrial */}
        {/* ============================== */}

                {/* ============================== */}
        {/* Industrial */}
        {/* ============================== */}

        {category === "Industrial" && (
          <>

            <select
              value={industrialPropertyType}
              onChange={(e) =>
                setIndustrialPropertyType(
                  e.target.value
                )
              }
              className="w-full border rounded p-2 text-black"
            >
              <option value="">
                Industrial Property Type
              </option>

              <option>
                Detached Factory
              </option>

              <option>
                Semi-Detached Factory
              </option>

              <option>
                Cluster Factory
              </option>

              <option>
                Linked Factory
              </option>

              <option>
                Warehouse
              </option>

            </select>

            <select
              value={industrialZoning}
              onChange={(e) =>
                setIndustrialZoning(
                  e.target.value
                )
              }
              className="w-full border rounded p-2 text-black"
            >
              <option value="">
                Industrial Zoning
              </option>

              <option>
                Light Industrial
              </option>

              <option>
                Medium Industrial
              </option>

              <option>
                Heavy Industrial
              </option>

            </select>

            <input
              type="text"
              placeholder="Ceiling Height (ft)"
              value={
                industrialCeilingHeight
              }
              onChange={(e) =>
                setIndustrialCeilingHeight(
                  e.target.value
                )
              }
              className="w-full border rounded p-2 text-black"
            />

            <input
              type="text"
              placeholder="Power Supply (Amp)"
              value={
                industrialPowerSupply
              }
              onChange={(e) =>
                setIndustrialPowerSupply(
                  e.target.value
                )
              }
              className="w-full border rounded p-2 text-black"
            />

          </>
        )}

        {/* ============================== */}
        {/* Land */}
        {/* ============================== */}

        {category === "Land" && (

          <select
            value={landType}
            onChange={(e) =>
              setLandType(
                e.target.value
              )
            }
            className="w-full border rounded p-2 text-black"
          >

            <option value="">
              Land Type
            </option>

            <option>
              Residential Land
            </option>

            <option>
              Commercial Land
            </option>

            <option>
              Industrial Land
            </option>

            <option>
              Agriculture Land
            </option>

          </select>

        )}

        <textarea
          rows={5}
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
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

          <button
            type="button"
            onClick={() => {
              window.location.href = "/listings";
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
          >
            Cancel
          </button>

      </form>

    </div>

  );

}