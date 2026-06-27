// lib/getStoreComments.ts
// Fetch server-side de comentarios con join a user
import { supabase } from "./supabase";

export interface StoreComment {
  id: number;
  cmt: string | null;
  star: number;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}
export async function getStoreComments(
  storeUUID: string,
): Promise<StoreComment[]> {
  const { data, error } = await supabase
    .from("comentTienda")
    .select(
      ` id,
      cmt,
      star,
      created_at,
      user:user_id (
        id,
        name,
        image
      )`,
    )
    .eq("UIStore", storeUUID)
    .gt("star", 0) // solo comentarios con rating
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !data) return [];
  return data as unknown as StoreComment[];
}
