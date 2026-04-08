// src/lib/indexedDBCart.ts
// Utilidades para IndexedDB — soporta variantes de producto

import { ProductVariant } from "@/types/InitialStatus";

export type SavedAgregado = {
  id: string;
  cant: number;
  price?: number;
  name?: string;
};

export type SavedProduct = {
  productId: string;
  Cant?: number;
  agregados?: SavedAgregado[];
  /** ID de la variante seleccionada (solo si no es la default) */
  variantId?: string;
  /** Objeto completo de la variante (para restaurar precio, stock, imagen, etc.) */
  selected_variant?: ProductVariant;
};

export type IDBCartEntry = {
  key: string;
  value: SavedProduct[];
  purchaseUuid?: string;
};

const DB_NAME = "roudev_cart_db";
const DB_VERSION = 1;
const STORE_NAME = "carts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!(window && "indexedDB" in window)) {
      reject(new Error("IndexedDB no está disponible en este navegador."));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => console.warn("IndexedDB open blocked");
  });
}

function normalizeSavedProduct(p: SavedProduct): SavedProduct {
  const agregadosNormalized =
    p.agregados?.map((a) => ({
      id: String(a.id),
      cant: Number(a?.cant ?? 0),
      price: a?.price,
      name: a?.name,
    })) ?? [];

  return {
    productId: String(p.productId),
    Cant: p.Cant !== undefined ? Number(p.Cant) : undefined,
    agregados: agregadosNormalized,
    // Preservar datos de variante tal como están (ya son serializables)
    ...(p.variantId ? { variantId: p.variantId } : {}),
    ...(p.selected_variant ? { selected_variant: p.selected_variant } : {}),
  };
}

/**
 * Guarda el carrito en IndexedDB bajo la key `cart_<shopKey>`.
 * Incluye información de variantes si existen.
 */
export async function saveCartToIDB(
  shopKey: string,
  cartData: SavedProduct[],
  purchaseUuid?: string,
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const normalized: SavedProduct[] = (cartData ?? []).map((p) =>
      normalizeSavedProduct(p),
    );

    const entry: IDBCartEntry = {
      key: `cart_${shopKey}`,
      value: normalized,
      ...(purchaseUuid ? { purchaseUuid } : {}),
    };

    store.put(entry);
    await txComplete(tx);
    db.close();
  } catch (err) {
    console.error("saveCartToIDB error:", err);
    throw err;
  }
}

/**
 * Devuelve la entrada guardada o null si no existe.
 * Normaliza los datos al devolver para garantizar coherencia.
 */
export async function loadCartFromIDB(
  shopKey: string,
): Promise<{ products: SavedProduct[]; purchaseUuid?: string } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(`cart_${shopKey}`);
    const value = await reqToPromise<IDBCartEntry | undefined>(req);
    await txComplete(tx);
    db.close();

    if (!value?.value) return null;
    const normalized = value.value.map((p) => normalizeSavedProduct(p));
    return { products: normalized, purchaseUuid: value.purchaseUuid };
  } catch (err) {
    console.error("loadCartFromIDB error:", err);
    return null;
  }
}

/**
 * Compatibilidad: devuelve solo el array de productos (SavedProduct[] | null).
 */
export async function loadCartProductsFromIDB(
  shopKey: string,
): Promise<SavedProduct[] | null> {
  const entry = await loadCartFromIDB(shopKey);
  return entry?.products ?? null;
}

export async function clearCartFromIDB(shopKey: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(`cart_${shopKey}`);
    await txComplete(tx);
    db.close();
  } catch (err) {
    console.error("clearCartFromIDB error:", err);
    throw err;
  }
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function reqToPromise<T>(req: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}
