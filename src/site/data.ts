import { createClient } from "@supabase/supabase-js";

/*
|--------------------------------------------------------------------------
| PUBLIC SITE DATA ACCESS
|--------------------------------------------------------------------------
|
| Reads ONLY the two public views (public_listings, public_listing_photos)
| with the anonymous key and no login. It never touches the CRM tables, so
| even a bug here cannot expose private data: the database does not allow
| it (see supabase/audit/06_public_listings.sql).
|
*/

export type PublicListing = {
  id: number;
  title: string | null;
  headline: string | null;
  category: string | null;
  purpose: string | null;
  price: number | null;
  status: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  property_type: string | null;
  property_sub_type: string | null;
  unit_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_up: string | null;
  land_size: string | null;
  tenure: string | null;
  title_type: string | null;
  furnishing: string | null;
  parking_spaces: number | null;
  facing: string | null;
  land_type: string | null;
  description: string | null;
  highlights: string[] | null;
};

export type PublicPhoto = {
  id: number;
  property_id: number;
  photo_type: string | null;
  image_url: string | null;
};

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export type ListingFilters = {
  purpose?: string;
  category?: string;
};

const PURPOSES = ["For Sale", "For Rent"];
const CATEGORIES = ["Residential", "Commercial", "Industrial", "Land"];

export function cleanFilters(input: {
  purpose?: string | string[];
  category?: string | string[];
}): ListingFilters {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const purpose = one(input.purpose);
  const category = one(input.category);

  return {
    purpose: purpose && PURPOSES.includes(purpose) ? purpose : undefined,
    category: category && CATEGORIES.includes(category) ? category : undefined,
  };
}

export async function getPublicListings(
  filters: ListingFilters = {},
  limit = 200
): Promise<PublicListing[]> {
  let query = client()
    .from("public_listings")
    .select("*")
    .order("id", { ascending: false })
    .limit(limit);

  if (filters.purpose) query = query.eq("purpose", filters.purpose);
  if (filters.category) query = query.eq("category", filters.category);

  const { data, error } = await query;

  if (error) {
    console.error("Public listings error:", error.message);
    return [];
  }

  return (data ?? []) as PublicListing[];
}

export async function getPhotosForListings(
  ids: number[]
): Promise<PublicPhoto[]> {
  if (ids.length === 0) return [];

  const { data, error } = await client()
    .from("public_listing_photos")
    .select("*")
    .in("property_id", ids);

  if (error) {
    console.error("Public photos error:", error.message);
    return [];
  }

  return (data ?? []) as PublicPhoto[];
}

export async function getPublicListing(
  id: number
): Promise<{ listing: PublicListing; photos: PublicPhoto[] } | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const db = client();

  const { data, error } = await db
    .from("public_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Public listing error:", error.message);
    return null;
  }

  if (!data) return null;

  const { data: photos } = await db
    .from("public_listing_photos")
    .select("*")
    .eq("property_id", id);

  return {
    listing: data as PublicListing,
    photos: (photos ?? []) as PublicPhoto[],
  };
}

export async function getPublicListingIds(): Promise<number[]> {
  const { data } = await client()
    .from("public_listings")
    .select("id")
    .order("id", { ascending: false })
    .limit(5000);

  return (data ?? []).map((r: { id: number }) => r.id);
}
