// app/api/comments/[product]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ product: string; shop: string }> },
) {
  try {
    const { product } = await params;

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

    // Si EDITOR_KEY existe, exigir coincidencia
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

    if (!product) {
      return NextResponse.json(
        { error: "El parámetro 'product' es requerido" },
        { status: 400 },
      );
    }

    // 1) (Opcional) verificar que el producto exista — esto hace la respuesta más explícita
    const { data: productData, error: productError } = await supabase
      .from("Products")
      .select("productId,Sitios(Editor)")
      .eq("productId", product)
      .single();

    const sitioEditor = Array.isArray(productData?.Sitios)
      ? (productData?.Sitios?.[0] as { Editor: string })?.Editor
      : (productData?.Sitios as unknown as { Editor: string })?.Editor;

    if (sitioEditor !== headerKey) {
      return NextResponse.json({ error: "Error Key" }, { status: 404 });
    }

    if (productError || !productData?.productId) {
      // Si no existe el producto devolvemos 404
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // 2) Paginación
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // 3) Query a la tabla `coment` y relaciones `user` y `replies_coment`
    let query = supabase
      .from("coment")
      .select("*, user(*), replies_coment(*, user(*))", { count: "exact" })
      .eq("UIProduct", product)
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
    console.error("API error /api/comments/[product]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
