import { AppState, Current, Product } from "@/context/InitialStatus";

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
    {}
  );

  const convertAndRound = (
    amount: number,
    valorSrc: number,
    valorDst: number
  ) => {
    const a = Number(amount ?? 0);
    if (!isFinite(a)) return 0;
    const vs = Number(valorSrc ?? 1) || 1;
    const vd = Number(valorDst ?? 1) || 1;
    if (vd === 0) return 0;
    const converted = (a * vs) / vd;
    return smartRound(converted);
  };

  let total = 0;

  for (const p of products || []) {
    const qty = Number(p.Cant ?? 0);
    const hasAggQty = (p.agregados ?? []).some((a) => (a.cant ?? 0) > 0);
    if (qty === 0 && !hasAggQty) continue; // ignorar productos sin cantidad ni agregados

    const monedaOrigen = monedaMap[p.default_moneda as number] ?? target;
    const valorOrigen = Number(monedaOrigen?.valor ?? 1) || 1;

    const priceConv = convertAndRound(p.price ?? 0, valorOrigen, valorTarget);
    const embalajeConv = convertAndRound(
      p.embalaje ?? 0,
      valorOrigen,
      valorTarget
    );

    // total por el producto (precio + embalaje) * cantidad
    total += (priceConv + embalajeConv) * qty;

    // agregados: (precio_agregado + embalaje_por_producto) * cantidad_agregado
    const agregadosTotal = (p.agregados ?? []).reduce((sum, agg) => {
      const aggQty = Number(agg.cant ?? 0);
      if (aggQty <= 0) return sum;
      const aggPriceConv = convertAndRound(
        agg.price ?? 0,
        valorOrigen,
        valorTarget
      );
      // si no quieres sumar embalaje dentro del agregado, quita + embalajeConv
      return sum + (aggPriceConv + embalajeConv) * aggQty;
    }, 0);

    total += agregadosTotal;
  }

  return smartRound(total);
}
