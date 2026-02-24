"use client";

import { useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/realtime-js";
import { sileo } from "sileo";
import { MyContext } from "@/context/MyContext";
import { ScrollTo } from "@/functions/ScrollTo";

interface Props {
  uuid: string;
}

const TOAST_DEBOUNCE_MS = 3000;

export default function SitioRealtime({ uuid }: Props) {
  const { store } = useContext(MyContext);
  const router = useRouter();
  const pathname = usePathname();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const channelRefProducts = useRef<RealtimeChannel | null>(null);
  const lastToastAtRef = useRef<number>(0);

  // Mantener refs estables para evitar re-suscripciones por closure stale
  const sitiowebRef = useRef(store.sitioweb);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    sitiowebRef.current = store.sitioweb;
  }, [store.sitioweb]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const NewProduct = useCallback(
    (productId: string, category: string) => {
      const currentPathname = pathnameRef.current;
      const sitioweb = sitiowebRef.current;

      if (
        currentPathname === `/t/${sitioweb}` ||
        currentPathname === `/t/${sitioweb}/category/${category}`
      ) {
        ScrollTo(productId, 120);
      } else {
        router.push(`/t/${sitioweb}/producto/${productId}`);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!uuid) return;

    const canToast = () => {
      const now = Date.now();
      if (now - lastToastAtRef.current > TOAST_DEBOUNCE_MS) {
        lastToastAtRef.current = now;
        return true;
      }
      return false;
    };

    // Canal: cambios en Sitios
    try {
      const channel = supabase
        .channel(`sitios:${uuid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Sitios",
            filter: `UUID=eq.${uuid}`,
          },
          () => {
            if (canToast()) {
              router.refresh();
              sileo.info({
                title: "Página Actualizada",
                description:
                  "La página ha sido actualizada. Se están aplicando los cambios.",
              });
            }
          },
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.error("Error suscribiendo a Sitios:", err);
    }

    // Canal: nuevos productos
    try {
      const channelP = supabase
        .channel(`products:${uuid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Products",
            filter: `storeId=eq.${uuid}`,
          },
          (payload) => {
            if (payload.eventType !== "INSERT") return;
            if (!canToast()) return;

            router.refresh();

            const newRow = (payload.new ?? {}) as {
              title?: string;
              productId?: string;
              caja?: string;
            };

            sileo.info({
              title: "Nueva Disponibilidad",
              description: newRow.title ?? "",
              button: {
                title: "Ver",
                onClick: () =>
                  NewProduct(
                    newRow.productId || newRow.title || "",
                    newRow.caja || "",
                  ),
              },
            });
          },
        )
        .subscribe();

      channelRefProducts.current = channelP;
    } catch (err) {
      console.error("Error suscribiendo a Products:", err);
    }

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
        console.error("Error limpiando canales Realtime:", err);
      }
    };
  }, [uuid, router, NewProduct]);

  return null; // Componente invisible
}
