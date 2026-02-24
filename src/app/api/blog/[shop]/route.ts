import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BlogService } from "./service";

// GET /api/blog/[shop]?page=1&limit=20
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  const { shop } = await params;

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
    return NextResponse.json({ error: "Editor key required" }, { status: 401 });
  }

  // --- Query params ---
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100, // máximo permitido para evitar abusos
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
  );

  if (!shop) {
    return NextResponse.json(
      { error: "El parámetro 'shop' es requerido" },
      { status: 400 },
    );
  }

  // 1. Buscar el UUID del sitio
  const { data: uuid, error: siteError } = await supabase
    .from("Sitios")
    .select("UUID")
    .eq("sitioweb", shop)
    .eq("Editor", headerKey)
    .single();

  if (siteError || !uuid.UUID) {
    return NextResponse.json(
      { error: "Tienda no encontrada , XD" },
      { status: 404 },
    );
  }

  // 2. Obtener posts paginados
  const {
    posts,
    total,
    totalPages,
    error: postsError,
  } = await BlogService.getPostsBySite(uuid.UUID, { page, limit });

  if (postsError) {
    return NextResponse.json(
      { error: "Error al cargar los posts" },
      { status: 500 },
    );
  }

  // 3. Validar que la página pedida exista
  if (page > totalPages && totalPages > 0) {
    return NextResponse.json(
      { error: `La página ${page} no existe. Total de páginas: ${totalPages}` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    posts: posts ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
}
