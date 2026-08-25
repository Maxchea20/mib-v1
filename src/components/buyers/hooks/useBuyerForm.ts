// File: src/components/buyers/hooks/useBuyerForm.ts

"use client";

import { useState } from "react";

export default function useBuyerForm(buyer?: any) {

  const [name, setName] = useState(
    buyer?.name ?? ""
  );

  const [phone, setPhone] = useState(
    buyer?.phone ?? ""
  );

  const [status, setStatus] = useState(
    buyer?.status ?? "Active"
  );

  const [leadSource, setLeadSource] = useState(
    buyer?.lead_source ?? "Facebook"
  );

  const [purpose, setPurpose] = useState(
    buyer?.purpose ?? "Buy"
  );

  const [budget, setBudget] = useState(
    buyer?.budget
      ? Number(buyer.budget).toLocaleString()
      : ""
  );

  const [category, setCategory] = useState(
    buyer?.category ?? "Residential"
  );

  const [preferredLocation, setPreferredLocation] =
    useState(
      buyer?.preferred_location ?? ""
    );

  const [remarks, setRemarks] = useState(
    buyer?.remarks ?? ""
  );

  const [isBuyer, setIsBuyer] = useState(
  buyer?.is_buyer ?? false
);

const [isOwner, setIsOwner] = useState(
  buyer?.is_owner ?? false
);

const [isTenant, setIsTenant] = useState(
  buyer?.is_tenant ?? false
);

// Owner Draft Property

const [ownerPurpose, setOwnerPurpose] = useState(
  "Sell"
);

const [ownerCategory, setOwnerCategory] = useState(
  "Residential"
);

const [ownerArea, setOwnerArea] = useState("");

const [ownerState, setOwnerState] = useState(
  "Perak"
);

const [ownerPrice, setOwnerPrice] = useState("");

  // Residential

  const [residentialType, setResidentialType] =
    useState(
      buyer?.residential_type ?? "Terrace"
    );

  const [residentialStorey, setResidentialStorey] =
    useState(
      buyer?.residential_storey ?? "Double"
    );

  // Commercial

  const [commercialType, setCommercialType] =
    useState(
      buyer?.commercial_type ?? "Shoplot"
    );

  // Industrial

  const [
    industrialPropertyType,
    setIndustrialPropertyType,
  ] = useState(
    buyer?.industrial_property_type ??
      "Detached Factory"
  );

  const [
    industrialZoning,
    setIndustrialZoning,
  ] = useState(
    buyer?.industrial_zoning ??
      "Light"
  );

  const [
    industrialLandSize,
    setIndustrialLandSize,
  ] = useState(
    buyer?.industrial_land_size ?? ""
  );

  const [
    industrialBuiltUp,
    setIndustrialBuiltUp,
  ] = useState(
    buyer?.industrial_built_up ?? ""
  );

  const [
    industrialCeilingHeight,
    setIndustrialCeilingHeight,
  ] = useState(
    buyer?.industrial_ceiling_height ?? ""
  );

  const [
    industrialPowerSupply,
    setIndustrialPowerSupply,
  ] = useState(
    buyer?.industrial_power_supply ?? ""
  );

  // Land

  const [landType, setLandType] =
    useState(
      buyer?.land_type ?? "Residential"
    );

  const [landSize, setLandSize] =
    useState(
      buyer?.land_size ?? ""
    );

  function handleBudgetChange(value: string) {

    const numbers =
      value.replace(/\D/g, "");

    if (!numbers) {
      setBudget("");
      return;
    }

    setBudget(
      Number(numbers).toLocaleString()
    );

  }
function handleOwnerPriceChange(value: string) {

  const numbers =
    value.replace(/\D/g, "");

  if (!numbers) {
    setOwnerPrice("");
    return;
  }

  setOwnerPrice(
    Number(numbers).toLocaleString()
  );

}
  return {

    name,
    setName,

    phone,
    setPhone,

    status,
    setStatus,

    leadSource,
    setLeadSource,

    purpose,
    setPurpose,

    budget,
    handleBudgetChange,

    category,
    setCategory,

    preferredLocation,
    setPreferredLocation,

    remarks,
    setRemarks,

    isBuyer,
setIsBuyer,

isOwner,
setIsOwner,

isTenant,
setIsTenant,

ownerPurpose,
setOwnerPurpose,

ownerCategory,
setOwnerCategory,

ownerArea,
setOwnerArea,

ownerState,
setOwnerState,

ownerPrice,
handleOwnerPriceChange,

    residentialType,
    setResidentialType,

    residentialStorey,
    setResidentialStorey,

    commercialType,
    setCommercialType,

    industrialPropertyType,
    setIndustrialPropertyType,

    industrialZoning,
    setIndustrialZoning,

    industrialLandSize,
    setIndustrialLandSize,

    industrialBuiltUp,
    setIndustrialBuiltUp,

    industrialCeilingHeight,
    setIndustrialCeilingHeight,

    industrialPowerSupply,
    setIndustrialPowerSupply,

    landType,
    setLandType,

    landSize,
    setLandSize,

  };

}