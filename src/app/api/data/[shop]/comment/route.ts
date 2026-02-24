// app/api/reviews/[shop]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  try {
    const { shop } = await params;

    // --- Extraer x-editor-key o fallback Bearer token ---
    const headerKey =
      request.headers.get("x-editor-key") ??
      (() => {
        const auth = request.headers.get("authorization");
        if (!auth) return null;
        const parts = auth.split(" ");
        return parts.length === 2 && parts[0].toLowerCase() === "bearer"
          ? parts[1]
          : auth;
      })();

    if (!headerKey) {
      return NextResponse.json(
        { error: "Editor key required" },
        { status: 401 },
      );
    }

    // Si la variable EDITOR_KEY está definida en el servidor, exigir coincidencia
    if (!headerKey) {
      return NextResponse.json(
        { error: "Invalid editor key" },
        { status: 403 },
      );
    }

    // --- Query params ---
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)),
    ); // límite máximo 100
    const filter = (searchParams.get("filter") ?? "all").toLowerCase(); // all | positive | negative

    if (!shop) {
      return NextResponse.json(
        { error: "El parámetro 'shop' es requerido" },
        { status: 400 },
      );
    }

    // 1) Obtener UUID del sitio por sitioweb
    const { data: siteData, error: siteError } = await supabase
      .from("Sitios")
      .select("UUID")
      .eq("sitioweb", shop)
      .eq("Editor", headerKey)
      .single();

    if (siteError || !siteData?.UUID) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 },
      );
    }

    const storeUUID: string = siteData.UUID;

    // 2) Preparar paginación
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // 3) Construir query a comentTienda
    let query = supabase
      .from("comentTienda")
      .select("*, user(*), replies(*, user(*))", { count: "exact" })
      .eq("UIStore", storeUUID)
      .order("created_at", { ascending: false })
      .range(start, end);

    if (filter === "positive") query = query.gte("star", 3);
    else if (filter === "negative") query = query.lt("star", 2);

    const { data: comments, count, error: commentsError } = await query;

    if (commentsError) {
      console.error("Supabase comments error:", commentsError);
      return NextResponse.json(
        { error: "Error al consultar comentarios" },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // 4) Responder
    return NextResponse.json({
      data: comments ?? [],
      count: total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("API error /api/reviews/[shop]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
