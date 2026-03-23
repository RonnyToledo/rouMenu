// UploadPedido.ts
import { supabase } from "@/lib/supabase";
import type { UploadCompraInterface } from "./CarritoPage";

// ─── Tipos del payload mínimo que se guarda en DB ─────────────────────────────
// Solo los campos que el negocio necesita leer luego.
// NO guarda: descripcion del producto, imagesecondary, caracteristicas,
// creado, modified, storeId, visitas, favorito, comparar, coment...

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
  agregados: AgregadoMinimo[];
}

interface AgregadoMinimo {
  id: string;
  name: string;
  price: number;
  cant: number;
}

// Extrae solo los campos necesarios de cada producto del carrito
function minimizarPedido(
  pedido: UploadCompraInterface["desc"]["pedido"],
): PedidoItemMinimo[] {
  return pedido.map((p) => ({
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
    agregados: (p.agregados ?? [])
      .filter((a) => a.cant > 0)
      .map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price ?? 0,
        cant: a.cant,
      })),
  }));
}

export async function UploadPedido(dato: UploadCompraInterface) {
  // Construir el desc con el pedido minimizado
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
    // Solo los campos mínimos de cada producto
    pedido: minimizarPedido(dato.desc.pedido),
  };

  const params = {
    p_uid: dato.UUID_Shop,
    p_events: dato.events,
    p_desc: descMinimo, // objeto JS → Supabase lo convierte a JSONB
    p_uid_venta: dato.uid,
    p_nombre: dato.nombre,
    p_phonenumber: Number(dato.phonenumber) || 0,
    p_descripcion: dato.descripcion,
    p_created_at: dato.date,
    p_user: dato.user_id,
  };

  const { data, error } = await supabase.rpc("create_order_event", params);
  if (error) throw new Error(error.message);

  return data as { event_id: number; uid_venta: string };
}
