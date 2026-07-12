import type { StoredContact } from "@/types/interfaces_Cart";

const storageKey = (sitioweb: string) => `${sitioweb}-informationCart`;

export function saveStoredCartContact(sitioweb: string, data: StoredContact) {
  try {
    window.localStorage.setItem(storageKey(sitioweb), JSON.stringify(data));
  } catch {
    // localStorage no disponible (SSR / modo privado) — no es crítico
  }
}

export function loadStoredCartContact(sitioweb: string): StoredContact {
  try {
    const saved = window.localStorage.getItem(storageKey(sitioweb));
    return saved ? JSON.parse(saved) : { nombre: "", phone: "" };
  } catch {
    return { nombre: "", phone: "" };
  }
}
