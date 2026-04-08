"use client";

import Script from "next/script";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CredentialResponse = {
  credential: string;
};

export default function GoogleOneTap() {
  const router = useRouter();

  const handleCallback = useCallback(
    async (response: CredentialResponse) => {
      console.log("✅ Credential recibido:", response);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        console.error("❌ Error login:", error.message);
        return;
      }

      console.log("🎉 Sesión creada:", data);
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    // dejamos el callback disponible globalmente
    window.__googleOneTapCallback = handleCallback;
  }, [handleCallback]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        const google = window.google;

        if (!google) {
          console.error("❌ Google GIS no cargó");
          return;
        }

        console.log("✅ Google One Tap cargado");

        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: window.__googleOneTapCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        google.accounts.id.prompt(
          (notification: google.accounts.id.PromptMomentNotification) => {
            if (notification.isNotDisplayed?.()) {
              console.log("⚠️");
            }

            if (notification.isSkippedMoment?.()) {
              console.log("⚠️ One Tap fue omitido");
            }

            if (notification.isDismissedMoment?.()) {
              console.log("⚠️ Usuario cerró el One Tap");
            }
          },
        );
      }}
    />
  );
}
