import { createClient } from "@/lib/supabase";
import { UploadCompraInterface } from "./CarritoPage";

export async function UploadPedido(dato: UploadCompraInterface) {
  const supabase = createClient();

  const { error } = await supabase
    .from("Events")
    .insert({
      uid: dato.UUID_Shop,
      events: dato.events,
      created_at: dato.date,
      descripcion: dato.descripcion,
      desc: dato.desc,
      UID_Venta: dato.uid,
      nombre: dato.nombre,
      phonenumber: dato.phonenumber,
    })
    .select();
  console.info("Tarea lista");
  if (error) console.error(error);
}
