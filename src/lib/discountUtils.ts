import { ProductVariant, QuantityDiscount } from "@/types/InitialStatus";

export function getVariantBasePrice(
  variant: ProductVariant | undefined | null,
  fallbackPrice = 0,
): number {
  if (!variant) return fallbackPrice;
  return variant.basePrice ?? variant.price ?? fallbackPrice;
}

/**
 * Encuentra la regla de descuento aplicable para una cantidad dada.
 */
export function getApplicableDiscount(
  variant: ProductVariant | undefined | null,
  qty: number,
): QuantityDiscount | null {
  if (!variant?.quantity_discounts?.length || qty <= 0) return null;

  const applicable = variant.quantity_discounts
    .filter((d) => qty >= d.min_qty && (d.max_qty === null || qty <= d.max_qty))
    .sort((a, b) => b.min_qty - a.min_qty); // más específica primero

  return applicable[0] ?? null;
}

/**
 * Calcula el precio unitario final aplicando el descuento por cantidad.
 * Siempre devuelve el precio por unidad (no el total).
 */
export function calcPriceWithDiscount(
  basePrice: number,
  qty: number,
  variant: ProductVariant | undefined | null,
): number {
  const rule = getApplicableDiscount(variant, qty);
  if (!rule) return basePrice;

  switch (rule.type) {
    case "percentage":
      return basePrice * (1 - rule.value / 100);
    case "fixed":
      return Math.max(0, basePrice - rule.value);
    case "quantity":
      return rule.value; // precio unitario reemplazado
    default:
      return basePrice;
  }
}

export function repriceVariantForQuantity(
  variant: ProductVariant | undefined | null,
  qty: number,
  fallbackPrice = 0,
): ProductVariant | undefined | null {
  if (!variant) return variant;

  const basePrice = getVariantBasePrice(variant, fallbackPrice);

  return {
    ...variant,
    basePrice,
    Cant: qty,
    price: calcPriceWithDiscount(basePrice, qty, variant),
  };
}

export function convertQuantityDiscount(
  rule: QuantityDiscount,
  factor: number,
): QuantityDiscount {
  if (rule.type === "percentage") return rule;

  return {
    ...rule,
    value: Number.isFinite(rule.value) ? rule.value * factor : rule.value,
  };
}

/**
 * Devuelve un string descriptivo del descuento para mostrar en UI.
 * Ej: "10% OFF comprando 5+" o "-$200 comprando 10+"
 */
export function discountLabel(rule: QuantityDiscount): string {
  const from = `comprando ${rule.min_qty}+`;
  switch (rule.type) {
    case "percentage":
      return `${rule.value}% OFF ${from}`;
    case "fixed":
      return `-$${rule.value} ${from}`;
    case "quantity":
      return `$${rule.value} c/u ${from}`;
  }
}
