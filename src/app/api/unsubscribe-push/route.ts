/**
 * API Route: POST /api/unsubscribe-push
 * Elimina la suscripción de Web Push del usuario
 */

import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createClient();

    // Obtener usuario actual
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Eliminar suscripción
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error eliminando suscripción:", error);
      return NextResponse.json(
        { error: "Error eliminando suscripción" },
        { status: 500 },
      );
    }

    console.log(`✓ Suscripción eliminada para usuario: ${user.id}`);

    return NextResponse.json(
      { success: true, message: "Desuscrito de Web Push" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en unsubscribe-push:", error);
    return NextResponse.json(
      { error: "Error procesando desuscripción" },
      { status: 500 },
    );
  }
}
