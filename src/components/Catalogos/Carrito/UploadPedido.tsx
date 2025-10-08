// UploadPedido.ts (TypeScript)
import { createClient } from "@/lib/supabase";
import type { UploadCompraInterface } from "./CarritoPage";

export async function UploadPedido(dato: UploadCompraInterface) {
  const supabase = createClient();

  const params = {
    p_uid: dato.UUID_Shop,
    p_events: dato.events,
    p_desc: dato.desc, // objeto JS -> supabase lo pasará como jsonb
    p_uid_venta: dato.uid,
    p_nombre: dato.nombre,
    p_phonenumber: Number(dato.phonenumber) || 0,
    p_descripcion: dato.descripcion,
    p_created_at: dato.date,
    p_user: dato.user_id,
  };

  const { data, error } = await supabase.rpc("create_order_event", params);
  if (error) throw new Error(error.message);

  return data;
}
