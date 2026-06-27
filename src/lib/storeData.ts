import { supabase } from "@/lib/supabase";
import { AppState, Product } from "@/types/InitialStatus";

function parseJsonArray<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function parseCaracteristicas(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  if (typeof value !== "string" || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed.filter(Boolean) as string[]) : [];
  } catch {
    return value
      .replace(/[{}"]/g, "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizeProductPayload(payload: unknown): Product | null {
  if (!payload || typeof payload !== "object") return null;
  const item = payload as Record<string, unknown>;

  const selectedVariant =
    item.selected_variant && typeof item.selected_variant === "object"
      ? {
          ...(item.selected_variant as Record<string, unknown>),
          price: Number(
            (item.selected_variant as Record<string, unknown>).price ?? 0,
          ),
          oldPrice: Number(
            (item.selected_variant as Record<string, unknown>).oldPrice ?? 0,
          ),
          stock: Number(
            (item.selected_variant as Record<string, unknown>).stock ?? 0,
          ),
          embalaje: Number(
            (item.selected_variant as Record<string, unknown>).embalaje ?? 0,
          ),
          quantity_discounts: parseJsonArray(
            (item.selected_variant as Record<string, unknown>)
              .quantity_discounts,
            [],
          ),
        }
      : {
          id: "",
          label: "",
          attributes: { es_default: true },
          price: 0,
          oldPrice: 0,
          stock: 0,
          image: null,
          default_variant: true,
          default: true,
          embalaje: 0,
          quantity_discounts: [],
        };

  const variants = parseJsonArray(item.variants, []).map(
    (variant: Record<string, unknown>) => ({
      ...variant,
      price: Number(variant.price ?? 0),
      oldPrice: Number(variant.oldPrice ?? 0),
      stock: Number(variant.stock ?? 0),
      embalaje: Number(variant.embalaje ?? 0),
      quantity_discounts: parseJsonArray(variant.quantity_discounts, []),
    }),
  );

  return {
    ...item,
    id: Number(item.id ?? 0),
    productId: typeof item.productId === "string" ? item.productId : "",
    title: typeof item.title === "string" ? item.title : "",
    descripcion: typeof item.descripcion === "string" ? item.descripcion : "",
    caja: typeof item.caja === "string" ? item.caja : "",
    creado: typeof item.creado === "string" ? item.creado : "",
    visible: Boolean(item.visible),
    comparar: Boolean(item.comparar),
    caracteristicas: parseCaracteristicas(item.caracteristicas),
    order: Number(item.order ?? 0),
    visitas: Number(item.visitas ?? 0),
    venta: Boolean(item.venta),
    default_moneda: Number(item.default_moneda ?? 0),
    favorito: Boolean(item.favorito),
    variants_count: Number(item.variants_count ?? variants.length),
    coment:
      item.coment && typeof item.coment === "object"
        ? {
            promedio: Number(
              (item.coment as Record<string, unknown>).promedio ?? 0,
            ),
            total: Number((item.coment as Record<string, unknown>).total ?? 0),
            porEstrellas: ((item.coment as Record<string, unknown>)
              .porEstrellas as Product["coment"]["porEstrellas"]) ?? {
              "0": 0,
              "1": 0,
              "2": 0,
              "3": 0,
              "4": 0,
              "5": 0,
            },
          }
        : {
            promedio: 0,
            total: 0,
            porEstrellas: {
              "0": 0,
              "1": 0,
              "2": 0,
              "3": 0,
              "4": 0,
              "5": 0,
            },
          },
    selected_variant: selectedVariant,
    variants,
  } as unknown as Product;
}

function normalizeStorePayload(payload: unknown): AppState | null {
  if (!payload || typeof payload !== "object") return null;
  const store = payload as Record<string, unknown>;
  const products = Array.isArray(store.products) ? store.products : [];

  return {
    ...store,
    id: Number(store.id ?? 0),
    parrrafo: typeof store.parrrafo === "string" ? store.parrrafo : "",
    UUID: typeof store.UUID === "string" ? store.UUID : "",
    sitioweb: typeof store.sitioweb === "string" ? store.sitioweb : "",
    name: typeof store.name === "string" ? store.name : "",
    banner: typeof store.banner === "string" ? store.banner : "",
    marketing: Boolean(store.marketing),
    direccion: typeof store.direccion === "string" ? store.direccion : "",
    tipo: typeof store.tipo === "string" ? store.tipo : "",
    urlPoster: typeof store.urlPoster === "string" ? store.urlPoster : "",
    insta: typeof store.insta === "string" ? store.insta : "",
    limite: Number(store.limite ?? 0),
    Provincia: typeof store.Provincia === "string" ? store.Provincia : "",
    domicilio: Boolean(store.domicilio),
    act_tf: Boolean(store.act_tf),
    Editor: typeof store.Editor === "string" ? store.Editor : "",
    country: typeof store.country === "string" ? store.country : "",
    cell: Number(store.cell ?? 0),
    CodePromo: Boolean(store.CodePromo),
    color: typeof store.color === "string" ? store.color : "",
    login: Boolean(store.login),
    local: Boolean(store.local),
    active: Boolean(store.active),
    history: typeof store.history === "string" ? store.history : "",
    carrito: Boolean(store.carrito),
    created_at:
      typeof store.created_at === "string"
        ? store.created_at
        : new Date().toISOString(),
    email: typeof store.email === "string" ? store.email : "",
    municipio: typeof store.municipio === "string" ? store.municipio : "",
    visitas: Number(store.visitas ?? 0),
    stocks: Boolean(store.stocks),
    productEnStock:
      typeof store.productEnStock === "string" ? store.productEnStock : "",
    afiliate: "",
    reservas: false,
    font: "Inter",
    compraUUID: "",
    ubicacion:
      store.ubicacion && typeof store.ubicacion === "object"
        ? (store.ubicacion as AppState["ubicacion"])
        : undefined,
    edit:
      store.edit && typeof store.edit === "object"
        ? (store.edit as AppState["edit"])
        : {
            grid: true,
            square: false,
            horizontal: false,
            minimalista: false,
          },
    contacto: parseJsonArray(store.contacto, []),
    redes: parseJsonArray(store.redes, []),
    estadoHorario:
      store.estadoHorario && typeof store.estadoHorario === "object"
        ? (store.estadoHorario as AppState["estadoHorario"])
        : undefined,
    horario: parseJsonArray(store.horario, []),
    envios: parseJsonArray(store.envios, []).map(
      (env: Record<string, unknown>) => ({
        ...env,
        precio: Number(env?.precio ?? 0),
      }),
    ),
    moneda: parseJsonArray(store.moneda, []),
    categorias: parseJsonArray(store.categorias, []),
    codeDiscount: parseJsonArray(store.codeDiscount, []),
    comentTienda:
      store.comentTienda && typeof store.comentTienda === "object"
        ? {
            promedio: Number(
              (store.comentTienda as Record<string, unknown>).promedio ?? 0,
            ),
            total: Number(
              (store.comentTienda as Record<string, unknown>).total ?? 0,
            ),
            porEstrellas: ((store.comentTienda as Record<string, unknown>)
              .porEstrellas as AppState["comentTienda"]["porEstrellas"]) ?? {
              "0": 0,
              "1": 0,
              "2": 0,
              "3": 0,
              "4": 0,
              "5": 0,
            },
            data: parseJsonArray(
              (store.comentTienda as Record<string, unknown>).data,
              [],
            ),
          }
        : {
            promedio: 0,
            total: 0,
            porEstrellas: { "0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
            data: [],
          },
    products: products
      .map((product) => normalizeProductPayload(product))
      .filter((product): product is Product => product !== null),
  } as unknown as AppState;
}

export async function getStoreShell(shop: string): Promise<AppState | null> {
  const { data, error } = await supabase.rpc("get_store_shell", {
    tienda_slug: shop,
  });

  if (error || !data) {
    console.error("getStoreShell RPC error:", error);
    return null;
  }

  return normalizeStorePayload(data);
}

export async function getProductDetail(
  shop: string,
  productId: string,
): Promise<Product | null> {
  const { data, error } = await supabase.rpc("get_product_detail", {
    tienda_slug: shop,
    product_id: productId,
  });

  if (error || !data) {
    console.error("getProductDetail RPC error:", error);
    return null;
  }

  return normalizeProductPayload(data);
}
