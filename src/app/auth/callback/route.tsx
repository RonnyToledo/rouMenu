// ===== 1. app/auth/callback/route.ts =====
import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            try {
              (await cookieStore).set({ name, value, ...options });
            } catch (error) {
              console.error(error);
              // Handle cookie setting errors in middleware
            }
          },
          async remove(name: string, options: CookieOptions) {
            try {
              (await cookieStore).set({ name, value: "", ...options });
            } catch (error) {
              console.error(error);

              // Handle cookie removal errors in middleware
            }
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  // Si es un popup (detectamos por window.opener en el cliente)
  // Redirigir a una página que cierre el popup
  const successUrl = new URL("/auth/success", request.url);
  successUrl.searchParams.set("redirectTo", redirectTo);

  return NextResponse.redirect(successUrl);
}
