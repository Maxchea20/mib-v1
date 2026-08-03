// File: src/components/buyers/BuyerForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createBuyer,
  updateBuyer,
} from "@/lib/buyers";

import useBuyerForm from "./hooks/useBuyerForm";

import GeneralSection from "./sections/GeneralSection";
import ResidentialSection from "./sections/ResidentialSection";
import CommercialSection from "./sections/CommercialSection";
import IndustrialSection from "./sections/IndustrialSection";
import LandSection from "./sections/LandSection";
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

        lead_source:
          form.leadSource,

        purpose:
          form.purpose,

        budget,

        category:
          form.category,

        preferred_location:
          form.preferredLocation,

        residential_type:
          form.residentialType,

        residential_storey:
          form.residentialStorey,

        commercial_type:
          form.commercialType,

        industrial_property_type:
          form.industrialPropertyType,

        industrial_zoning:
          form.industrialZoning,

        industrial_land_size:
          form.industrialLandSize,

        industrial_built_up:
          form.industrialBuiltUp,

        industrial_ceiling_height:
          form.industrialCeilingHeight,

        industrial_power_supply:
          form.industrialPowerSupply,

        land_type:
          form.landType,

        land_size:
          form.landSize,

        remarks:
          form.remarks,

      };

      if (mode === "create") {

  await createBuyer(payload);

  router.push("/buyers");

  router.refresh();

  return;

}

if (mode === "edit") {

  await updateBuyer(
    buyer.id,
    payload
  );

  router.push(
    `/buyers/${buyer.id}`
  );

  router.refresh();

  return;

}
      // Step 38.6 (Edit Buyer)
      // Will be implemented later.

    } catch (error) {

      console.error(error);

      alert(
        "Failed to save buyer."
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="bg-white rounded-lg shadow p-6">

      <h2 className="text-2xl font-bold text-black mb-6">

        {mode === "create"
          ? "Add Buyer"
          : "Edit Buyer"}

      </h2>

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

          purpose={form.purpose}
          setPurpose={form.setPurpose}

          budget={form.budget}
          onBudgetChange={form.handleBudgetChange}

          category={form.category}
          setCategory={form.setCategory}

          preferredLocation={form.preferredLocation}
          setPreferredLocation={form.setPreferredLocation}

        />

        {form.category === "Residential" && (

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

        {form.category === "Commercial" && (

          <CommercialSection

            commercialType={
              form.commercialType
            }

            setCommercialType={
              form.setCommercialType
            }

          />

        )}

        {form.category === "Industrial" && (

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

                {form.category === "Land" && (

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
              router.push("/buyers")
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
              ? "Save Buyer"
              : "Update Buyer"}
          </button>

        </div>

      </form>

    </div>

  );

}