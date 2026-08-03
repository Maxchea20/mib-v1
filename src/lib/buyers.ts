// File: src/lib/buyers.ts

import { supabase } from "./supabase";

export async function createBuyer(data: any) {

  const { error } = await supabase
    .from("buyers")
    .insert(data);

  if (error) throw error;

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