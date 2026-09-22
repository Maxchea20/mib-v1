import type { ComponentType } from "react";
import type { Listing, ListingCategory } from "./listingTypes";
import type { IconProps } from "./icons";
import {
  HomeIcon,
  LayersIcon,
  SquareIcon,
  RulerSquareIcon,
  BedIcon,
  BathIcon,
  SofaIcon,
  CarIcon,
  TruckIcon,
  CompassIcon,
  DocumentIcon,
  FlagIcon,
  FactoryIcon,
  ShopIcon,
  MapIcon,
  TerrainIcon,
  ArrowUpDownIcon,
  BoltIcon,
  PlugIcon,
  ShieldCheckIcon,
} from "./icons";

export type Field = {
  icon: ComponentType<IconProps>;
  label: string;
  value: (l: Listing) => string | null;
};

const num = (v: number | null | undefined): string | null =>
  v === null || v === undefined ? null : String(v);
const str = (v: string | null | undefined): string | null => (v ? v : null);

/**
 * The 4 stat chips shown on the cover page (page 1), in order.
 * Kept short — these are read at a glance over a photo.
 */
export const coverStats: Record<ListingCategory, Field[]> = {
  Residential: [
    { icon: BedIcon, label: "Beds", value: (l) => num(l.bedrooms) },
    { icon: BathIcon, label: "Baths", value: (l) => num(l.bathrooms) },
    { icon: RulerSquareIcon, label: "Built-up", value: (l) => str(l.built_up) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
  ],
  Commercial: [
    { icon: RulerSquareIcon, label: "Built-up", value: (l) => str(l.built_up) },
    { icon: BathIcon, label: "Baths", value: (l) => num(l.bathrooms) },
    { icon: BoltIcon, label: "Electricity", value: (l) => str(l.electricity_phase) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
  ],
  Industrial: [
    { icon: RulerSquareIcon, label: "Built-up", value: (l) => str(l.built_up) },
    { icon: ArrowUpDownIcon, label: "Ceiling", value: (l) => str(l.industrial_ceiling_height) },
    { icon: PlugIcon, label: "Power", value: (l) => str(l.industrial_power_supply) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
  ],
  Land: [
    { icon: SquareIcon, label: "Land Size", value: (l) => str(l.land_size) },
    { icon: TerrainIcon, label: "Type", value: (l) => str(l.land_type) },
    { icon: CompassIcon, label: "Facing", value: (l) => str(l.facing) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
  ],
};

/**
 * The full icon spec sheet on page 2. Only fields that are actually
 * populated for that category — no cross-category guessing.
 */
export const overviewFields: Record<ListingCategory, Field[]> = {
  Residential: [
    { icon: HomeIcon, label: "Property Type", value: (l) => str(l.residential_type ?? l.property_type) },
    { icon: LayersIcon, label: "Storey", value: (l) => str(l.residential_storey) },
    { icon: SquareIcon, label: "Land Size", value: (l) => str(l.land_size) },
    { icon: RulerSquareIcon, label: "Built-up", value: (l) => str(l.built_up) },
    { icon: BedIcon, label: "Bedrooms", value: (l) => num(l.bedrooms) },
    { icon: BathIcon, label: "Bathrooms", value: (l) => num(l.bathrooms) },
    { icon: SofaIcon, label: "Furnishing", value: (l) => str(l.furnishing) },
    { icon: CarIcon, label: "Parking", value: (l) => num(l.parking_spaces) },
    { icon: CompassIcon, label: "Facing", value: (l) => str(l.facing) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
    { icon: FlagIcon, label: "Status", value: (l) => str(l.status) },
  ],
  Commercial: [
    { icon: ShopIcon, label: "Property Type", value: (l) => str(l.commercial_type ?? l.property_type) },
    { icon: RulerSquareIcon, label: "Built-up", value: (l) => str(l.built_up) },
    { icon: BathIcon, label: "Bathrooms", value: (l) => num(l.bathrooms) },
    { icon: CompassIcon, label: "Facing", value: (l) => str(l.facing) },
    { icon: ShieldCheckIcon, label: "Condition", value: (l) => str(l.condition) },
    { icon: BoltIcon, label: "Electricity", value: (l) => str(l.electricity_phase) },
    { icon: PlugIcon, label: "Power Supply", value: (l) => str(l.industrial_power_supply) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
    { icon: FlagIcon, label: "Status", value: (l) => str(l.status) },
  ],
  Industrial: [
    { icon: FactoryIcon, label: "Factory Type", value: (l) => str(l.industrial_property_type ?? l.property_type) },
    { icon: SquareIcon, label: "Land Size", value: (l) => str(l.land_size) },
    { icon: RulerSquareIcon, label: "Built-up", value: (l) => str(l.built_up) },
    { icon: MapIcon, label: "Zoning", value: (l) => str(l.industrial_zoning) },
    { icon: ArrowUpDownIcon, label: "Ceiling Height", value: (l) => str(l.industrial_ceiling_height) },
    { icon: BoltIcon, label: "Electricity", value: (l) => str(l.electricity_phase) },
    { icon: PlugIcon, label: "Power Supply", value: (l) => str(l.industrial_power_supply) },
    { icon: ShieldCheckIcon, label: "Condition", value: (l) => str(l.condition) },
    { icon: TruckIcon, label: "Parking", value: (l) => num(l.parking_spaces) },
    { icon: CompassIcon, label: "Facing", value: (l) => str(l.facing) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
    { icon: FlagIcon, label: "Status", value: (l) => str(l.status) },
  ],
  Land: [
    { icon: TerrainIcon, label: "Land Type", value: (l) => str(l.land_type) },
    { icon: SquareIcon, label: "Land Size", value: (l) => str(l.land_size) },
    { icon: CompassIcon, label: "Facing", value: (l) => str(l.facing) },
    { icon: DocumentIcon, label: "Tenure", value: (l) => str(l.tenure) },
    { icon: FlagIcon, label: "Status", value: (l) => str(l.status) },
  ],
};

/** The preferred cover-photo type per category, for hero selection. */
export const coverPhotoType: Record<ListingCategory, string> = {
  Residential: "Front House",
  Commercial: "Shop Front",
  Industrial: "Factory Front",
  Land: "Front View",
};

/** The gold category pill text on the cover page. */
export const categoryLabel: Record<ListingCategory, string> = {
  Residential: "RESIDENTIAL",
  Commercial: "COMMERCIAL",
  Industrial: "INDUSTRIAL",
  Land: "LAND",
};