import { Product } from "@/types/InitialStatus";

/**
 * Construye una lista de hasta `max` productos sugeridos para mostrar.
 * Orden: combos configurados → misma categoría → cualquier otro.
 */
export function buildSuggestions(
  product: Product,
  allProducts: Product[],
  max = 4,
): Product[] {
  const currentId = product.productId;

  // 1. Combos configurados (en el orden que vienen)
  const fromCombos = (product.combos ?? [])
    .map((c: { productId: string }) =>
      allProducts.find((p) => p.productId === c.productId),
    )
    .filter((p): p is Product => !!p && p.productId !== currentId);

  if (fromCombos.length >= max) return fromCombos.slice(0, max);

  const used = new Set([currentId, ...fromCombos.map((p) => p.productId)]);

  // 2. Misma categoría
  const fromCategory = allProducts.filter(
    (p) =>
      p.caja === product.caja && !used.has(p.productId) && p.visible && p.venta,
  );
  for (const p of fromCategory) {
    if (fromCombos.length + (fromCategory.indexOf(p) + 1) > max) break;
    used.add(p.productId);
  }

  const combined = [
    ...fromCombos,
    ...fromCategory.slice(0, max - fromCombos.length),
  ];
  if (combined.length >= max) return combined.slice(0, max);

  // 3. Cualquier otro visible
  const rest = allProducts.filter(
    (p) => !used.has(p.productId) && p.visible && p.venta,
  );

  return [...combined, ...rest.slice(0, max - combined.length)].slice(0, max);
}
