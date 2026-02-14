// src/lib/indexedDBCart.ts
// Utilidades para IndexedDB (sin `any`) — normaliza las cantidades de agregados

export type SavedAgregado = {
  id: string;
  cant: number; // cantidad del agregado (AHORA obligatoria y normalizada)
  price?: number;
  name?: string;
};

export type SavedProduct = {
  productId: string;
  Cant?: number; // cantidad del producto
  agregados?: SavedAgregado[];
};

// Ahora permitimos opcionalmente guardar una "purchaseUuid" junto a la entrada
export type IDBCartEntry = {
  key: string; // ej: cart_mitienda
  value: SavedProduct[]; // guardamos el array normalizado
  purchaseUuid?: string; // clave UUID de la compra (opcional)
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

    req.onsuccess = () => {
      resolve(req.result);
    };

    req.onerror = () => {
      reject(req.error);
    };

    req.onblocked = () => {
      console.warn("IndexedDB open blocked");
    };
  });
}

/**
 * Normaliza un SavedProduct asegurando que cada agregado tenga 'cant' (number).
 */
function normalizeSavedProduct(p: SavedProduct): SavedProduct {
  const agregadosNormalized =
    p.agregados?.map((a) => ({
      id: String(a.id),
      // Forzamos a número; si no viene, ponemos 0
      cant: Number(a?.cant ?? 0),
      price: a?.price,
      name: a?.name,
    })) ?? [];

  return {
    productId: String(p.productId),
    Cant: p.Cant !== undefined ? Number(p.Cant) : undefined,
    agregados: agregadosNormalized,
  };
}

/**
 * Guarda un array de SavedProduct bajo la key `cart_<shopKey>`,
 * normalizando las cantidades de agregados.
 *
 * Ahora acepta un parámetro opcional `purchaseUuid` que, si se proporciona,
 * se guardará en la entrada junto con los productos.
 */
export async function saveCartToIDB(
  shopKey: string,
  cartData: SavedProduct[],
  purchaseUuid?: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Normalizamos cada producto antes de persistir
    const normalized: SavedProduct[] = (cartData ?? []).map((p) =>
      normalizeSavedProduct(p)
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
 * Al cargar también normalizamos para garantizar que agregados tengan 'cant' numérico.
 *
 * RETURN: { products: SavedProduct[], purchaseUuid?: string } | null
 */
export async function loadCartFromIDB(
  shopKey: string
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
    // Normalizamos al devolver
    const normalized = value.value.map((p) => normalizeSavedProduct(p));
    return { products: normalized, purchaseUuid: value.purchaseUuid };
  } catch (err) {
    console.error("loadCartFromIDB error:", err);
    return null;
  }
}

/**
 * Función de compatibilidad que devuelve solo el array de productos (como antes).
 * Útil si tienes código existente que espera SavedProduct[] | null.
 */
export async function loadCartProductsFromIDB(
  shopKey: string
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

/* Helpers */
function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Convierte un IDBRequest a Promise tipada.
 */
function reqToPromise<T>(req: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}
