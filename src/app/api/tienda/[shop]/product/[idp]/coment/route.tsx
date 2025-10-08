// app/api/products/[specific]/comment/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase";

// Define la forma esperada del comentario
interface ComentarioPayload {
  name: string;
  star: number;
  cmt?: string;
  // añade aquí otros campos que envíes en el JSON
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idp: string }> }
) {
  const supabase = createClient();
  const { idp } = await params;

  // 1. Parsear el body como JSON
  let comentario: ComentarioPayload;
  let user_id: string;
  try {
    const body = await request.json();
    comentario = body.comentario;
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

  // 2. Insertar en Supabase
  const { data: inserted, error } = await supabase
    .from("coment")
    .insert({ ...comentario, UIProduct: idp, user_id })
    .select("star")
    .single(); // devuelve los registros insertados

  if (error) {
    console.error("[Supabase Insert Error]", error);
    return NextResponse.json(
      { message: error.message || "Error al insertar comentario" },
      { status: 500 }
    );
  }

  // 3. Responder con el comentario insertado
  return NextResponse.json(
    {
      message: "Comentario realizado",
      value: inserted, // normalmente un array con el nuevo registro
    },
    { status: 201 }
  );
}
