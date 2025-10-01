// UploadPedido.ts (TypeScript)
import { createClient } from "@/lib/supabase";
import type { UploadCompraInterface } from "./CarritoPage";

export async function UploadPedido(dato: UploadCompraInterface) {
  const supabase = createClient();
  // Si antes hacías JSON.stringify(compra) ahora envía el objeto JS directamente
  // p_desc debe ser jsonb; supabase lo convertirá automáticamente
  // asegúrate de que dato.desc sea un objeto (no string)
  const safeDesc =
    typeof dato.desc === "string" ? JSON.parse(dato.desc) : dato.desc;

  const params = {
    p_uid: dato.UUID_Shop,
    p_events: dato.events,
    p_desc: safeDesc, // objeto JS -> supabase lo pasará como jsonb
    p_uid_venta: dato.uid,
    p_nombre: dato.nombre,
    p_phonenumber: Number(dato.phonenumber) || 0,
    p_descripcion: dato.descripcion,
    p_created_at: dato.date,
  };

  const { data, error } = await supabase.rpc("create_order_event", params);
  if (error) throw new Error(error.message);

  return data;
}
