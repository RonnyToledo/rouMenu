// lib/variantUtils.ts
// Utilidades compartidas para el manejo de variantes con attributes tipados

import { ProductVariant } from "@/types/InitialStatus";

// Claves de attributes que son metadata interna, no se muestran al usuario
const INTERNAL_KEYS = new Set(["tipo", "es_default"]);

/**
 * Normaliza un valor de atributo a string comparable.
 * Soporta color como objeto {hex, name} o string directo.
 */
export function normalizeAttrValue(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && "name" in (val as object)) {
    return String((val as { name: string }).name);
  }
  return String(val);
}

/**
 * Extrae el hex de un valor de atributo color.
 * Soporta {hex, name} o string directo.
 */
export function extractColorHex(val: unknown): string {
  if (typeof val === "object" && val !== null && "hex" in val) {
    return String((val as { hex: string }).hex);
  }
  return String(val ?? "");
}

/**
 * Devuelve los atributos visibles de una variante (filtrando claves internas).
 */
export function getVisibleAttributes(
  variant: ProductVariant,
): Record<string, unknown> {
  if (!variant.attributes) return {};
  return Object.fromEntries(
    Object.entries(variant.attributes).filter(([k]) => !INTERNAL_KEYS.has(k)),
  );
}

/**
 * Devuelve las claves de atributos únicos presentes en un conjunto de variantes,
 * en el orden en que aparecen por primera vez.
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
 * Devuelve un mapa: { "color": [{hex, name},...], "talla": ["M","L","XL"] }
 * Los valores son únicos (comparados por normalizeAttrValue) y en orden de aparición.
 */
export function groupVariantsByAttribute(
  variants: ProductVariant[],
): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {};
  const keys = getAttributeKeys(variants);

  for (const key of keys) {
    const values: unknown[] = [];
    const seen = new Set<string>();
    for (const v of variants) {
      const attrs = getVisibleAttributes(v);
      if (attrs[key] !== undefined) {
        const strVal = normalizeAttrValue(attrs[key]);
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
 * Dado un conjunto de variantes y una selección de atributos,
 * encuentra la variante que coincide exactamente.
 * Si no hay coincidencia exacta, devuelve la que más atributos coincide.
 */
export function findVariantByAttributes(
  variants: ProductVariant[],
  selection: Record<string, unknown>,
): ProductVariant | undefined {
  // Coincidencia exacta: todos los atributos visibles de la selección coinciden
  const exact = variants.find((v) => {
    const attrs = getVisibleAttributes(v);
    return Object.entries(selection).every(
      ([k, val]) => normalizeAttrValue(attrs[k]) === normalizeAttrValue(val),
    );
  });

  if (exact) return exact;

  // Fallback: mayor número de coincidencias
  let best: ProductVariant | undefined;
  let bestScore = -1;
  for (const v of variants) {
    const attrs = getVisibleAttributes(v);
    const score = Object.entries(selection).filter(
      ([k, val]) => normalizeAttrValue(attrs[k]) === normalizeAttrValue(val),
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }

  return best ?? variants[0];
}

/**
 * Determina si un color hex/rgb es claro u oscuro.
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  if (hex.length < 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Construye el título del carrito con los atributos visibles de la variante.
 */
export function buildCartTitle(
  baseTitle: string,
  variant?: ProductVariant,
): string {
  if (!variant || variant.default) return baseTitle;

  const attrs = getVisibleAttributes(variant);
  const attrValues = Object.values(attrs).map(normalizeAttrValue);

  if (attrValues.length > 0) {
    return `${baseTitle} · ${attrValues.join(" · ")}`;
  }

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
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Determina si un valor de atributo está disponible dada la selección actual.
 *
 * FIX: el bug original usaba `attrs[k] === undefined || ...` lo que hacía que
 * atributos ausentes se consideraran válidos, permitiendo combinaciones
 * inexistentes (ej: "rojo/XL" cuando solo existe "rojo/L" y "amarillo/XL").
 *
 * Ahora se requiere que el atributo exista EN la variante y coincida.
 * Además solo se considera válida una variante con stock > 0.
 */
export function isAttributeValueAvailable(
  variants: ProductVariant[],
  currentSelection: Record<string, unknown>,
  attributeKey: string,
  attributeValue: unknown,
): boolean {
  const hypothetical = { ...currentSelection, [attributeKey]: attributeValue };

  return variants.some((v) => {
    // Solo variantes con stock
    if ((v.stock ?? 0) <= 0) return false;

    const attrs = getVisibleAttributes(v);

    return Object.entries(hypothetical).every(([k, val]) => {
      // FIX: el atributo debe existir en la variante (no saltar si es undefined)
      if (attrs[k] === undefined) return false;
      return normalizeAttrValue(attrs[k]) === normalizeAttrValue(val);
    });
  });
}
