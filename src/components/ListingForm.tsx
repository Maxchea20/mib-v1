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
          : null,
    };

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
            setCity(
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
        </select>

        {/* ================================================================ */}
        {/* TOWNSHIP */}
        {/* ================================================================ */}

        <input
          type="text"
          list="township-options"
          placeholder="Township"
          value={area}
          onChange={(e) =>
            setArea(
              e.target.value
            )
          }
          className={
            inputClass
          }
          autoComplete="off"
        />

        <datalist
          id="township-options"
        >

          <option>
            Anjung Bercham Indah
          </option>

          <option>
            Anjung Bercham Utara
          </option>

          <option>
            Anjung Tawas Damai
          </option>

          <option>
            Anjung Tawas Impiana
          </option>

          <option>
            Anjung Tawas Sinaran
          </option>

          <option>
            Arena Kepayang Putra
          </option>

          <option>
            Bandar Baru Batu Gajah
          </option>

          <option>
            Bandar Baru Medan Ipoh
          </option>

          <option>
            Bandar Baru Menglembu
          </option>

          <option>
            Bandar Baru Putra
          </option>

          <option>
            Bandar Baru Tasek
          </option>

          <option>
            Bandar Cyber Ipoh (Bandar Siber)
          </option>

          <option>
            Bandar Ipoh Raya
          </option>

          <option>
            Bandar Lahat Baru
          </option>

          <option>
            Bandar Lahat Mines
          </option>

          <option>
            Bandar Meru Prima (Ipoh Premier City)
          </option>

          <option>
            Bandar Meru Raya
          </option>

          <option>
            Bandar Pengkalan Indah
          </option>

          <option>
            Bandar Seri Botani
          </option>

          <option>
            Bandar Sri Pengkalan
          </option>

          <option>
            Bandar Tasek Idaman
          </option>

          <option>
            Bandar Tasik Idaman 2
          </option>

          <option>
            Bemban Industrial Estate
          </option>

          <option>
            Bercham
          </option>

          <option>
            Bercham Heights
          </option>

          <option>
            Bukit Kledang Indah
          </option>

          <option>
            Bukit Merah
          </option>

          <option>
            Buntong
          </option>

          <option>
            Buntong 2
          </option>

          <option>
            Buntong 3 Tambahan
          </option>

          <option>
            Buntong 4
          </option>

          <option>
            Changkat
          </option>

          <option>
            Cherry Light Industrial Park
          </option>

          <option>
            Desa Aman
          </option>

          <option>
            Desa Changkat
          </option>

          <option>
            Desa Indah
          </option>

          <option>
            Desa Lang Damai
          </option>

          <option>
            Desa Lang Indah
          </option>

          <option>
            Desa Pakatan
          </option>

          <option>
            Desa Parkview
          </option>

          <option>
            Desa Pelancongan
          </option>

          <option>
            Desa Pengkalan Bandaraya
          </option>

          <option>
            Desa Pengkalan Indah
          </option>

          <option>
            Desa Pengkalan Mutiara
          </option>

          <option>
            Desa Pengkalan Timah
          </option>

          <option>
            Desa Perindustrian Putra
          </option>

          <option>
            Desa Perwira
          </option>

          <option>
            Desa Putra Indah
          </option>

          <option>
            Desa Rapat
          </option>

          <option>
            Desa Sri Ampang
          </option>

          <option>
            Desa Tasek Bakti
          </option>

          <option>
            Desa Temiang Jaya
          </option>

          <option>
            Fair Garden
          </option>

          <option>
            Fair Park
          </option>

          <option>
            Falim
          </option>

          <option>
            Gerbang Meru Indah
          </option>

          <option>
            Greentown
          </option>

          <option>
            Gunung Rapat
          </option>

          <option>
            Halaman Ampang Jaya
          </option>

          <option>
            Halaman Ampang Mewah
          </option>

          <option>
            Halaman Lang Mewah
          </option>

          <option>
            Halaman Meru Damai
          </option>

          <option>
            Halaman Meru Impian
          </option>

          <option>
            Halaman Meru Permai
          </option>

          <option>
            Halaman Pengkalan Sentosa
          </option>

          <option>
            Happy Garden
          </option>

          <option>
            Housing Trust
          </option>

          <option>
            Ipoh Park
          </option>

          <option>
            Jelapang
          </option>

          <option>
            Jelapang Tambahan
          </option>

          <option>
            Kawasan Perindustrian Batu Gajah 2
          </option>

          <option>
            Kawasan Perindustrian Bukit Merah
          </option>

          <option>
            Kawasan Perindustrian Chandan Raya
          </option>

          <option>
            Kawasan Perindustrian IGB
          </option>

          <option>
            Kawasan Perindustrian Jelapang
          </option>

          <option>
            Kawasan Perindustrian Menglembu
          </option>

          <option>
            Kawasan Perindustrian Pengkalan
          </option>

          <option>
            Kawasan Perindustrian Perpaduan
          </option>

          <option>
            Kawasan Perindustrian Ringan Bercham
          </option>

          <option>
            Kawasan Perindustrian Silibin
          </option>

          <option>
            Kawasan Perindustrian Sri Rapat
          </option>

          <option>
            Kawasan Perindustrian Taman Mas
          </option>

          <option>
            Kawasan Perindustrian Tasek
          </option>

          <option>
            Kawasan Perusahaan Menglembu
          </option>

          <option>
            Menglembu Regrouping Area
          </option>

          <option>
            Metro Pengkalan
          </option>

          <option>
            Puncak Anggerik
          </option>

          <option>
            Regrouping Area Lahat
          </option>

          <option>
            Seri Beringin
          </option>

          <option>
            Tambun
          </option>

          <option>
            Taman Alkaf
          </option>

          <option>
            Taman Alkaff
          </option>

          <option>
            Taman Ampang
          </option>

          <option>
            Taman Ampang Indah
          </option>

          <option>
            Taman Ampang Jaya
          </option>

          <option>
            Taman Ampang Timur
          </option>

          <option>
            Taman Anda
          </option>

          <option>
            Taman Anggerik
          </option>

          <option>
            Taman Anjung Bemban Maju
          </option>

          <option>
            Taman Arkid
          </option>

          <option>
            Taman Badri Shah
          </option>

          <option>
            Taman Bahagia
          </option>

          <option>
            Taman Bandaraya Impiana
          </option>

          <option>
            Taman Batu Gajah
          </option>

          <option>
            Taman Batu Gajah Baru
          </option>

          <option>
            Taman Batu Gajah Perdana
          </option>

          <option>
            Taman Beauty
          </option>

          <option>
            Taman Bekor
          </option>

          <option>
            Taman Bemban
          </option>

          <option>
            Taman Bemban Raya
          </option>

          <option>
            Taman Bemban Suria
          </option>

          <option>
            Taman Bendahara
          </option>

          <option>
            Taman Bercham Aman
          </option>

          <option>
            Taman Bercham Baru
          </option>

          <option>
            Taman Bercham Jaya
          </option>

          <option>
            Taman Bercham Maju
          </option>

          <option>
            Taman Bercham Tropicana
          </option>

          <option>
            Taman Bersatu
          </option>

          <option>
            Taman Bertuah
          </option>

          <option>
            Taman Binaria
          </option>

          <option>
            Taman Bintang
          </option>

          <option>
            Taman Birch
          </option>

          <option>
            Taman Boon Bak
          </option>

          <option>
            Taman Bukit Merah
          </option>

          <option>
            Taman Bukit Meru
          </option>

          <option>
            Taman Buluh Emas
          </option>

          <option>
            Taman Bunga Kega
          </option>

          <option>
            Taman Bunga Raya
          </option>

          <option>
            Taman Buntong Jaya
          </option>

          <option>
            Taman Buntong Ria
          </option>

          <option>
            Taman Butong Jaya
          </option>

          <option>
            Taman Cahaya
          </option>

          <option>
            Taman Cahaya Bercham
          </option>

          <option>
            Taman Camay
          </option>

          <option>
            Taman Canning
          </option>

          <option>
            Taman Cemerlang Ampang
          </option>

          <option>
            Taman Cemerlang Emas
          </option>

          <option>
            Taman Cemerlang Rapat
          </option>

          <option>
            Taman Cempaka
          </option>

          <option>
            Taman Chandan Raya
          </option>

          <option>
            Taman Changkat
          </option>

          <option>
            Taman Changkat Jaya
          </option>

          <option>
            Taman Changkat Mewah
          </option>

          <option>
            Taman Chateau
          </option>

          <option>
            Taman Che Wan
          </option>

          <option>
            Taman Cherry
          </option>

          <option>
            Taman Damai
          </option>

          <option>
            Taman Delima Shatin
          </option>

          <option>
            Taman Dermawan
          </option>

          <option>
            Taman Desa Cempaka
          </option>

          <option>
            Taman Desa Chempaka
          </option>

          <option>
            Taman Desa Harum
          </option>

          <option>
            Taman Desa Impian
          </option>

          <option>
            Taman Desa Kebudayaan
          </option>

          <option>
            Taman Desa Kencana
          </option>

          <option>
            Taman Desa Kristal
          </option>

          <option>
            Taman Desa Pelancongan
          </option>

          <option>
            Taman Desa Pengkalan
          </option>

          <option>
            Taman Desa Pengkalan Indah
          </option>

          <option>
            Taman Desa Pinji
          </option>

          <option>
            Taman Desa Putra Indah
          </option>

          <option>
            Taman Desa Rapat
          </option>

          <option>
            Taman Desa Rishah
          </option>

          <option>
            Taman Desa Rishah Indah
          </option>

          <option>
            Taman Desa Tasek Bakti
          </option>

          <option>
            Taman Eden
          </option>

          <option>
            Taman Ehsan
          </option>

          <option>
            Taman Endah Jaya
          </option>

          <option>
            Taman Fair
          </option>

          <option>
            Taman Fair Baharu
          </option>

          <option>
            Taman Fair Park
          </option>

          <option>
            Taman Falim
          </option>

          <option>
            Taman Falim Indah
          </option>

          <option>
            Taman Foo Onn
          </option>

          <option>
            Taman Fu Onn
          </option>

          <option>
            Taman Gading
          </option>

          <option>
            Taman Galeri Kepayang
          </option>

          <option>
            Taman Gamelan
          </option>

          <option>
            Taman Gamelan Timur
          </option>

          <option>
            Taman Gerbang Bercham Selamat
          </option>

          <option>
            Taman Gerbang Delima Johan
          </option>

          <option>
            Taman Germuda
          </option>

          <option>
            Taman Golf
          </option>

          <option>
            Taman Gopeng
          </option>

          <option>
            Taman Green Hill
          </option>

          <option>
            Taman Gunung View
          </option>

          <option>
            Taman Halaman Ampang
          </option>

          <option>
            Taman Halaman Ampang Mewah
          </option>

          <option>
            Taman Happy
          </option>

          <option>
            Taman Harmoni
          </option>

          <option>
            Taman Hijau
          </option>

          <option>
            Taman Hillview
          </option>

          <option>
            Taman Hock Aun
          </option>

          <option>
            Taman Hock Bee
          </option>

          <option>
            Taman Hock Lee
          </option>

          <option>
            Taman Hong Kong
          </option>

          <option>
            Taman Hongkong
          </option>

          <option>
            Taman Hoover
          </option>

          <option>
            Taman Idris
          </option>

          <option>
            Taman Indah
          </option>

          <option>
            Taman Indah Jaya
          </option>

          <option>
            Taman Intan
          </option>

          <option>
            Taman Ipoh Baru
          </option>

          <option>
            Taman Ipoh Boulevard Timur
          </option>

          <option>
            Taman Ipoh Grove
          </option>

          <option>
            Taman Ipoh Indah
          </option>

          <option>
            Taman Ipoh Jaya
          </option>

          <option>
            Taman Ipoh Jaya Timur
          </option>

          <option>
            Taman Ipoh Jaya Timur 1
          </option>

          <option>
            Taman Ipoh Jaya Timur 2
          </option>

          <option>
            Taman Ipoh Permai
          </option>

          <option>
            Taman Ipoh Selatan
          </option>

          <option>
            Taman Ipoh Timur
          </option>

          <option>
            Taman Istana
          </option>

          <option>
            Taman Jade
          </option>

          <option>
            Taman Jati
          </option>

          <option>
            Taman Jelapang Ria
          </option>

          <option>
            Taman Jubilee
          </option>

          <option>
            Taman Kam Seng
          </option>

          <option>
            Taman Kampar
          </option>

          <option>
            Taman Kar King
          </option>

          <option>
            Taman Kasih
          </option>

          <option>
            Taman Kledang
          </option>

          <option>
            Taman Kledang Permai
          </option>

          <option>
            Taman Kledang Sentosa
          </option>

          <option>
            Taman Kledang Suria
          </option>

          <option>
            Taman Lahat Baru
          </option>

          <option>
            Taman Lahat Indah
          </option>

          <option>
            Taman Lembah Permai
          </option>

          <option>
            Taman Mas
          </option>

          <option>
            Taman Mawar
          </option>

          <option>
            Taman Melor
          </option>

          <option>
            Taman Menglembu
          </option>

          <option>
            Taman Menglembu Berlian
          </option>

          <option>
            Taman Menglembu Impiana Adril
          </option>

          <option>
            Taman Menglembu Timur
          </option>

          <option>
            Taman Mewah
          </option>

          <option>
            Taman Mewah 2
          </option>

          <option>
            Taman Mewah Indah
          </option>

          <option>
            Taman Mutiara
          </option>

          <option>
            Taman Orkid
          </option>

          <option>
            Taman Pasir Emas
          </option>

          <option>
            Taman Pasir Wang
          </option>

          <option>
            Taman Pegoh
          </option>

          <option>
            Taman Pelangi
          </option>

          <option>
            Taman Pengkalan Bandaraya
          </option>

          <option>
            Taman Pengkalan Timah
          </option>

          <option>
            Taman Pengkalan Utama
          </option>

          <option>
            Taman Perindustrian Chandan Raya
          </option>

          <option>
            Taman Permai
          </option>

          <option>
            Taman Perusahaan Chandan Raya
          </option>

          <option>
            Taman Pinji Perdana
          </option>

          <option>
            Taman Pinggiran Saujana
          </option>

          <option>
            Taman Puncak Anggerik
          </option>

          <option>
            Taman Pusing Perdana
          </option>

          <option>
            Taman Raja Izzuddin
          </option>

          <option>
            Taman Rasi
          </option>

          <option>
            Taman Rasi Jaya
          </option>

          <option>
            Taman Saujana
          </option>

          <option>
            Taman Saujana Megah
          </option>

          <option>
            Taman Sayang
          </option>

          <option>
            Taman Sayang Baru
          </option>

          <option>
            Taman Sekura
          </option>

          <option>
            Taman Sentosa
          </option>

          <option>
            Taman Sepakat
          </option>

          <option>
            Taman Seri Megah
          </option>

          <option>
            Taman Seri Rahmat
          </option>

          <option>
            Taman Setia Jaya
          </option>

          <option>
            Taman Setia Jaya Baru
          </option>

          <option>
            Taman Sri Intan
          </option>

          <option>
            Taman Sri Wangsa
          </option>

          <option>
            Taman Suria
          </option>

          <option>
            Taman Tien Shen
          </option>

          <option>
            Taman Wang
          </option>

          <option>
            Taman Yoke Kim
          </option>

          <option>
            Taman Yuk Kwan
          </option>

          <option>
            Sunway City Ipoh
          </option>

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

            <select
              value={
                residentialStorey
              }
              onChange={(e) =>
                setResidentialStorey(
                  e.target.value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Terrace House
              </option>

              <option>
                1-storey Terraced House
              </option>

              <option>
                1.5-storey Terraced House
              </option>

              <option>
                2-storey Terraced House
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