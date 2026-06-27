import { AppState, Current, Product } from "@/types/InitialStatus";
import { convertAndRoundCurrency } from "@/lib/pricing/currency";

/**
 * Devuelve el total final (number) convertido a la moneda defecto del store.
 */
export function getTotalFinal(store: AppState, products: Product[]) {
  // tus funciones de redondeo (usa tus implementaciones reales)
  const smartRound = (n: number) =>
    Math.round((n + Number.EPSILON) * 100) / 100; // 2 decimales

  const target = (store.moneda || []).find((m) => m.defecto) ||
    (store.moneda || [])[0] || { id: 0, valor: 1 };

  const valorTarget = Number(target.valor ?? 1) || 1;

  // mapa id -> moneda para resolver origen por producto
  const monedaMap = (store.moneda || []).reduce<Record<number, Current>>(
    (acc, m) => {
      acc[m.id] = m;
      return acc;
    },
    {},
  );

  let total = 0;

  for (const p of products || []) {
    const qty = Number(p.selected_variant?.Cant ?? 0);

    if (qty === 0) continue; // ignorar productos sin cantidad ni agregados

    const monedaOrigen = monedaMap[p.default_moneda as number] ?? target;
    const valorOrigen = Number(monedaOrigen?.valor ?? 1) || 1;

    const priceConv = convertAndRoundCurrency(
      p.selected_variant?.price ?? 0,
      valorOrigen,
      valorTarget,
    );
    const embalajeConv = convertAndRoundCurrency(
      p.selected_variant?.embalaje ?? 0,
      valorOrigen,
      valorTarget,
    );

    // total por el producto (precio + embalaje) * cantidad
    total += (priceConv + embalajeConv) * qty;
  }

  return smartRound(total);
}
