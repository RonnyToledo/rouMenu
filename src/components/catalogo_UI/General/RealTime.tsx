"use client";

import { useCallback, useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/realtime-js";
import { sileo } from "sileo";
import { MyContext } from "@/context/MyContext";
import { ScrollTo } from "@/functions/ScrollTo";
import {
  useRealtimeChannelRegistry,
  useToastDebounce,
} from "@/hooks/useRealtimeChannelRegistry";

interface Props {
  uuid: string;
}

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

const DISCOUNT_TYPE_LABEL: Record<string, string> = {
  percentage: "porcentaje",
  fixed: "monto fijo",
  quantity: "cantidad",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function SitioRealtime({ uuid }: Props) {
  const { store } = useContext(MyContext);
  const router = useRouter();
  const pathname = usePathname();

  const canToast = useToastDebounce();
  const { subscribe, unsubscribeAll } = useRealtimeChannelRegistry();

  // Navega / hace scroll al producto que cambió, según en qué página estemos
  const navigateToProduct = useCallback(
    (productId: string, category: string) => {
      if (
        pathname === `/t/${store.sitioweb}` ||
        pathname === `/t/${store.sitioweb}/category/${category}`
      ) {
        ScrollTo(productId, 120);
      } else {
        router.push(`/t/${store.sitioweb}/producto/${productId}`);
      }
    },
    [pathname, store.sitioweb, router],
  );

  useEffect(() => {
    if (!uuid) return;

    // ── Sitios: cambios de configuración de la tienda ──────────────────────
    subscribe(
      `sitios:${uuid}`,
      "Sitios",
      () => {
        if (!canToast()) return;
        router.refresh();
        sileo.info({
          title: "Página Actualizada",
          description: "La configuración de la tienda ha cambiado.",
        });
      },
      `UUID=eq.${uuid}`,
    );

    // ── Products ─────────────────────────────────────────────────────────
    subscribe(
      `products:${uuid}`,
      "Products",
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
      `storeId=eq.${uuid}`,
    );

    // ── product_variants ─────────────────────────────────────────────────
    // Nota: no tiene storeId directo. Supabase no soporta JOINs en filtros
    // de realtime, así que escuchamos todos los cambios y confiamos en RLS
    // para restringir las filas visibles.
    subscribe(
      `variants:${uuid}`,
      "product_variants",
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        if (!canToast()) return;
        router.refresh();

        const row = (payload.new ?? payload.old ?? {}) as VariantPayload;

        if (payload.eventType === "INSERT") {
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
          const oldRow = (payload.old ?? {}) as VariantPayload;
          const stockDelta =
            oldRow.stock !== undefined && row.stock !== undefined
              ? row.stock - oldRow.stock
              : null;

          const stockMsg =
            stockDelta === null
              ? "Variante actualizada."
              : stockDelta > 0
                ? `Stock aumentado en ${stockDelta} unidades.`
                : stockDelta < 0
                  ? `Stock reducido en ${Math.abs(stockDelta)} unidades.`
                  : "Stock sin cambios.";

          sileo.info({
            title: "Variante Actualizada",
            description: row.label ? `"${row.label}": ${stockMsg}` : stockMsg,
          });
        } else if (payload.eventType === "DELETE") {
          sileo.info({
            title: "Variante Eliminada",
            description: "Una variante fue eliminada de un producto.",
          });
        }
      },
    );

    // ── quantity_discounts ──────────────────────────────────────────────
    // Misma situación que variants: sin storeId directo, RLS restringe acceso.
    subscribe(
      `discounts:${uuid}`,
      "quantity_discounts",
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        if (!canToast()) return;
        router.refresh();

        const row = (payload.new ?? payload.old ?? {}) as DiscountPayload;

        if (payload.eventType === "INSERT") {
          sileo.info({
            title: "Nuevo Descuento por Cantidad",
            description: row.value
              ? `Descuento de ${row.value}${row.type === "percentage" ? "%" : ""} (${DISCOUNT_TYPE_LABEL[row.type ?? ""] ?? row.type}) desde ${row.min_qty} unidades.`
              : "Se configuró un nuevo descuento por cantidad.",
          });
        } else if (payload.eventType === "UPDATE") {
          sileo.info({
            title: "Descuento Actualizado",
            description: "Un descuento por cantidad fue modificado.",
          });
        } else if (payload.eventType === "DELETE") {
          sileo.info({
            title: "Descuento Eliminado",
            description: "Un descuento por cantidad fue eliminado.",
          });
        }
      },
    );

    return unsubscribeAll;
  }, [uuid, router, canToast, navigateToProduct, subscribe, unsubscribeAll]);

  return null;
}
