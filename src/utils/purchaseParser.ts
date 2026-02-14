// ============================================
// UTILITIES - Exportar a utils/purchaseParser.ts
// ============================================

import { AgregadosInterface } from "@/context/InitialStatus";

interface ParsedEventDesc {
  items: number;
  total: number;
  currency?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  discountCode?: string | null;
  raw: unknown;
}

/**
 * Parser robusto para event_desc JSON
 * Soporta múltiples formatos de datos
 */
export function parseEventDesc(desc?: string | null): ParsedEventDesc {
  const result: ParsedEventDesc = {
    items: 0,
    total: 0,
    currency: undefined,
    phone: undefined,
    address: undefined,
    paymentMethod: undefined,
    discountCode: undefined,
    raw: null,
  };

  if (!desc) return result;

  try {
    const parsed = JSON.parse(desc);
    result.raw = parsed;

    // Extrae teléfono de múltiples formatos
    result.phone =
      String(parsed.phonenumber ?? parsed.phone ?? "").trim() || undefined;

    // Extrae dirección de múltiples campos
    result.address =
      (parsed.direccion ?? parsed.lugar ?? parsed.address ?? "").trim() ||
      undefined;

    // Extrae método de pago
    result.paymentMethod =
      (parsed.pago ?? parsed.payment ?? "").trim() || undefined;

    // Extrae código de descuento
    result.discountCode =
      typeof parsed.code === "string"
        ? parsed.code
        : (parsed.code?.name ?? null);

    // Extrae moneda
    result.currency = parsed.moneda;

    // Procesa total explícito
    const explicitTotal = Number(parsed.total);
    if (!isNaN(explicitTotal) && explicitTotal > 0) {
      result.total = explicitTotal;
    }

    // Procesa array de pedidos
    const itemsArray = parsed.pedido ?? parsed.items ?? [];
    if (Array.isArray(itemsArray) && itemsArray.length > 0) {
      let totalItems = 0;
      let subtotal = 0;

      for (const item of itemsArray) {
        if (!item || typeof item !== "object") continue;
        const aggQty = item.agregados.reduce(
          (sum: number, agg: AgregadosInterface) => {
            const aggQty = Number(agg.cant || 0) || 0;
            return sum + aggQty;
          },
          0
        );
        const qty =
          Number(item.Cant ?? item.cant ?? item.quantity ?? item.qty ?? 0) || 0;
        const price =
          Number(item.price ?? item.priceCompra ?? item.precio ?? 0) || 0;

        totalItems += qty + aggQty;
        subtotal += price * qty;
      }

      result.items = totalItems;
      // Solo usa subtotal si no hay total explícito
      if (result.total === 0 && subtotal > 0) {
        result.total = subtotal;
      }
    }

    return result;
  } catch (error) {
    console.warn("Error parsing event_desc:", error);
    return result;
  }
}

/**
 * Formatea valores monetarios con fallback inteligente
 */
export function formatCurrency(value: number, currency?: string): string {
  if (typeof value !== "number" || isNaN(value) || value < 0) {
    return "-";
  }

  try {
    if (currency?.length === 3 && /^[A-Z]{3}$/.test(currency)) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    }
  } catch {
    // Currency inválida, usa fallback
  }

  return `$${value.toFixed(2)}`;
}
