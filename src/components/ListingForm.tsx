"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TOWNSHIPS_BY_CITY } from "@/lib/townshipsByCity";

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

  const [title, setTitle] =
    useState(listing?.title ?? "");

  const [headline, setHeadline] =
    useState(
      listing?.headline ??
      listing?.title ??
      ""
    );

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

  const [propertyType, setPropertyType] =
    useState(
      listing?.property_type ??
      ""
    );

  const [propertySubType, setPropertySubType] =
    useState(
      listing?.property_sub_type ??
      ""
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

  // Show on the public website (maxproperty.my). New listings start OFF.
  const [isPublic, setIsPublic] =
    useState<boolean>(
      listing?.is_public === true
    );

  const [listingAgent, setListingAgent] =
    useState(
      listing?.listing_agent ??
      ""
    );

  const [cobrokeAgentName, setCobrokeAgentName] =
    useState(
      listing?.cobroke_agent_name ??
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

  const [city, setCity] =
    useState(
      listing?.city ??
      ""
    );

  const [state, setState] =
    useState(
      listing?.state ??
      "Perak"
    );

  const [postalCode, setPostalCode] =
    useState(
      listing?.postal_code ??
      ""
    );

  /*
  | Remembered township -> city + postal code (table: township_lookup).
  | Learned from saved listings, so you only set each township once.
  */
  type TownshipRow = {
    township: string;
    label: string;
    city: string;
    postal_code: string;
  };

  const [townshipRows, setTownshipRows] =
    useState<TownshipRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("township_lookup")
      .select("township, label, city, postal_code")
      .then(({ data }) => {
        if (cancelled || !data) return;

        setTownshipRows(
          data.map((r) => ({
            township: r.township,
            label: r.label || r.township,
            city: r.city ?? "",
            postal_code: r.postal_code,
          }))
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  | Same township name can exist in different cities with different
  | postcodes, so remembered rows are matched on township AND city.
  */
  function applyTownshipMemory(
    township: string,
    currentCity: string
  ) {
    const matches = townshipRows.filter(
      (r) =>
        r.township === township.trim().toLowerCase()
    );

    if (matches.length === 0) return;

    const sameCity = matches.find(
      (r) =>
        currentCity &&
        r.city.toLowerCase() === currentCity.toLowerCase()
    );

    if (sameCity) {
      setPostalCode(sameCity.postal_code);
      return;
    }

    if (matches.length === 1) {
      setPostalCode(matches[0].postal_code);
      if (matches[0].city) setCity(matches[0].city);
    }
  }

  /*
  | Township suggestions follow the chosen city: the iProperty list for
  | that city, plus any township remembered for it from saved listings.
  */
  const townshipSuggestions = Array.from(
    new Set([
      ...(TOWNSHIPS_BY_CITY[city] ?? []),
      ...townshipRows
        .filter(
          (r) =>
            city &&
            r.city.toLowerCase() === city.toLowerCase()
        )
        .map((r) => r.label),
    ])
  );

  function handleTownshipChange(value: string) {
    setArea(value);
    applyTownshipMemory(value, city);
  }

  function handleCityChange(value: string) {
    setCity(value);

    if (area.trim()) applyTownshipMemory(area, value);
  }

  /*
  | Postcode finder. Asks OpenStreetMap (Nominatim) for postcodes near
  | "township, city, state". Results are only SUGGESTIONS: click one to
  | use it. Once a listing is saved, township_lookup remembers it.
  */
  const [postcodeHints, setPostcodeHints] =
    useState<string[]>([]);
  const [postcodeBusy, setPostcodeBusy] =
    useState(false);
  const [postcodeMsg, setPostcodeMsg] =
    useState("");

  function placeQuery() {
    return [area, city, state, "Malaysia"]
      .map((v) => v.trim())
      .filter(Boolean)
      .join(", ");
  }

  async function findPostcode() {
    if (!area.trim() && !city.trim()) {
      setPostcodeMsg("Pick a township or city first.");
      setPostcodeHints([]);
      return;
    }

    setPostcodeBusy(true);
    setPostcodeMsg("");
    setPostcodeHints([]);

    try {
      const url =
        "https://nominatim.openstreetmap.org/search?" +
        new URLSearchParams({
          q: placeQuery(),
          format: "jsonv2",
          addressdetails: "1",
          countrycodes: "my",
          limit: "8",
        }).toString();

      const res = await fetch(url);

      if (!res.ok) throw new Error(String(res.status));

      const rows: {
        address?: { postcode?: string };
      }[] = await res.json();

      const codes = Array.from(
        new Set(
          rows
            .map((r) => r.address?.postcode?.trim())
            .filter((v): v is string => !!v && /^\d{5}$/.test(v))
        )
      );

      setPostcodeHints(codes);

      if (codes.length === 0) {
        setPostcodeMsg(
          "No postcode found. Use the Google Maps link to check."
        );
      }
    } catch {
      setPostcodeMsg(
        "Postcode lookup failed. Use the Google Maps link to check."
      );
    } finally {
      setPostcodeBusy(false);
    }
  }

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

  const [tenure, setTenure] =
    useState(
      listing?.tenure ??
      ""
    );

  const [titleType, setTitleType] =
    useState(
      listing?.title_type ??
      ""
    );

  const [facing, setFacing] =
    useState(
      listing?.facing ??
      ""
    );

  const [unitType, setUnitType] =
    useState(
      listing?.unit_type ??
      ""
    );

  const [furnishing, setFurnishing] =
    useState(
      listing?.furnishing ??
      ""
    );

  const [condition, setCondition] =
    useState(
      listing?.condition ??
      ""
    );

  const [electricityPhase, setElectricityPhase] =
    useState(
      listing?.electricity_phase ??
      ""
    );

  const [parkingSpaces, setParkingSpaces] =
    useState(
      listing?.parking_spaces?.toString() ??
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

  const [highlights, setHighlights] =
    useState(
      Array.isArray(
        listing?.highlights
      )
        ? listing.highlights.join(
            "\n"
          )
        : ""
    );

  const [residentialStorey, setResidentialStorey] =
    useState(
      listing?.residential_storey ??
      ""
    );

  const [industrialZoning, setIndustrialZoning] =
    useState(
      listing?.industrial_zoning ??
      ""
    );

  const [industrialCeilingHeight, setIndustrialCeilingHeight] =
    useState(
      listing?.industrial_ceiling_height ??
      ""
    );

  const [industrialPowerSupply, setIndustrialPowerSupply] =
    useState(
      listing?.industrial_power_supply ??
      ""
    );

  const [landType, setLandType] =
    useState(
      listing?.land_type ??
      ""
    );

  // iProperty "Land title type" for Industrial Land (Industrial category).
  const [landTitleType, setLandTitleType] =
    useState(
      listing?.property_sub_type ===
        "Industrial Land"
        ? listing?.land_type ?? "Industrial"
        : "Industrial"
    );

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      alert(
        "Please enter listing title."
      );
      return;
    }

    if (!price) {
      alert(
        "Please enter price."
      );
      return;
    }

    const payload = {
      title:
        title.trim(),

      headline:
        headline.trim() ||
        null,

      category,

      purpose,

      price:
        Number(price),

      status,

      is_public:
        isPublic,

      listing_agent:
        listingAgent ||
        null,

      cobroke_agent_name:
        listingAgent ===
        "Cobroke Agent"
          ? cobrokeAgentName.trim() ||
            null
          : null,

      address:
        address.trim() ||
        null,

      area:
        area.trim(),

      city:
        city.trim() ||
        null,

      state:
        state.trim(),

      postal_code:
        postalCode.trim() ||
        null,

      /*
      |--------------------------------------------------------------------------
      | LAND SIZE
      |--------------------------------------------------------------------------
      |
      | Commercial does not use Land Size.
      |
      */

      land_size:
        category ===
        "Commercial"
          ? null
          : landSize.trim() ||
            null,

      /*
      |--------------------------------------------------------------------------
      | BUILT-UP
      |--------------------------------------------------------------------------
      */

      built_up:
        builtUp.trim() ||
        null,

      tenure:
        tenure ||
        null,

      title_type:
        titleType ||
        null,

      facing:
        facing ||
        null,

      unit_type:
        unitType.trim() ||
        null,

      /*
      |--------------------------------------------------------------------------
      | FURNISHING
      |--------------------------------------------------------------------------
      |
      | Residential only.
      |
      */

      furnishing:
        category ===
        "Residential"
          ? furnishing ||
            null
          : null,

      /*
      |--------------------------------------------------------------------------
      | PARKING
      |--------------------------------------------------------------------------
      |
      | Residential + Industrial.
      | Commercial does not use Parking.
      |
      */

      parking_spaces:
        category ===
          "Residential" ||
        category ===
          "Industrial"
          ? parkingSpaces
            ? Number(
                parkingSpaces
              )
            : null
          : null,

      /*
      |--------------------------------------------------------------------------
      | BEDROOMS
      |--------------------------------------------------------------------------
      |
      | Residential only.
      |
      */

      bedrooms:
        category ===
        "Residential"
          ? bedrooms
            ? Number(
                bedrooms
              )
            : null
          : null,

      /*
      |--------------------------------------------------------------------------
      | BATHROOMS
      |--------------------------------------------------------------------------
      |
      | Residential / Commercial / Industrial.
      |
      */

      bathrooms:
        bathrooms
          ? Number(
              bathrooms
            )
          : null,

      /*
      |--------------------------------------------------------------------------
      | CONDITION
      |--------------------------------------------------------------------------
      |
      | Commercial + Industrial.
      |
      */

      condition:
        category ===
          "Commercial" ||
        category ===
          "Industrial"
          ? condition ||
            null
          : null,

      /*
      |--------------------------------------------------------------------------
      | ELECTRICITY PHASE
      |--------------------------------------------------------------------------
      |
      | Commercial + Industrial.
      |
      */

      electricity_phase:
        category ===
          "Commercial" ||
        category ===
          "Industrial"
          ? electricityPhase ||
            null
          : null,

      description:
        description.trim() ||
        null,

      highlights:
        highlights
          ? highlights
              .split("\n")
              .map(
                (
                  item: string
                ) =>
                  item.trim()
              )
              .filter(Boolean)
          : [],

      property_type:
        propertyType ||
        null,

      property_sub_type:
        propertySubType ||
        null,

      /*
      |--------------------------------------------------------------------------
      | RESIDENTIAL LEGACY DATA
      |--------------------------------------------------------------------------
      */

      residential_type:
        category ===
        "Residential"
          ? propertyType ===
            "Bungalow / Villa"
            ? "Bungalow"
            : propertyType ===
              "Semi-Detached House"
              ? "Semi-D"
              : propertyType ===
                "Terrace / Link House"
                ? "Terrace"
                : propertyType ===
                  "Condominium"
                  ? "Condominium"
                  : null
          : null,

      residential_storey:
        category ===
        "Residential"
          ? residentialStorey ||
            null
          : null,

      /*
      |--------------------------------------------------------------------------
      | COMMERCIAL LEGACY DATA
      |--------------------------------------------------------------------------
      */

      commercial_type:
        category ===
        "Commercial"
          ? propertySubType ===
              "Shop" ||
            propertySubType ===
              "Shop / Office"
            ? "Shoplot"
            : propertySubType ===
              "Office"
              ? "Office"
              : propertySubType ===
                  "Retail Space" ||
                propertySubType ===
                  "Retail Office"
                ? "Retail"
                : null
          : null,

      /*
      |--------------------------------------------------------------------------
      | INDUSTRIAL
      |--------------------------------------------------------------------------
      */

      industrial_property_type:
        category ===
        "Industrial"
          ? propertySubType ===
              "Semi-D factory"
            ? "Semi-Detached Factory"
            : propertySubType ===
                "Cluster factory"
              ? "Cluster Factory"
              : propertySubType ===
                  "Detached factory"
                ? "Detached Factory"
                : propertySubType ===
                    "Terrace factory"
                  ? "Terrace Factory"
                  : propertySubType ||
                    null
          : null,

      industrial_zoning:
        category ===
        "Industrial"
          ? industrialZoning ||
            null
          : null,

      industrial_ceiling_height:
        category ===
        "Industrial"
          ? industrialCeilingHeight.trim() ||
            null
          : null,

      /*
      |--------------------------------------------------------------------------
      | POWER SUPPLY
      |--------------------------------------------------------------------------
      |
      | Commercial + Industrial.
      |
      */

      industrial_power_supply:
        category ===
          "Commercial" ||
        category ===
          "Industrial"
          ? industrialPowerSupply.trim() ||
            null
          : null,

      land_type:
        category ===
        "Land"
          ? landType ||
            null
          : category ===
              "Industrial" &&
            propertySubType ===
              "Industrial Land"
            ? landTitleType ||
              "Industrial"
            : null,
    };


    /*
    | Remember township -> city + postal code for next time.
    */
    async function rememberTownship() {
      const t = area.trim();
      const pc = postalCode.trim();

      if (!t || !pc) return;

      await supabase.from("township_lookup").upsert(
        {
          township: t.toLowerCase(),
          label: t,
          state: state.trim() || null,
          city: city.trim(),
          postal_code: pc,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "township,city" }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    if (
      mode ===
      "create"
    ) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "properties"
        )
        .insert([
          payload,
        ])
        .select()
        .single();

      if (error) {
        alert(
          error.message
        );
        return;
      }

      await rememberTownship();

      alert(
        "Listing added successfully."
      );

      setCreated(
        true
      );

      onCreated?.(
        data.id,
        category
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */

    const {
      error,
    } = await supabase
      .from(
        "properties"
      )
      .update(
        payload
      )
      .eq(
        "id",
        listing.id
      );

    if (error) {
      alert(
        error.message
      );
      return;
    }

    await rememberTownship();

    alert(
      "Listing updated successfully."
    );

    window.location.href =
      `/listings/${listing.id}`;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">

      <h2 className="text-2xl font-semibold text-black mb-6">
        {mode ===
        "create"
          ? "Add Listing"
          : "Edit Listing"}
      </h2>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-4"
      >

        {/* ================================================================ */}
        {/* BASIC INFORMATION */}
        {/* ================================================================ */}

        <h3 className="text-lg font-semibold text-black">
          Basic information
        </h3>

        <input
          type="text"
          placeholder="Listing Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        <input
          type="text"
          placeholder="iProperty Headline (maximum 70 characters)"
          maxLength={70}
          value={headline}
          onChange={(e) =>
            setHeadline(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        {/* ================================================================ */}
        {/* CATEGORY */}
        {/* ================================================================ */}

        <select
          value={category}
          onChange={(e) => {

            const nextCategory =
              e.target.value;

            setCategory(
              nextCategory
            );

            setPropertyType(
              nextCategory ===
              "Commercial"
                ? "Commercial"
                : nextCategory ===
                  "Industrial"
                  ? "Industrial"
                  : ""
            );

            setPropertySubType(
              ""
            );

            setUnitType(
              ""
            );

            if (
              nextCategory !==
              "Residential"
            ) {
              setResidentialStorey(
                ""
              );

              setFurnishing(
                ""
              );

              setBedrooms(
                ""
              );
            }

            if (
              nextCategory !==
              "Industrial"
            ) {
              setIndustrialZoning(
                ""
              );

              setIndustrialCeilingHeight(
                ""
              );
            }

            if (
              nextCategory !==
                "Commercial" &&
              nextCategory !==
                "Industrial"
            ) {
              setCondition(
                ""
              );

              setElectricityPhase(
                ""
              );

              setIndustrialPowerSupply(
                ""
              );
            }

            if (
              nextCategory ===
              "Commercial"
            ) {
              setLandSize(
                ""
              );

              setParkingSpaces(
                ""
              );
            }
          }}
          className={
            inputClass
          }
        >
          <option>
            Residential
          </option>

          <option>
            Commercial
          </option>

          <option>
            Industrial
          </option>

          <option>
            Land
          </option>
        </select>

        {/* ================================================================ */}
        {/* PURPOSE */}
        {/* ================================================================ */}

        <select
          value={purpose}
          onChange={(e) =>
            setPurpose(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option>
            For Sale
          </option>

          <option>
            For Rent
          </option>
        </select>

        {/* ================================================================ */}
        {/* PRICE */}
        {/* ================================================================ */}

        <input
          type="number"
          min="0"
          placeholder="Price (RM)"
          value={price}
          onChange={(e) =>
            setPrice(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        {/* ================================================================ */}
        {/* STATUS */}
        {/* ================================================================ */}

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option>
            Available
          </option>

          <option>
            Booked
          </option>

          <option>
            Sold
          </option>

          <option>
            Rented
          </option>

          <option>
            Inactive
          </option>
        </select>

        {/* PUBLIC WEBSITE */}
        <label className="flex items-start gap-3 rounded border bg-white p-3 text-black">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) =>
              setIsPublic(
                e.target.checked
              )
            }
            className="mt-1 h-5 w-5"
          />
          <span>
            <span className="block font-medium">
              Show on public website
            </span>
            <span className="block text-sm text-slate-600">
              Visitors see the photos, price, area, details and description
              (not the exact address or any owner or agent details). Only
              shown while the status is Available or Booked.
            </span>
          </span>
        </label>

        {/* ================================================================ */}
        {/* LISTING AGENT */}
        {/* ================================================================ */}

        <select
          value={
            listingAgent
          }
          onChange={(e) => {

            setListingAgent(
              e.target.value
            );

            if (
              e.target.value !==
              "Cobroke Agent"
            ) {
              setCobrokeAgentName(
                ""
              );
            }
          }}
          className={
            inputClass
          }
        >
          <option value="">
            Select Listing Agent
          </option>

          <option value="Max">
            Max
          </option>

          <option value="Cobroke Agent">
            Cobroke Agent
          </option>
        </select>

        {listingAgent ===
          "Cobroke Agent" && (

          <input
            type="text"
            placeholder="Cobroke Agent Name"
            value={
              cobrokeAgentName
            }
            onChange={(e) =>
              setCobrokeAgentName(
                e.target.value
              )
            }
            className={
              inputClass
            }
          />

        )}

        {/* ================================================================ */}
        {/* LOCATION */}
        {/* ================================================================ */}

        <h3 className="pt-4 text-lg font-semibold text-black">
          Location
        </h3>

        <select
          value={state}
          onChange={(e) =>
            setState(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option value="">
            State
          </option>

          <option>
            Perak
          </option>

          <option>
            Selangor
          </option>

          <option>
            Kuala Lumpur
          </option>

          <option>
            Penang
          </option>

          <option>
            Johor
          </option>

          <option>
            Kedah
          </option>

          <option>
            Kelantan
          </option>

          <option>
            Melaka
          </option>

          <option>
            Negeri Sembilan
          </option>

          <option>
            Pahang
          </option>

          <option>
            Perlis
          </option>

          <option>
            Sabah
          </option>

          <option>
            Sarawak
          </option>

          <option>
            Terengganu
          </option>
        </select>

        <select
          value={city}
          onChange={(e) =>
            handleCityChange(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option value="">
            City
          </option>

          <option>
            Ipoh
          </option>

          <option>
            Lahat
          </option>

          <option>
            Chemor
          </option>

          <option>
            Menglembu
          </option>

          <option>
            Batu Gajah
          </option>

          <option>
            Pusing
          </option>

          <option>
            Ulu Kinta
          </option>

          <option>
            Gopeng
          </option>

          <option>
            Jelapang
          </option>

          <option>
            Kampar
          </option>

          <option>
            Kampung Kepayang
          </option>

          <option>
            Lumut
          </option>

          <option>
            Malim Nawar
          </option>

          <option>
            Simpang Pulai
          </option>
        </select>

        {/* ================================================================ */}
        {/* TOWNSHIP */}
        {/* ================================================================ */}

        <input
          type="text"
          list="township-options"
          placeholder={city ? "Township" : "Township (pick city first)"}
          value={area}
          onChange={(e) =>
            handleTownshipChange(
              e.target.value
            )
          }
          className={
            inputClass
          }
          autoComplete="off"
        />

        <datalist id="township-options">
          {townshipSuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        {/* ================================================================ */}
        {/* ADDRESS */}
        {/* ================================================================ */}

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) =>
            setAddress(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        <input
          type="text"
          placeholder="Postal Code"
          value={postalCode}
          onChange={(e) =>
            setPostalCode(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={findPostcode}
            disabled={postcodeBusy}
            className="rounded border border-gray-300 px-3 py-1 text-black"
          >
            {postcodeBusy
              ? "Searching..."
              : "Find postcode"}
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Check on Google Maps
          </a>

          {postcodeHints.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setPostalCode(code);
                setPostcodeHints([]);
              }}
              className="rounded bg-gray-100 px-2 py-1 text-black"
            >
              Use {code}
            </button>
          ))}

          {postcodeMsg && (
            <span className="text-gray-600">
              {postcodeMsg}
            </span>
          )}
        </div>

        {/* ================================================================ */}
        {/* PROPERTY DETAILS */}
        {/* ================================================================ */}

        <h3 className="pt-4 text-lg font-semibold text-black">
          Property details
        </h3>

        <h4 className="pt-2 font-medium text-black">
          Property classification
        </h4>

        {/* ================================================================ */}
        {/* RESIDENTIAL CLASSIFICATION */}
        {/* ================================================================ */}

        {category ===
          "Residential" && (
          <>

            <select
              value={
                propertyType
              }
              onChange={(e) => {

                setPropertyType(
                  e.target.value
                );

                setPropertySubType(
                  ""
                );

              }}
              className={
                inputClass
              }
            >
              <option value="">
                Property Type
              </option>

              <option>
                Bungalow / Villa
              </option>

              <option>
                Semi-Detached House
              </option>

              <option>
                Terrace / Link House
              </option>

              <option>
                Condominium
              </option>
            </select>

            {propertyType ===
              "Semi-Detached House" && (

              <select
                value={
                  propertySubType
                }
                onChange={(e) =>
                  setPropertySubType(
                    e.target.value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Property Sub Type
                </option>

                <option>
                  Semi-Detached House
                </option>

                <option>
                  Cluster House
                </option>
              </select>

            )}

            {propertyType ===
              "Bungalow / Villa" && (

              <select
                value={
                  propertySubType
                }
                onChange={(e) =>
                  setPropertySubType(
                    e.target.value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Property Sub Type
                </option>

                <option>
                  Bungalow
                </option>

                <option>
                  Zero-Lot Bungalow
                </option>

                <option>
                  Link Bungalow
                </option>

                <option>
                  Bungalow Land
                </option>

                <option>
                  Twin Villas
                </option>

              </select>

            )}

            {propertyType ===
  "Terrace / Link House" && (

  <select
    value={
      propertySubType
    }
    onChange={(e) =>
      setPropertySubType(
        e.target.value
      )
    }
    className={
      inputClass
    }
  >
    <option value="">
      Property Sub Type
    </option>

    <option>
      Terrace House
    </option>

    <option>
      1-storey Terraced House
    </option>

    <option>
      1.5-storey Terraced House
    </option>

    <option>
      2-storey Terrace House
    </option>

    <option>
      2.5-storey Terraced House
    </option>

    <option>
      3-storey Terraced House
    </option>

    <option>
      3.5-storey Terraced House
    </option>

    <option>
      4-storey Terraced House
    </option>

    <option>
      4.5-storey Terraced House
    </option>

    <option>
      Townhouse
    </option>

  </select>
)}

            <select
              value={
                unitType
              }
              onChange={(e) =>
                setUnitType(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Property Unit Type
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Corner Lot
              </option>

              <option>
                End Lot
              </option>

              <option>
                Duplex
              </option>

              <option>
                Triplex
              </option>

              <option>
                Penthouse
              </option>

              <option>
                Studio
              </option>

              <option>
                Soho
              </option>

              <option>
                Loft
              </option>

              <option>
                Dual Key
              </option>

              <option>
                Ground Floor Unit
              </option>

              <option>
                Garden Unit
              </option>

              <option>
                Prefer not to say
              </option>
            </select>

          </>
        )}

        {/* ================================================================ */}
        {/* COMMERCIAL CLASSIFICATION */}
        {/* ================================================================ */}

        {category ===
          "Commercial" && (
          <>

            <select
              value={
                propertyType
              }
              onChange={(e) => {

                setPropertyType(
                  e.target.value
                );

                setPropertySubType(
                  ""
                );

              }}
              className={
                inputClass
              }
            >
              <option value="">
                Property Type
              </option>

              <option>
                Commercial
              </option>
            </select>

            <select
              value={
                propertySubType
              }
              onChange={(e) =>
                setPropertySubType(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Property Sub Type
              </option>

              <option>
                Office
              </option>

              <option>
                Shop
              </option>

              <option>
                Shop / Office
              </option>

              <option>
                Retail Space
              </option>

              <option>
                Retail Office
              </option>

              <option>
                Sofo
              </option>

              <option>
                Soho
              </option>

              <option>
                Sovo
              </option>

              <option>
                Commercial bungalow
              </option>

              <option>
                Commercial semi-D
              </option>

              <option>
                Hotel / Resort
              </option>

              <option>
                Commercial Land
              </option>
            </select>

            <select
              value={
                unitType
              }
              onChange={(e) =>
                setUnitType(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Property Unit Type
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Corner Lot
              </option>

              <option>
                End Lot
              </option>

              <option>
                Duplex
              </option>

              <option>
                Triplex
              </option>

              <option>
                Penthouse
              </option>

              <option>
                Studio
              </option>

              <option>
                Soho
              </option>

              <option>
                Sovo
              </option>

              <option>
                Loft
              </option>

              <option>
                Dual Key
              </option>

              <option>
                Ground Floor Unit
              </option>

              <option>
                Garden Unit
              </option>

              <option>
                Prefer not to say
              </option>
            </select>

          </>
        )}

        {/* ================================================================ */}
        {/* INDUSTRIAL CLASSIFICATION */}
        {/* ================================================================ */}

        {category ===
          "Industrial" && (
          <>

            <select
              value={
                propertyType
              }
              onChange={(e) => {

                setPropertyType(
                  e.target.value
                );

                setPropertySubType(
                  ""
                );

              }}
              className={
                inputClass
              }
            >
              <option value="">
                Property Type
              </option>

              <option>
                Industrial
              </option>
            </select>

            <select
              value={
                propertySubType
              }
              onChange={(e) =>
                setPropertySubType(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Property Sub Type
              </option>

              <option>
                Factory
              </option>

              <option>
                Industrial Land
              </option>

              <option>
                Warehouse
              </option>

              <option>
                Cluster factory
              </option>

              <option>
                Semi-D factory
              </option>

              <option>
                Detached factory
              </option>

              <option>
                Terrace factory
              </option>
            </select>

            <select
              value={
                industrialZoning
              }
              onChange={(e) =>
                setIndustrialZoning(
                  e.target.value
                )
              }
              className={
                inputClass
              }
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

              <option>
                Other
              </option>
            </select>

            <select
              value={
                unitType
              }
              onChange={(e) =>
                setUnitType(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Property Unit Type
              </option>

              <option>
                Intermediate
              </option>

              <option>
                Corner Lot
              </option>

              <option>
                End Lot
              </option>

              <option>
                Duplex
              </option>

              <option>
                Triplex
              </option>

              <option>
                Penthouse
              </option>

              <option>
                Studio
              </option>

              <option>
                Soho
              </option>

              <option>
                Loft
              </option>

              <option>
                Dual Key
              </option>

              <option>
                Ground Floor Unit
              </option>

              <option>
                Garden Unit
              </option>

              <option>
                Prefer not to say
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
              className={
                inputClass
              }
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
              className={
                inputClass
              }
            />

          </>
        )}

        {/* ================================================================ */}
        {/* LAND CLASSIFICATION */}
        {/* ================================================================ */}

        {category ===
          "Industrial" &&
          propertySubType ===
            "Industrial Land" && (
          <select
            value={
              landTitleType
            }
            onChange={(e) =>
              setLandTitleType(
                e.target.value
              )
            }
            className={
              inputClass
            }
          >
            <option>
              Residential
            </option>

            <option>
              Commercial
            </option>

            <option>
              Industrial
            </option>

            <option>
              Agricultural
            </option>
          </select>
        )}

        {category ===
          "Land" && (

          <select
            value={
              landType
            }
            onChange={(e) =>
              setLandType(
                e.target.value
              )
            }
            className={
              inputClass
            }
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

        {/* ================================================================ */}
        {/* SIZE AND LAYOUT */}
        {/* ================================================================ */}

        <h4 className="pt-2 font-medium text-black">
          Size and layout
        </h4>

        {/* RESIDENTIAL */}
        {category ===
          "Residential" && (
          <>

            <input
              type="text"
              placeholder="Land Size (e.g. 20 x 65 ft or 1,400 sqft)"
              value={
                landSize
              }
              onChange={(e) =>
                setLandSize(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="text"
              placeholder="Built-up (e.g. 2,000 sqft)"
              value={
                builtUp
              }
              onChange={(e) =>
                setBuiltUp(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Bedrooms"
              value={
                bedrooms
              }
              onChange={(e) =>
                setBedrooms(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Bathrooms"
              value={
                bathrooms
              }
              onChange={(e) =>
                setBathrooms(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Parking Spaces"
              value={
                parkingSpaces
              }
              onChange={(e) =>
                setParkingSpaces(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

          </>
        )}

        {/* COMMERCIAL */}
        {category ===
          "Commercial" && (
          <>

            <input
              type="text"
              placeholder="Built-up (e.g. 2,000 sqft)"
              value={
                builtUp
              }
              onChange={(e) =>
                setBuiltUp(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Bathrooms"
              value={
                bathrooms
              }
              onChange={(e) =>
                setBathrooms(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

          </>
        )}

        {/* INDUSTRIAL */}
        {category ===
          "Industrial" && (
          <>

            <input
              type="text"
              placeholder="Land Size (e.g. 20 x 65 ft or 1,400 sqft)"
              value={
                landSize
              }
              onChange={(e) =>
                setLandSize(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="text"
              placeholder="Built-up (e.g. 2,000 sqft)"
              value={
                builtUp
              }
              onChange={(e) =>
                setBuiltUp(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Bathrooms"
              value={
                bathrooms
              }
              onChange={(e) =>
                setBathrooms(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

            <input
              type="number"
              min="0"
              placeholder="Parking Spaces"
              value={
                parkingSpaces
              }
              onChange={(e) =>
                setParkingSpaces(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

          </>
        )}

        {/* LAND */}
        {category ===
          "Land" && (
          <input
            type="text"
            placeholder="Land Size (e.g. 7.96 acres or 20,000 sqft)"
            value={
              landSize
            }
            onChange={(e) =>
              setLandSize(
                e.target.value
              )
            }
            className={
              inputClass
            }
          />
        )}

        {/* ================================================================ */}
        {/* CONDITION */}
        {/* ================================================================ */}

        <h4 className="pt-2 font-medium text-black">
          Condition and ownership
        </h4>

        {/* RESIDENTIAL FURNISHING */}
        {category ===
          "Residential" && (

          <select
            value={
              furnishing
            }
            onChange={(e) =>
              setFurnishing(
                e.target.value
              )
            }
            className={
              inputClass
            }
          >
            <option value="">
              Furnishing
            </option>

            <option value="fully_furnished">
              Fully Furnished
            </option>

            <option value="partially_furnished">
              Partially Furnished
            </option>

            <option value="unfurnished">
              Unfurnished
            </option>

          </select>

        )}

        {/* COMMERCIAL / INDUSTRIAL */}
        {(category ===
          "Commercial" ||
          category ===
            "Industrial") && (
          <>

            <select
              value={
                condition
              }
              onChange={(e) =>
                setCondition(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Condition
              </option>

              <option>
                Bare
              </option>

              <option>
                Partially fitted
              </option>

              <option>
                Fully fitted
              </option>
            </select>

            <select
              value={
                electricityPhase
              }
              onChange={(e) =>
                setElectricityPhase(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Electricity Phase
              </option>

              <option>
                1 Phase
              </option>

              <option>
                3 Phase
              </option>

              <option>
                Prefer not to say
              </option>
            </select>

            <input
              type="text"
              placeholder="Electricity Supply (Amp)"
              value={
                industrialPowerSupply
              }
              onChange={(e) =>
                setIndustrialPowerSupply(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            />

          </>
        )}

        {/* ================================================================ */}
        {/* FACING */}
        {/* ================================================================ */}

        <select
          value={
            facing
          }
          onChange={(e) =>
            setFacing(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option value="">
            Facing
          </option>

          <option>
            North
          </option>

          <option>
            South
          </option>

          <option>
            East
          </option>

          <option>
            West
          </option>

          <option>
            North East
          </option>

          <option>
            North West
          </option>

          <option>
            South East
          </option>

          <option>
            South West
          </option>
        </select>

        {/* ================================================================ */}
        {/* TENURE */}
        {/* ================================================================ */}

        <select
          value={
            tenure
          }
          onChange={(e) =>
            setTenure(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option value="">
            Tenure
          </option>

          <option>
            Freehold
          </option>

          <option>
            Leasehold
          </option>
        </select>

        {/* ================================================================ */}
        {/* TITLE TYPE */}
        {/* ================================================================ */}

        <select
          value={
            titleType
          }
          onChange={(e) =>
            setTitleType(
              e.target.value
            )
          }
          className={
            inputClass
          }
        >
          <option value="">
            Title Type
          </option>

          <option>
            Individual
          </option>

          <option>
            Strata
          </option>

          <option>
            Master Title
          </option>
        </select>

        {/* ================================================================ */}
        {/* DESCRIPTION */}
        {/* ================================================================ */}

        <h3 className="pt-4 text-lg font-semibold text-black">
          Description
        </h3>

        <textarea
          rows={5}
          placeholder="Description"
          value={
            description
          }
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        <textarea
          rows={5}
          placeholder="Property Highlights — one highlight per line"
          value={
            highlights
          }
          onChange={(e) =>
            setHighlights(
              e.target.value
            )
          }
          className={
            inputClass
          }
        />

        {/* ================================================================ */}
        {/* ACTIONS */}
        {/* ================================================================ */}

        <div className="flex gap-3">

          <button
            type="submit"
            disabled={
              created
            }
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded"
          >
            {mode ===
            "create"
              ? created
                ? "Listing Saved"
                : "Save Listing"
              : "Update Listing"}
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/listings";
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