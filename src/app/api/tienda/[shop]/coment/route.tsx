import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import type { NextRequest } from "next/server";

// Tipamos el comentario si tienes una interfaz (opcional pero recomendado)
interface Comentario {
  name: string;
  star: number;
  cmt?: string;
  // puedes agregar más propiedades si tu estructura lo requiere
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  let comentario: Comentario;
  let uid: string;
  let user_id: string;

  try {
    const body = await request.json();
    comentario = body.comentario;
    uid = body.uid;
    user_id = body.uuid;
    if (typeof comentario !== "object" || typeof comentario.star !== "number") {
      throw new Error("Payload de comentario inválido");
    }
  } catch (err) {
    return NextResponse.json(
      { message: err || "JSON inválido" },
      { status: 400 }
    );
  }
  const { data: tienda, error } = await supabase
    .from("comentTienda")
    .insert({ ...comentario, UIStore: uid, user_id })
    .select("star")
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  return NextResponse.json({ message: "Producto creado", value: tienda });
}
