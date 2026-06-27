// lib/shareCart.ts

export interface ShareCartItem {
  id: string; // productId
  vid?: string; // variantId (opcional, solo si no es default)
  qty: number;
}

/**
 * Serializa el carrito como un string base64 seguro para URL.
 * Ejemplo: [{ id: "abc", vid: "v1", qty: 3 }] → "W3siaWQiOiJhYmMi..."
 */
export function encodeShareCart(items: ShareCartItem[]): string {
  try {
    const json = JSON.stringify(items);
    // btoa con soporte unicode
    return btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16)),
      ),
    );
  } catch {
    return "";
  }
}

/**
 * Decodifica el parámetro `cart` de la URL.
 * Retorna null si el valor es inválido.
 */
export function decodeShareCart(encoded: string): ShareCartItem[] | null {
  try {
    const json = decodeURIComponent(
      Array.from(atob(encoded))
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    return parsed as ShareCartItem[];
  } catch {
    return null;
  }
}

/**
 * Construye la URL completa para compartir el carrito.
 * Usa window.location.origin + la ruta actual, reemplazando
 * cualquier searchParam existente de `cart`.
 */
export function buildShareCartUrl(
  shop: string,
  items: ShareCartItem[],
): string {
  const encoded = encodeShareCart(items);
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${shop}`
      : `/t/${shop}`;
  return `${base}?cart=${encoded}`;
}
