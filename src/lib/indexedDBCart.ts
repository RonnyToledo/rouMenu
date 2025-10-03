// src/lib/indexedDBCart.ts
// Utilidades simples y seguras para usar IndexedDB (no depende de librerías externas)

export type IDBCartEntry = {
  key: string; // ej: cart_mitienda
  value: any; // guardamos el array serializado (objetos JS)
};

const DB_NAME = "roudev_cart_db";
const DB_VERSION = 1;
const STORE_NAME = "carts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
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

export async function saveCartToIDB(
  shopKey: string,
  cartData: any[]
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const entry: IDBCartEntry = { key: `cart_${shopKey}`, value: cartData };
    store.put(entry);
    await txComplete(tx);
    db.close();
  } catch (err) {
    console.error("saveCartToIDB error:", err);
    throw err;
  }
}

export async function loadCartFromIDB(shopKey: string): Promise<any[] | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(`cart_${shopKey}`);
    const value = await reqToPromise(req);
    await txComplete(tx);
    db.close();
    return value ? value.value : null;
  } catch (err) {
    console.error("loadCartFromIDB error:", err);
    return null;
  }
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

function reqToPromise<T = any>(req: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
