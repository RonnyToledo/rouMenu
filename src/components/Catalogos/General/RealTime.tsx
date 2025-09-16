"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/realtime-js";
import { toast } from "sonner";

interface Props {
  uuid: string;
}

export default function SitioRealtime({ uuid }: Props) {
  const router = useRouter();

  const [status, setStatus] = useState<
    "idle" | "loading" | "subscribing" | "subscribed" | "error" | "missing-uuid"
  >("idle");
  const [statusProducts, setStatusProducts] = useState<
    "idle" | "loading" | "subscribing" | "subscribed" | "error" | "missing-uuid"
  >("idle");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const channelRefProducts = useRef<RealtimeChannel | null>(null);
  const lastToastAtRef = useRef<number>(0); // para evitar spam de toasts

  console.log(statusProducts);
  console.log(status);
  useEffect(() => {
    if (!uuid) {
      setStatus("missing-uuid");
      setStatusProducts("missing-uuid");
      return;
    }

    setStatus("loading");
    setStatusProducts("loading");

    // --- Sitios ---
    try {
      const filterSitios = `UUID=eq.${uuid}`; // usa el nombre exacto de la columna en la BDD
      const channelNameSitios = `sitios:${uuid}`;

      const channel = supabase.channel(channelNameSitios).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Sitios",
          filter: filterSitios,
        },
        (payload) => {
          // Mostrar toast con dedupe
          const now = Date.now();
          if (now - lastToastAtRef.current > 3000) {
            lastToastAtRef.current = now;
            toast.info(
              'La página ha sido actualizada. Pulsa "Refrescar" para aplicar los cambios.',
              {
                action: {
                  label: "Refrescar",
                  onClick: () => window.location.reload(),
                },
              }
            );
          }
          console.log("[Sitios realtime]", payload.eventType, payload);
        }
      );

      channelRef.current = channel;

      // Suscribir y actualizar estado (dependiendo de la versión de @supabase/supabase-js
      // .subscribe() puede aceptar un callback o devolver una promesa; esta forma es genérica)
      channel.subscribe();
      setStatus("subscribing");
      // Si quieres, podrías inspeccionar channel.state o manejar eventos de suscripción.
      setStatus("subscribed");
    } catch (err) {
      console.error("Error al suscribir Sitios", err);
      setStatus("error");
    }

    // --- Products ---
    try {
      const filterProducts = `storeId=eq.${uuid}`; // Asegúrate que 'storeId' es la columna correcta
      const channelNameProducts = `products:${uuid}`;

      const channelP = supabase.channel(channelNameProducts).on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Products",
          filter: filterProducts,
        },
        (payload) => {
          const now = Date.now();
          if (now - lastToastAtRef.current > 3000) {
            lastToastAtRef.current = now;
            toast.info("Nueva Disponibilidad.", {
              description: payload.new?.title ? `${payload.new?.title}` : "",
              action: {
                label: "Refrescar",
                onClick: () => window.location.reload(),
              },
            });
          }
          console.log("[Products realtime]", payload.eventType, payload);
        }
      );

      channelRefProducts.current = channelP;
      channelP.subscribe();
      setStatusProducts("subscribing");
      setStatusProducts("subscribed");
    } catch (err) {
      console.error("Error al suscribir Products", err);
      setStatusProducts("error");
    }

    // Cleanup: quitar canales correctamente
    return () => {
      try {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        if (channelRefProducts.current) {
          supabase.removeChannel(channelRefProducts.current);
          channelRefProducts.current = null;
        }
      } catch (err) {
        console.warn("Error al limpiar canales", err);
      }
    };
  }, [uuid, router]);

  // componente invisible: no renderiza UI (lo puedes cambiar para render status si quieres)
  return <></>;
}
