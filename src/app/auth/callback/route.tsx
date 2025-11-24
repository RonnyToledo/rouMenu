// ===== 1. app/auth/callback/route.ts =====
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Si es un popup (detectamos por window.opener en el cliente)
  // Redirigir a una página que cierre el popup
  const successUrl = new URL("/auth/success", request.url);
  successUrl.searchParams.set("redirectTo", redirectTo);

  return NextResponse.redirect(successUrl);
}
