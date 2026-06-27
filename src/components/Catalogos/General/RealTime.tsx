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

// ─── Tipos inferidos del schema ───────────────────────────────────────────────

interface ProductPayload {
  title?: string;
  productId?: string;
  caja?: string;
}

interface VariantPayload {
  id?: string;
  product_id?: string;
  label?: string;
  stock?: number;
  price?: number;
}

interface DiscountPayload {
  id?: number;
  variant_id?: string;
  product_id?: string;
  min_qty?: number;
  type?: "percentage" | "fixed" | "quantity";
  value?: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SitioRealtime({ uuid }: Props) {
  const { store } = useContext(MyContext);
  const router = useRouter();
  const pathname = usePathname();

  // Refs para los 4 canales
  const channelsRef = useRef<(RealtimeChannel | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  // Refs para evitar closures stale
  const lastToastAtRef = useRef<number>(0);
  const sitiowebRef = useRef(store.sitioweb);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    sitiowebRef.current = store.sitioweb;
  }, [store.sitioweb]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // ── Guard de debounce compartido entre todos los canales ──────────────────
  const canToast = useCallback(() => {
    const now = Date.now();
    if (now - lastToastAtRef.current > TOAST_DEBOUNCE_MS) {
      lastToastAtRef.current = now;
      return true;
    }
    return false;
  }, []);

  // ── Navega / scroll al producto nuevo ────────────────────────────────────
  const navigateToProduct = useCallback(
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

  // ── Helper para suscribir un canal de forma segura ───────────────────────
  const subscribeChannel = useCallback(
    (channel: RealtimeChannel, index: number) => {
      try {
        channelsRef.current[index] = channel.subscribe();
      } catch (err) {
        console.error(
          `[SitioRealtime] Error suscribiendo canal ${index}:`,
          err,
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!uuid) return;

    // ── Canal 0: Sitios ───────────────────────────────────────────────────
    subscribeChannel(
      supabase.channel(`sitios:${uuid}`).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Sitios",
          filter: `UUID=eq.${uuid}`,
        },
        () => {
          if (!canToast()) return;
          router.refresh();
          sileo.info({
            title: "Página Actualizada",
            description: "La configuración de la tienda ha cambiado.",
          });
        },
      ),
      0,
    );

    // ── Canal 1: Products ─────────────────────────────────────────────────
    subscribeChannel(
      supabase.channel(`products:${uuid}`).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Products",
          filter: `storeId=eq.${uuid}`,
        },
        (payload) => {
          if (!canToast()) return;
          router.refresh();

          if (payload.eventType === "INSERT") {
            const newRow = (payload.new ?? {}) as ProductPayload;
            sileo.info({
              title: "Nueva Disponibilidad",
              description: newRow.title ?? "Nuevo producto agregado",
              button: {
                title: "Ver",
                onClick: () =>
                  navigateToProduct(
                    newRow.productId || newRow.title || "",
                    newRow.caja || "",
                  ),
              },
            });
          } else if (payload.eventType === "UPDATE") {
            sileo.info({
              title: "Producto Actualizado",
              description:
                (payload.new as ProductPayload)?.title ??
                "Un producto fue modificado.",
            });
          } else if (payload.eventType === "DELETE") {
            sileo.info({
              title: "Producto Eliminado",
              description: "Un producto fue eliminado del catálogo.",
            });
          }
        },
      ),
      1,
    );

    // ── Canal 2: product_variants ─────────────────────────────────────────
    // Nota: product_variants no tiene un campo storeId directo.
    // El filtro es por product_id usando la relación Products → storeId.
    // Supabase no soporta JOINs en filtros de realtime, por lo que escuchamos
    // todos los cambios y filtramos del lado cliente si es necesario,
    // o bien confiamos en RLS para restringir las filas visibles.
    subscribeChannel(
      supabase
        .channel(`variants:${uuid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "product_variants" },
          (payload) => {
            if (!canToast()) return;

            const row = (payload.new ?? payload.old ?? {}) as VariantPayload;

            if (payload.eventType === "INSERT") {
              router.refresh();
              sileo.info({
                title: "Nueva Variante Disponible",
                description: row.label
                  ? `Variante "${row.label}" agregada.`
                  : "Se agregó una nueva variante a un producto.",
                button: row.product_id
                  ? {
                      title: "Ver Producto",
                      onClick: () => navigateToProduct(row.product_id!, ""),
                    }
                  : undefined,
              });
            } else if (payload.eventType === "UPDATE") {
              router.refresh();
              const oldRow = (payload.old ?? {}) as VariantPayload;
              const stockCambio =
                oldRow.stock !== undefined && row.stock !== undefined
                  ? row.stock - oldRow.stock
                  : null;

              const stockMsg =
                stockCambio !== null
                  ? stockCambio > 0
                    ? `Stock aumentado en ${stockCambio} unidades.`
                    : stockCambio < 0
                      ? `Stock reducido en ${Math.abs(stockCambio)} unidades.`
                      : "Stock sin cambios."
                  : "Variante actualizada.";

              sileo.info({
                title: "Variante Actualizada",
                description: row.label
                  ? `"${row.label}": ${stockMsg}`
                  : stockMsg,
              });
            } else if (payload.eventType === "DELETE") {
              router.refresh();
              sileo.info({
                title: "Variante Eliminada",
                description: "Una variante fue eliminada de un producto.",
              });
            }
          },
        ),
      2,
    );

    // ── Canal 3: quantity_discounts ───────────────────────────────────────
    // Misma situación que variants: filtramos por product_id (sin storeId directo).
    // RLS o lógica de negocio deben restringir el acceso correctamente.
    subscribeChannel(
      supabase
        .channel(`discounts:${uuid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "quantity_discounts" },
          (payload) => {
            if (!canToast()) return;

            const row = (payload.new ?? payload.old ?? {}) as DiscountPayload;

            const typeLabel: Record<string, string> = {
              percentage: "porcentaje",
              fixed: "monto fijo",
              quantity: "cantidad",
            };

            if (payload.eventType === "INSERT") {
              router.refresh();
              sileo.info({
                title: "Nuevo Descuento por Cantidad",
                description: row.value
                  ? `Descuento de ${row.value}${row.type === "percentage" ? "%" : ""} (${typeLabel[row.type ?? ""] ?? row.type}) desde ${row.min_qty} unidades.`
                  : "Se configuró un nuevo descuento por cantidad.",
              });
            } else if (payload.eventType === "UPDATE") {
              router.refresh();
              sileo.info({
                title: "Descuento Actualizado",
                description: "Un descuento por cantidad fue modificado.",
              });
            } else if (payload.eventType === "DELETE") {
              router.refresh();
              sileo.info({
                title: "Descuento Eliminado",
                description: "Un descuento por cantidad fue eliminado.",
              });
            }
          },
        ),
      3,
    );

    // ── Cleanup: desuscribir todos los canales al desmontar ───────────────
    const activeChannels = channelsRef.current;

    return () => {
      activeChannels.forEach((channel) => {
        if (!channel) return;
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.error(`[SitioRealtime] Error limpiando canal:`, err);
        }
      });

      channelsRef.current = [null, null, null, null];
    };
  }, [uuid, router, canToast, navigateToProduct, subscribeChannel]);

  return null;
}
