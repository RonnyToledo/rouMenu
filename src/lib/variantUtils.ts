// lib/variantUtils.ts
// Utilidades compartidas para el manejo de variantes con attributes tipados

import { ProductVariant } from "@/types/InitialStatus";

// Claves de attributes que son metadata interna, no se muestran al usuario
const INTERNAL_KEYS = new Set(["tipo", "es_default"]);

/**
 * Devuelve los atributos visibles de una variante (filtrando claves internas).
 * Ejemplo: { "color": "Rojo", "talla": "M", "tipo": "default", "es_default": true }
 *       => { "color": "Rojo", "talla": "M" }
 */
export function getVisibleAttributes(
  variant: ProductVariant,
): Record<string, string | number | boolean> {
  if (!variant.attributes) return {};
  return Object.fromEntries(
    Object.entries(variant.attributes).filter(([k]) => !INTERNAL_KEYS.has(k)),
  );
}

/**
 * Devuelve las claves de atributos únicos presentes en un conjunto de variantes,
 * en el orden en que aparecen por primera vez.
 * Ejemplo: variantes con color+talla y variante con solo color → ["color", "talla"]
 */
export function getAttributeKeys(variants: ProductVariant[]): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const v of variants) {
    for (const k of Object.keys(getVisibleAttributes(v))) {
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
  }
  return keys;
}

/**
 * Agrupa las variantes por atributo.
 * Devuelve un mapa: { "color": ["Rojo", "Azul"], "talla": ["M", "L", "XL"] }
 * Los valores son únicos y en orden de aparición.
 */
export function groupVariantsByAttribute(
  variants: ProductVariant[],
): Record<string, (string | number | boolean)[]> {
  const result: Record<string, (string | number | boolean)[]> = {};
  const keys = getAttributeKeys(variants);

  for (const key of keys) {
    const values: (string | number | boolean)[] = [];
    const seen = new Set<string>();
    for (const v of variants) {
      const attrs = getVisibleAttributes(v);
      if (attrs[key] !== undefined) {
        const strVal = String(attrs[key]);
        if (!seen.has(strVal)) {
          seen.add(strVal);
          values.push(attrs[key]);
        }
      }
    }
    result[key] = values;
  }
  return result;
}

/**
 * Dado un conjunto de variantes y una selección parcial de atributos,
 * encuentra la variante que más coincide con esa selección.
 * Si no hay coincidencia exacta, devuelve la primera disponible.
 */
export function findVariantByAttributes(
  variants: ProductVariant[],
  selection: Record<string, string | number | boolean>,
): ProductVariant | undefined {
  // Buscar coincidencia exacta en todos los atributos seleccionados
  const exact = variants.find((v) => {
    const attrs = getVisibleAttributes(v);
    return Object.entries(selection).every(
      ([k, val]) => String(attrs[k]) === String(val),
    );
  });
  if (exact) return exact;

  // Si no hay exacta, buscar la que más atributos coincide
  let best: ProductVariant | undefined;
  let bestScore = -1;
  for (const v of variants) {
    const attrs = getVisibleAttributes(v);
    const score = Object.entries(selection).filter(
      ([k, val]) => String(attrs[k]) === String(val),
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }
  return best ?? variants[0];
}

/**
 * Construye el sufijo de variante para mostrar en el título del carrito.
 * Usa los atributos visibles de la variante seleccionada.
 *
 * Ejemplo:
 *   baseTitle = "Cafe Capuchino"
 *   variant.attributes = { color: "Rojo", talla: "M" }
 *   → "Cafe Capuchino · Rojo · M"
 *
 * Si la variante no tiene atributos visibles, cae back al label de la variante.
 * Si es la variante default, devuelve solo el baseTitle.
 */
export function buildCartTitle(
  baseTitle: string,
  variant?: ProductVariant,
): string {
  if (!variant || variant.default) return baseTitle;

  const attrs = getVisibleAttributes(variant);
  const attrValues = Object.values(attrs);

  if (attrValues.length > 0) {
    return `${baseTitle} · ${attrValues.map(String).join(" · ")}`;
  }

  // Fallback: usar label si no hay attributes visibles
  // y el label no duplica el baseTitle
  if (
    variant.label &&
    !variant.label.toLowerCase().includes(baseTitle.toLowerCase())
  ) {
    return `${baseTitle} · ${variant.label}`;
  }

  return baseTitle;
}

/**
 * Capitaliza la primera letra de un string.
 * Útil para mostrar claves de atributos como cabeceras.
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Dado el estado de selección actual (atributo → valor) y la lista de variantes,
 * determina si una combinación específica tiene stock.
 * Útil para deshabilitar valores de atributos sin stock.
 */
export function isAttributeValueAvailable(
  variants: ProductVariant[],
  currentSelection: Record<string, string | number | boolean>,
  attributeKey: string,
  attributeValue: string | number | boolean,
): boolean {
  // Construir selección hipotética incluyendo este valor
  const hypothetical = { ...currentSelection, [attributeKey]: attributeValue };

  // Buscar alguna variante que coincida con esa selección hipotética y tenga stock
  return variants.some((v) => {
    const attrs = getVisibleAttributes(v);
    const matches = Object.entries(hypothetical).every(
      ([k, val]) => attrs[k] === undefined || String(attrs[k]) === String(val),
    );
    return matches && !v.agotado && (v.stock ?? 1) > 0;
  });
}
