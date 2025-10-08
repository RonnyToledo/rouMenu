// app/auth/popup-callback/page.tsx (cliente simple)
"use client";
import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function PopupCallbackPage() {
  console.log("PopupCallbackPage loaded");
  useEffect(() => {
    const run = async () => {
      const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
      const supabase = createClient(SUPA_URL, SUPA_ANON);

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const returnTo = url.searchParams.get("returnTo") ?? "/";

      try {
        if (code) {
          // Intercambia el code por sesión (PKCE). Puede fallar si no está configurado correctamente.
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          // notificar a ventana opener
          const origin = window.location.origin;
          window.opener?.postMessage(
            { type: "supabase-oauth", status: "ok", returnTo },
            origin
          );
          window.close();
          return;
        }
        // Si no hay code, también puede venir tokens en fragment... intenta notificar igual
        window.opener?.postMessage(
          { type: "supabase-oauth", status: "ok", returnTo },
          window.location.origin
        );
        window.close();
      } catch (err) {
        window.opener?.postMessage(
          { type: "supabase-oauth", status: "error", error: String(err) },
          window.location.origin
        );
        // opcional: mostrar error y botón para cerrar
      }
    };
    run();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-100 z-50">
      <div className="p-8 shadow">
        Procesando autenticación... si esta página no se cierra sola, por favor
        cierra la ventana.
      </div>
    </div>
  );
}
