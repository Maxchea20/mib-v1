"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  mode: "create" | "edit";
  listing?: any;
  onCreated?: (propertyId: number, category: string) => void;
};

const inputClass = "w-full border rounded p-2 text-black";

export default function ListingForm({
  mode,
  listing,
  onCreated,
}: Props) {
  const [created, setCreated] = useState(false);
  const [title, setTitle] = useState(listing?.title ?? "");
  const [headline, setHeadline] = useState(listing?.headline ?? listing?.title ?? "");
  const [category, setCategory] = useState(listing?.category ?? "Residential");
  const [purpose, setPurpose] = useState(listing?.purpose ?? "For Sale");
  const [price, setPrice] = useState(listing?.price?.toString() ?? "");
  const [status, setStatus] = useState(listing?.status ?? "Available");
  const [listingAgent, setListingAgent] = useState(listing?.listing_agent ?? "");
  const [cobrokeAgentName, setCobrokeAgentName] = useState(listing?.cobroke_agent_name ?? "");
  const [address, setAddress] = useState(listing?.address ?? "");
  const [area, setArea] = useState(listing?.area ?? "");
  const [city, setCity] = useState(listing?.city ?? "");
  const [state, setState] = useState(listing?.state ?? "Perak");
  const [postalCode, setPostalCode] = useState(listing?.postal_code ?? "");
  const [landSize, setLandSize] = useState(listing?.land_size ?? "");
  const [builtUp, setBuiltUp] = useState(listing?.built_up ?? "");
  const [tenure, setTenure] = useState(listing?.tenure ?? "");
  const [titleType, setTitleType] = useState(listing?.title_type ?? "");
  const [facing, setFacing] = useState(listing?.facing ?? "");
  const [unitType, setUnitType] = useState(listing?.unit_type ?? "");
  const [furnishing, setFurnishing] = useState(listing?.furnishing ?? "");
  const [parkingSpaces, setParkingSpaces] = useState(listing?.parking_spaces?.toString() ?? "");
  const [bedrooms, setBedrooms] = useState(listing?.bedrooms?.toString() ?? "");
  const [bathrooms, setBathrooms] = useState(listing?.bathrooms?.toString() ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [highlights, setHighlights] = useState(
    Array.isArray(listing?.highlights) ? listing.highlights.join("\n") : ""
  );

  const [residentialType, setResidentialType] = useState(listing?.residential_type ?? "");
  const [residentialStorey, setResidentialStorey] = useState(listing?.residential_storey ?? "");
  const [commercialType, setCommercialType] = useState(listing?.commercial_type ?? "");
  const [industrialPropertyType, setIndustrialPropertyType] = useState(listing?.industrial_property_type ?? "");
  const [industrialZoning, setIndustrialZoning] = useState(listing?.industrial_zoning ?? "");
  const [industrialCeilingHeight, setIndustrialCeilingHeight] = useState(listing?.industrial_ceiling_height ?? "");
  const [industrialPowerSupply, setIndustrialPowerSupply] = useState(listing?.industrial_power_supply ?? "");
  const [landType, setLandType] = useState(listing?.land_type ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter listing title.");
      return;
    }

    if (!price) {
      alert("Please enter price.");
      return;
    }

    const payload = {
      title: title.trim(),
      headline: headline.trim() || null,
      category,
      purpose,
      price: Number(price),
      status,
      listing_agent: listingAgent || null,
      cobroke_agent_name:
        listingAgent === "Cobroke Agent"
          ? cobrokeAgentName.trim() || null
          : null,
      address: address.trim() || null,
      area: area.trim(),
      city: city.trim() || null,
      state: state.trim(),
      postal_code: postalCode.trim() || null,
      land_size: landSize.trim() || null,
      built_up: builtUp.trim() || null,
      tenure: tenure || null,
      title_type: titleType || null,
      facing: facing || null,
      unit_type: unitType.trim() || null,
      furnishing: furnishing || null,
      parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      bathrooms: bathrooms ? Number(bathrooms) : null,
      description: description.trim() || null,
      highlights: highlights
        ? highlights.split("\n").map((item: string) => item.trim()).filter(Boolean)
        : [],
      residential_type: residentialType || null,
      residential_storey: residentialStorey || null,
      commercial_type: commercialType || null,
      industrial_property_type: industrialPropertyType || null,
      industrial_zoning: industrialZoning || null,
      industrial_ceiling_height: industrialCeilingHeight || null,
      industrial_power_supply: industrialPowerSupply || null,
      land_type: landType || null,
    };

    if (mode === "create") {
      const { data, error } = await supabase
        .from("properties")
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      alert("Listing added successfully.");
      setCreated(true);
      onCreated?.(data.id, category);
      return;
    }

    const { error } = await supabase
      .from("properties")
      .update(payload)
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
        {mode === "create" ? "Add Listing" : "Edit Listing"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-black">Basic information</h3>

        <input
          type="text"
          placeholder="Listing Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />

        <input
          type="text"
          placeholder="iProperty Headline (maximum 70 characters)"
          maxLength={70}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className={inputClass}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
          <option>Land</option>
        </select>

        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputClass}>
          <option>For Sale</option>
          <option>For Rent</option>
        </select>

        <input
          type="number"
          min="0"
          placeholder="Price (RM)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          <option>Available</option>
          <option>Booked</option>
          <option>Sold</option>
          <option>Rented</option>
          <option>Inactive</option>
        </select>

        <select
          value={listingAgent}
          onChange={(e) => {
            setListingAgent(e.target.value);
            if (e.target.value !== "Cobroke Agent") setCobrokeAgentName("");
          }}
          className={inputClass}
        >
          <option value="">Select Listing Agent</option>
          <option value="Max">Max</option>
          <option value="Cobroke Agent">Cobroke Agent</option>
        </select>

        {listingAgent === "Cobroke Agent" && (
          <input
            type="text"
            placeholder="Cobroke Agent Name"
            value={cobrokeAgentName}
            onChange={(e) => setCobrokeAgentName(e.target.value)}
            className={inputClass}
          />
        )}

        <h3 className="pt-4 text-lg font-semibold text-black">Location</h3>

        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Area" value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
        <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />

        <h3 className="pt-4 text-lg font-semibold text-black">Property details</h3>

        <h4 className="pt-2 font-medium text-black">Property classification</h4>

        {category === "Residential" && (
          <>
            <select value={residentialType} onChange={(e) => setResidentialType(e.target.value)} className={inputClass}>
              <option value="">Property Sub Type</option>
              <option>Terraced House</option>
              <option>1-storey Terraced House</option>
              <option>1.5-storey Terraced House</option>
              <option>2-storey Terraced House</option>
              <option>2.5-storey Terraced House</option>
              <option>3-storey Terraced House</option>
              <option>3.5-storey Terraced House</option>
              <option>4-storey Terraced House</option>
              <option>4.5-storey Terraced House</option>
              <option>Townhouse</option>
            </select>

            <select value={residentialStorey} onChange={(e) => setResidentialStorey(e.target.value)} className={inputClass}>
              <option value="">Storey</option>
              <option>Single Storey</option>
              <option>Double Storey</option>
              <option>Triple Storey</option>
            </select>
          </>
        )}

        {category === "Commercial" && (
          <select value={commercialType} onChange={(e) => setCommercialType(e.target.value)} className={inputClass}>
            <option value="">Commercial Type</option>
            <option>Shoplot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
        )}

        {category === "Industrial" && (
          <>
            <select value={industrialPropertyType} onChange={(e) => setIndustrialPropertyType(e.target.value)} className={inputClass}>
              <option value="">Industrial Property Type</option>
              <option>Detached Factory</option>
              <option>Semi-Detached Factory</option>
              <option>Cluster Factory</option>
              <option>Linked Factory</option>
              <option>Warehouse</option>
            </select>

            <select value={industrialZoning} onChange={(e) => setIndustrialZoning(e.target.value)} className={inputClass}>
              <option value="">Industrial Zoning</option>
              <option>Light Industrial</option>
              <option>Medium Industrial</option>
              <option>Heavy Industrial</option>
            </select>

            <input type="text" placeholder="Ceiling Height (ft)" value={industrialCeilingHeight} onChange={(e) => setIndustrialCeilingHeight(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Power Supply (Amp)" value={industrialPowerSupply} onChange={(e) => setIndustrialPowerSupply(e.target.value)} className={inputClass} />
          </>
        )}

        {category === "Land" && (
          <select value={landType} onChange={(e) => setLandType(e.target.value)} className={inputClass}>
            <option value="">Land Type</option>
            <option>Residential Land</option>
            <option>Commercial Land</option>
            <option>Industrial Land</option>
            <option>Agriculture Land</option>
          </select>
        )}

        <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className={inputClass}>
          <option value="">Property Unit Type</option>
          <option>Intermediate</option>
          <option>Corner Lot</option>
          <option>End Lot</option>
          <option>Duplex</option>
          <option>Triplex</option>
          <option>Penthouse</option>
          <option>Studio</option>
          <option>Soho</option>
          <option>Loft</option>
          <option>Dual Key</option>
          <option>Ground Floor Unit</option>
          <option>Garden Unit</option>
          <option>Prefer not to say</option>
        </select>

        <h4 className="pt-2 font-medium text-black">Size and layout</h4>

        <input type="text" placeholder="Land Size (e.g. 20 x 65 ft or 1,400 sqft)" value={landSize} onChange={(e) => setLandSize(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Built-up (e.g. 2,000 sqft)" value={builtUp} onChange={(e) => setBuiltUp(e.target.value)} className={inputClass} />
        <input type="number" min="0" placeholder="Bedrooms" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputClass} />
        <input type="number" min="0" placeholder="Bathrooms" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={inputClass} />
        <input type="number" min="0" placeholder="Parking Spaces" value={parkingSpaces} onChange={(e) => setParkingSpaces(e.target.value)} className={inputClass} />

        <h4 className="pt-2 font-medium text-black">Condition and ownership</h4>

        <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className={inputClass}>
          <option value="">Furnishing</option>
          <option value="fully_furnished">Fully Furnished</option>
          <option value="partially_furnished">Partially Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>

        <select value={facing} onChange={(e) => setFacing(e.target.value)} className={inputClass}>
          <option value="">Facing</option>
          <option>North</option>
          <option>South</option>
          <option>East</option>
          <option>West</option>
          <option>North East</option>
          <option>North West</option>
          <option>South East</option>
          <option>South West</option>
        </select>

        <select value={tenure} onChange={(e) => setTenure(e.target.value)} className={inputClass}>
          <option value="">Tenure</option>
          <option>Freehold</option>
          <option>Leasehold</option>
        </select>

        <select value={titleType} onChange={(e) => setTitleType(e.target.value)} className={inputClass}>
          <option value="">Title Type</option>
          <option>Individual</option>
          <option>Strata</option>
          <option>Master Title</option>
        </select>

        <h3 className="pt-4 text-lg font-semibold text-black">Description</h3>

        <textarea
          rows={5}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />

        <textarea
          rows={5}
          placeholder="Property Highlights — one highlight per line"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          className={inputClass}
        />

        <div className="flex gap-3">
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
        </div>
      </form>
    </div>
  );
}
