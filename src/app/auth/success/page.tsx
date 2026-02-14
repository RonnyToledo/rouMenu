"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthSuccess() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  useEffect(() => {
    // Si estamos en un popup, notificar y cerrar
    if (window.opener && !window.opener.closed) {
      // Enviar mensaje de éxito a la ventana principal
      window.opener.postMessage(
        { type: "supabase-auth-success" },
        window.location.origin
      );

      // Cerrar el popup
      window.close();
    } else {
      // Si NO es un popup, redirigir normalmente
      window.location.href = redirectTo;
    }
  }, [redirectTo]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          ¡Inicio de sesión exitoso!
        </h1>
        <p className="text-slate-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
