/**
 * API Route: POST /api/subscribe-push
 * Guarda la suscripción de Web Push del usuario.
 *
 * Soporta dos modos:
 * - Autenticado: asocia la suscripción al user_id
 * - Anónimo:     asocia la suscripción al shop_key del header x-shop-key
 *
 * El schema de la tabla soporta ambos casos (user_id nullable).
 */

import { createClient } from "@/lib/supabase";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface PushSubscriptionBody {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Cliente admin con service_role para writes sin RLS
// (solo se instancia una vez en module scope)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const subscription: PushSubscriptionBody = await request.json();

    // Validación
    if (
      !subscription.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Suscripción inválida — faltan endpoint o keys" },
        { status: 400 },
      );
    }

    const shopKey = request.headers.get("x-shop-key") ?? null;

    // Intentar obtener el usuario autenticado (puede no existir)
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si no hay usuario ni shopKey, no sabemos a quién asociar la suscripción
    if (!user && !shopKey) {
      return NextResponse.json(
        { error: "Se requiere autenticación o x-shop-key" },
        { status: 400 },
      );
    }

    // Guardar con admin client (bypasea RLS, funciona para ambos casos)
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        // Identificadores — al menos uno estará presente
        user_id: user?.id ?? null,
        shop_key: shopKey,

        // Datos de la suscripción Web Push
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,

        updated_at: new Date().toISOString(),
      },
      {
        // endpoint es único por dispositivo/navegador
        onConflict: "endpoint",
      },
    );

    if (error) {
      console.error("[subscribe-push] Error guardando suscripción:", error);
      return NextResponse.json(
        { error: "Error guardando suscripción" },
        { status: 500 },
      );
    }

    const who = user ? `usuario ${user.id}` : `tienda ${shopKey}`;
    console.info(`[subscribe-push] ✓ Suscripción guardada para ${who}`);

    return NextResponse.json(
      { success: true, message: "Suscripción guardada" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[subscribe-push] Error:", error);
    return NextResponse.json(
      { error: "Error procesando suscripción" },
      { status: 500 },
    );
  }
}
