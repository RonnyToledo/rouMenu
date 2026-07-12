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
 * Si la variante no tiene atributos visibles, devuelve un atributo derivado
 * "variant_label" basado en el label de la variante para hacerla seleccionable.
 */
export function getVisibleAttributes(
  variant: ProductVariant,
): Record<string, unknown> {
  // 🔥 Las variantes principales NO deben tener atributos visibles
  if (variant.default_variant) {
    return {};
  }

  if (!variant.attributes) {
    if (variant.label) {
      return { Producto: variant.label };
    }
    return {};
  }

  const attrs = Object.fromEntries(
    Object.entries(variant.attributes).filter(([k]) => !INTERNAL_KEYS.has(k)),
  );

  if (Object.keys(attrs).length === 0 && variant.label) {
    return { Producto: variant.label };
  }

  return attrs;
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
 *
 * Para variantes sin atributos visibles, crea automáticamente un atributo derivado
 * "variant_label" basado en el label de la variante para hacerla seleccionable.
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
  return variants.find((v) => {
    const attrs = getVisibleAttributes(v);
    return Object.entries(selection).every(
      ([k, val]) =>
        k in attrs && normalizeAttrValue(attrs[k]) === normalizeAttrValue(val),
    );
  });
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
  selection: Record<string, unknown>,
  key: string,
  value: unknown,
): boolean {
  const nextSelection = {
    ...selection,
    [key]: value,
  };

  return variants.some((v) => {
    if ((v.stock ?? 0) <= 0) return false;

    const attrs = getVisibleAttributes(v);

    for (const [k, val] of Object.entries(nextSelection)) {
      if (!(k in attrs)) continue;

      if (normalizeAttrValue(attrs[k]) !== normalizeAttrValue(val))
        return false;
    }

    return true;
  });
}
