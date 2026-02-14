// src/lib/supabase.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Augment globalThis for TypeScript
 */
declare global {
  var __supabase_singleton__: SupabaseClient | undefined;
}

/**
 * Cliente de Supabase para el browser con manejo correcto de cookies
 */
function createClient(): SupabaseClient {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Singleton para uso en cliente (browser)
 */
const isBrowser = typeof window !== "undefined";

export const supabase: SupabaseClient = (() => {
  if (!isBrowser) {
    // En SSR, retornar un cliente básico (no debería usarse para auth)
    return createClient();
  }

  // En browser: usar singleton
  if (!globalThis.__supabase_singleton__) {
    globalThis.__supabase_singleton__ = createClient();
  }

  return globalThis.__supabase_singleton__;
})();

/**
 * Función para crear un nuevo cliente (útil en algunos casos)
 */
export { createClient };
