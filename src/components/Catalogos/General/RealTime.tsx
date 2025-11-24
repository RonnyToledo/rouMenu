"use client";

import React, { useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/realtime-js";
import { toast } from "sonner";
import { MyContext } from "@/context/MyContext";
import { ScrollTo } from "@/functions/ScrollTo";

interface Props {
  uuid: string;
}

export default function SitioRealtime({ uuid }: Props) {
  const { store } = useContext(MyContext);
  const router = useRouter();
  const pathname = usePathname();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const channelRefProducts = useRef<RealtimeChannel | null>(null);
  const lastToastAtRef = useRef<number>(0); // para evitar spam de toasts

  const NewProduct = useCallback(
    (productId: string, category: string) => {
      if (
        pathname == `/t/${store.sitioweb}` ||
        pathname == `/t/${store.sitioweb}/category/${category}`
      ) {
        ScrollTo(productId, 120);
      } else {
        router.push(`/t/${store.sitioweb}/producto/${productId}`);
      }
    },
    [pathname, router, store.sitioweb]
  );

  useEffect(() => {
    if (!uuid) {
      return;
    }

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
        () => {
          // Mostrar toast con dedupe
          const now = Date.now();
          if (now - lastToastAtRef.current > 3000) {
            lastToastAtRef.current = now;
            router.refresh();
            toast.info(
              "La página ha sido actualizada. Se estan aplicando los cambios los cambios."
            );
          }
        }
      );

      channelRef.current = channel;

      // Suscribir y actualizar estado (dependiendo de la versión de @supabase/supabase-js
      // .subscribe() puede aceptar un callback o devolver una promesa; esta forma es genérica)
      channel.subscribe();
      // Si quieres, podrías inspeccionar channel.state o manejar eventos de suscripción.
    } catch (err) {
      console.error(err);
    }

    // --- Products ---
    try {
      const filterProducts = `storeId=eq.${uuid}`; // Asegúrate que 'storeId' es la columna correcta
      const channelNameProducts = `products:${uuid}`;

      const channelP = supabase.channel(channelNameProducts).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Products",
          filter: filterProducts,
        },
        (payload) => {
          if (payload.eventType !== "INSERT") return;
          const now = Date.now();
          if (now - lastToastAtRef.current > 3000) {
            lastToastAtRef.current = now;
            router.refresh();
            if (payload.new) {
              const newRow = (payload.new ?? {}) as {
                title?: string;
                productId?: string;
                caja?: string;
              };
              toast.info("Nueva Disponibilidad.", {
                description: newRow.title ? `${newRow.title}` : "",
                action: {
                  label: "Ver",
                  onClick: () =>
                    NewProduct(
                      newRow.productId || newRow.title || "",
                      newRow.caja || ""
                    ),
                },
              });
            }
          }
        }
      );

      channelRefProducts.current = channelP;
      channelP.subscribe();
    } catch (err) {
      console.error(err);
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
        console.error(err);
      }
    };
  }, [uuid, router, NewProduct]);

  // componente invisible: no renderiza UI (lo puedes cambiar para render status si quieres)
  return <></>;
}
