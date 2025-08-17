import { createClient as CC } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// Create a single supabase client for interacting with your database
export const supabase = CC(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
