// File: src/components/buyers/BuyerForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createBuyer,
  updateBuyer,
  createDraftProperty,
} from "@/lib/buyers";

import useBuyerForm from "./hooks/useBuyerForm";
import RolesSection from "./sections/RolesSection";
import BuyerRequirementSection from "./sections/BuyerRequirementSection";
import GeneralSection from "./sections/GeneralSection";
import ResidentialSection from "./sections/ResidentialSection";
import CommercialSection from "./sections/CommercialSection";
import IndustrialSection from "./sections/IndustrialSection";
import LandSection from "./sections/LandSection";
import OwnerSection from "./sections/OwnerSection";
import RemarksSection from "./sections/RemarksSection";

type Props = {
  mode: "create" | "edit";
  buyer?: any;
};

export default function BuyerForm({
  mode,
  buyer,
}: Props) {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const form =
    useBuyerForm(buyer);

  async function handleSubmit() {

    try {

      setLoading(true);

      if (
        !form.name ||
        !form.phone
      ) {

        alert(
          "Buyer Name and Phone are required."
        );

        setLoading(false);
        return;

      }

      const budget =
        Number(
          form.budget.replace(
            /,/g,
            ""
          )
        ) || 0;

      const payload = {

  name: form.name,

  phone: form.phone,

  status: form.status,

  lead_source: form.leadSource,

  purpose: form.purpose,

  owner_purpose:
  form.isOwner
    ? form.ownerPurpose
    : null,

  budget,

  category: form.category,

  preferred_location: form.preferredLocation,

  // Residential

  residential_type:
    form.category === "Residential"
      ? form.residentialType
      : null,

  residential_storey:
    form.category === "Residential"
      ? form.residentialStorey
      : null,

  // Commercial

  commercial_type:
    form.category === "Commercial"
      ? form.commercialType
      : null,

  // Industrial

  industrial_property_type:
    form.category === "Industrial"
      ? form.industrialPropertyType
      : null,

  industrial_zoning:
    form.category === "Industrial"
      ? form.industrialZoning
      : null,

  industrial_land_size:
    form.category === "Industrial"
      ? form.industrialLandSize
      : null,

  industrial_built_up:
    form.category === "Industrial"
      ? form.industrialBuiltUp
      : null,

  industrial_ceiling_height:
    form.category === "Industrial"
      ? form.industrialCeilingHeight
      : null,

  industrial_power_supply:
    form.category === "Industrial"
      ? form.industrialPowerSupply
      : null,

  // Land

  land_type:
    form.category === "Land"
      ? form.landType
      : null,

  land_size:
    form.category === "Land"
      ? form.landSize
      : null,

  remarks: form.remarks,

};

      if (mode === "create") {

  const buyer = await createBuyer(payload);

  if (form.isOwner) {

    await createDraftProperty({

      owner_id: buyer.id,

      purpose: form.ownerPurpose,

      area: form.ownerArea,

      price: Number(
        form.ownerPrice.replace(/,/g, "")
      ) || 0,

    });

  }

  router.push("/contacts");

  router.refresh();

  return;

}

if (mode === "edit") {

  await updateBuyer(
    buyer.id,
    payload
  );

  router.push(
  `/contacts/${buyer.id}`
);

  router.refresh();

  return;

}
      // Step 38.6 (Edit Buyer)
      // Will be implemented later.

    } catch (error: any) {

  console.error("FULL ERROR:", error);
  console.error("MESSAGE:", error?.message);
  console.error("DETAILS:", error?.details);
  console.error("HINT:", error?.hint);

  alert(
    error?.message ?? "Failed to save contact."
  );

} 
    
    finally {

      setLoading(false);

    }

  }

  return (

    <div className="bg-white rounded-lg shadow p-6">

      

      <form
        className="space-y-8"
        onSubmit={(e) => {

          e.preventDefault();

          handleSubmit();

        }}
      >

        <GeneralSection

          name={form.name}
          setName={form.setName}

          phone={form.phone}
          setPhone={form.setPhone}

          status={form.status}
          setStatus={form.setStatus}

          leadSource={form.leadSource}
          setLeadSource={form.setLeadSource}

          

          

        />

        <RolesSection

  isBuyer={form.isBuyer}
  setIsBuyer={form.setIsBuyer}

  isOwner={form.isOwner}
  setIsOwner={form.setIsOwner}

  isTenant={form.isTenant}
  setIsTenant={form.setIsTenant}

/>

{form.isBuyer && (

  <BuyerRequirementSection

    purpose={form.purpose}
    setPurpose={form.setPurpose}

    budget={form.budget}
    onBudgetChange={form.handleBudgetChange}

    category={form.category}
    setCategory={form.setCategory}

    preferredLocation={form.preferredLocation}
    setPreferredLocation={form.setPreferredLocation}

  />
  

)}


        {form.isBuyer &&
form.category === "Residential" && (

          <ResidentialSection

            residentialType={form.residentialType}
            setResidentialType={
              form.setResidentialType
            }

            residentialStorey={
              form.residentialStorey
            }
            setResidentialStorey={
              form.setResidentialStorey
            }

          />

        )}

        {form.isBuyer &&
form.category === "Commercial" && (

          <CommercialSection

            commercialType={
              form.commercialType
            }

            setCommercialType={
              form.setCommercialType
            }

          />

        )}

        {form.isBuyer &&
form.category === "Industrial" && (

          <IndustrialSection

            industrialPropertyType={
              form.industrialPropertyType
            }

            setIndustrialPropertyType={
              form.setIndustrialPropertyType
            }

            industrialZoning={
              form.industrialZoning
            }

            setIndustrialZoning={
              form.setIndustrialZoning
            }

            industrialLandSize={
              form.industrialLandSize
            }

            setIndustrialLandSize={
              form.setIndustrialLandSize
            }

            industrialBuiltUp={
              form.industrialBuiltUp
            }

            setIndustrialBuiltUp={
              form.setIndustrialBuiltUp
            }

            industrialCeilingHeight={
              form.industrialCeilingHeight
            }

            setIndustrialCeilingHeight={
              form.setIndustrialCeilingHeight
            }

            industrialPowerSupply={
              form.industrialPowerSupply
            }

            setIndustrialPowerSupply={
              form.setIndustrialPowerSupply
            }

          />

        )}

                {form.isBuyer &&
form.category === "Land" && (

          <LandSection

            landType={
              form.landType
            }

            setLandType={
              form.setLandType
            }

            landSize={
              form.landSize
            }

            setLandSize={
              form.setLandSize
            }

          />

        )}
{form.isOwner && (

  <OwnerSection

    purpose={form.ownerPurpose}
    setPurpose={form.setOwnerPurpose}

    category={form.ownerCategory}
    setCategory={form.setOwnerCategory}

    area={form.ownerArea}
    setArea={form.setOwnerArea}

    state={form.ownerState}
    setState={form.setOwnerState}

    price={form.ownerPrice}
    onPriceChange={form.handleOwnerPriceChange}

  />

)}
        <RemarksSection

          remarks={
            form.remarks
          }

          setRemarks={
            form.setRemarks
          }

        />

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              router.push("/contacts")
            }
            className="px-6 py-3 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded"
          >
            {loading
              ? "Saving..."
              : mode === "create"
              ? "Save Contact"
              : "Update Contact"}
          </button>

        </div>

      </form>

    </div>

  );

}