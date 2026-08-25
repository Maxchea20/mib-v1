// File: src/lib/buyers.ts

import { supabase } from "./supabase";

export async function createBuyer(data: any) {

  const {
    data: buyer,
    error,
  } = await supabase
    .from("buyers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return buyer;

}

export async function updateBuyer(
  id: number,
  data: any
) {

  const { error } = await supabase
    .from("buyers")
    .update(data)
    .eq("id", id);

  if (error) throw error;

}

export async function deleteBuyer(
  id: number
) {

  const { error } = await supabase
    .from("buyers")
    .delete()
    .eq("id", id);

  if (error) throw error;

}

export async function createDraftProperty(data: {
  owner_id: number;
  purpose: string;
  area: string;
  price: number;
}) {

  const { error } = await supabase
    .from("properties")
    .insert({

  owner_id: data.owner_id,

  title: data.area || "Untitled Draft",

  category: "Residential",

  purpose: data.purpose,

  area: data.area,

  price: data.price,

  status: "Draft",

});

  if (error) throw error;

}