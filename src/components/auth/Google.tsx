"use client";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { ButtonGoogle } from "./ButtonGoogle";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://roumenu.vercel.app/t/moondust",
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("Missing Supabase environment variables")
      ) {
        setError(
          "La configuración de Supabase no está completa. Por favor, configura las variables de entorno necesarias."
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al iniciar sesión"
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta con Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="flex items-center justify-center">
            <ButtonGoogle
              isLoading={isLoading}
              handleGoogleLogin={handleGoogleLogin}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
