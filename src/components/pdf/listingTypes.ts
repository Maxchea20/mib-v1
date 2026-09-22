export type ListingCategory = "Residential" | "Commercial" | "Industrial" | "Land";
export type ListingPurpose = "Sell" | "Rent";

export interface PropertyPhoto {
  image_url: string;
  photo_type: string | null;
}

/**
 * Mirrors the `properties` table exactly as ListingForm.tsx writes it.
 * Every field below is only ever populated for the categories noted —
 * the PDF layer must not guess across categories with `||` fallbacks.
 */
export interface Listing {
  id: number;
  title: string | null;
  headline?: string | null;
  category: ListingCategory;
  purpose: ListingPurpose | null;
  price: number | null;

  address: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;

  // All categories except Commercial
  land_size: string | null;

  built_up: string | null;
  tenure: string | null;
  title_type: string | null;
  facing: string | null;
  unit_type: string | null;
  bathrooms: number | null;
  status: string | null;

  description: string | null;
  highlights: string[] | null;

  property_type: string | null;
  property_sub_type: string | null;

  // Residential only
  residential_type: string | null;
  residential_storey: string | null;
  furnishing: string | null;
  bedrooms: number | null;

  // Residential + Industrial
  parking_spaces: number | null;

  // Commercial only
  commercial_type: string | null;

  // Industrial only
  industrial_property_type: string | null;
  industrial_zoning: string | null;
  industrial_ceiling_height: string | null;

  // Commercial + Industrial
  condition: string | null;
  electricity_phase: string | null;
  industrial_power_supply: string | null;

  // Land only
  land_type: string | null;

  listing_agent: string | null;
  cobroke_agent_name?: string | null;
  agent_reg_no?: string | null;
  agent_phone?: string | null;

  property_photos: PropertyPhoto[] | null;

  // The last generated brochure PDF, stored in Supabase Storage.
  // Present once someone has generated a PDF for this listing.
  brochure_url?: string | null;
  brochure_generated_at?: string | null;
}