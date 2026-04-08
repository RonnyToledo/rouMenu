// UploadPedido.ts
import { supabase } from "@/lib/supabase";
import type { UploadCompraInterface } from "./CarritoPage";

interface PedidoItemMinimo {
  id: number;
  productId: string;
  title: string;
  image: string;
  price: number;
  embalaje: number;
  priceCompra: number;
  Cant: number;
  stock: number;
  default_moneda: number;
  caja: string;
  /**
   * Datos de la variante seleccionada (solo si no es la default).
   * Incluye attributes para que el negocio pueda leer
   * qué combinación pidió el cliente: { color: "Rojo", talla: "M" }
   */
  selected_variant?: {
    id: string;
    label: string;
    price?: number | null;
    oldPrice?: number | null;
    stock?: number | null;
    attributes?: Record<string, string | number | boolean>;
  };
  agregados: AgregadoMinimo[];
}

interface AgregadoMinimo {
  id: string;
  name: string;
  price: number;
  cant: number;
}

// Claves internas que no aportan info al negocio
const INTERNAL_ATTR_KEYS = new Set(["tipo", "es_default"]);

function minimizarPedido(
  pedido: UploadCompraInterface["desc"]["pedido"],
): PedidoItemMinimo[] {
  return pedido.map((p) => {
    const variant = p.selected_variant;

    // Solo incluir variante si no es la default
    const variantMinimo =
      variant && !variant.default
        ? {
            id: variant.id,
            label: variant.label,
            price: variant.price,
            oldPrice: variant.oldPrice,
            stock: variant.stock,
            // Filtrar claves internas de attributes antes de guardar
            ...(variant.attributes
              ? {
                  attributes: Object.fromEntries(
                    Object.entries(variant.attributes).filter(
                      ([k]) => !INTERNAL_ATTR_KEYS.has(k),
                    ),
                  ),
                }
              : {}),
          }
        : undefined;

    return {
      id: p.id,
      productId: p.productId,
      title: p.title,
      image: p.image || "",
      price: p.price ?? 0,
      embalaje: p.embalaje ?? 0,
      priceCompra: p.priceCompra ?? 0,
      Cant: p.Cant ?? 0,
      stock: p.stock ?? 0,
      default_moneda: p.default_moneda,
      caja: p.caja || "",
      ...(variantMinimo ? { selected_variant: variantMinimo } : {}),
      agregados: (p.agregados ?? [])
        .filter((a) => a.cant > 0)
        .map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price ?? 0,
          cant: a.cant,
        })),
    };
  });
}

export async function UploadPedido(dato: UploadCompraInterface) {
  const descMinimo = {
    pago: dato.desc.pago,
    lugar: dato.desc.lugar,
    total: dato.desc.total,
    moneda: dato.desc.moneda,
    shipping: dato.desc.shipping,
    direccion: dato.desc.direccion,
    descripcion: dato.desc.descripcion,
    phonenumber: dato.desc.phonenumber,
    people: dato.desc.people,
    code: {
      name: dato.desc.code.name,
      discount: dato.desc.code.discount,
    },
    pedido: minimizarPedido(dato.desc.pedido),
  };

  const params = {
    p_uid: dato.UUID_Shop,
    p_events: dato.events,
    p_desc: descMinimo,
    p_uid_venta: dato.uid,
    p_nombre: dato.nombre,
    p_phonenumber: Number(dato.phonenumber) || 0,
    p_descripcion: dato.descripcion,
    p_created_at: dato.date,
    p_user: dato.user_id,
  };

  const { data, error } = await supabase.rpc("create_order_event", params);
  if (error) throw new Error(error.message);
  console.log(data);
  return data as { event_id: number; uid_venta: string };
}
