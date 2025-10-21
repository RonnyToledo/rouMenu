// lib/supabaseClient.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Esto ayuda en dev a detectar variables faltantes
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

declare global {
  // Evita crear múltiples instancias cuando Vite/Next.js re-hota en desarrollo (HMR)
  var __supabase_singleton__: SupabaseClient | undefined;
}

// factory para crear una nueva instancia
function makeClient(): SupabaseClient {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: "sb-auth-token",
      flowType: "pkce",
    },
  });
}

/**
 * Singleton reutilizable en el browser.
 * - En client-side usaremos siempre esta instancia para evitar múltiples GoTrueClient.
 * - En server-side se puede crear un cliente temporal con `createClient()` abajo.
 */
export const supabase =
  typeof window !== "undefined"
    ? (global.__supabase_singleton__ ??
      (global.__supabase_singleton__ = makeClient()))
    : makeClient(); // SSR: crear uno nuevo (no persistente entre requests)

/**
 * createClient()
 * - Para compatibilidad con tu código previo que hacía `createClient()`.
 * - EN BROWSER: devuelve el singleton (evita crear otra instancia GoTrue).
 * - EN SERVER: crea y retorna una instancia nueva (segura para request/SSR).
 */
export const createClient = (): SupabaseClient => {
  if (typeof window !== "undefined") {
    // siempre devolver la instancia compartida en el cliente
    return supabase;
  }
  // en server, crear un cliente por petición (no persiste ni comparte listeners)
  return makeClient();
};
