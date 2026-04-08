"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type CredentialResponse = { credential: string };

export default function GoogleOneTap() {
  const router = useRouter();
  const supabase = createClient();
  const hasSessionRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      hasSessionRef.current = !!session?.user;
    });
  }, [supabase.auth]);

  const handleCallback = useCallback(
    async (response: CredentialResponse) => {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });
      if (error) {
        console.error("Error en One Tap:", error.message);
        return;
      }
      router.refresh();
    },
    [router, supabase],
  );

  useEffect(() => {
    if (document.getElementById("google-gsi-script")) return;

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const google = window.google;
      if (!google) {
        return;
      }

      // Si ya hay sesión activa, no mostrar el prompt
      if (hasSessionRef.current) return;

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCallback,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      google.accounts.id.prompt(
        (notification: google.accounts.id.PromptMomentNotification) => {
          // El prompt nunca llegó a mostrarse (bloqueado, sin cuenta, etc.)
          if (notification.isNotDisplayed?.()) {
            return;
          }
          // Se mostró pero el usuario lo ignoró o cerró → abrir popover
          if (
            notification.isSkippedMoment?.() ||
            notification.isDismissedMoment?.()
          ) {
          }
        },
      );
    };

    document.body.appendChild(script);
  }, [handleCallback]);

  return null;
}
