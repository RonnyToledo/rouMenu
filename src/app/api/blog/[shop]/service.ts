import { supabase } from "@/lib/supabase";
import { Post } from "@/types/blog";

interface GetPostsOptions {
  page?: number; // Página actual (empieza en 1)
  limit?: number; // Cantidad de posts por página
}

interface GetPostsResult {
  posts: Post[] | null;
  total: number; // Total de posts (para calcular páginas)
  page: number;
  limit: number;
  totalPages: number;
  error: unknown | null;
}

export const BlogService = {
  async getPostsBySite(
    siteUUID: string,
    { page = 1, limit = 20 }: GetPostsOptions = {},
  ): Promise<GetPostsResult> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: posts,
      error,
      count,
    } = await supabase
      .from("blogs")
      .select("*, Sitios(name, tipo, Editor)", { count: "exact" })
      .eq("ui_store", siteUUID)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return { posts: null, total: 0, page, limit, totalPages: 0, error };
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return { posts, total, page, limit, totalPages, error: null };
  },
};
