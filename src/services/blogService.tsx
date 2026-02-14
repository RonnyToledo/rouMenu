import { supabase } from "@/lib/supabase";
import { Post } from "@/types/blog";

// Query base reutilizable
const BASE_BLOG_QUERY = "*, Sitios(sitioweb, name, tipo, urlPoster)";

export class BlogService {
  /**
   * Obtiene todos los posts con paginación opcional
   */
  static async getAllPosts(options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ posts: Post[]; error: Error | null }> {
    let query = supabase
      .from("blogs")
      .select(BASE_BLOG_QUERY)
      .order("created_at", { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      return { posts: [], error };
    }

    return { posts: data || [], error: null };
  }

  /**
   * Obtiene un post por slug
   */
  static async getPostBySlug(
    slug: string
  ): Promise<{ post: Post | null; error: Error | null }> {
    const { data, error } = await supabase
      .from("blogs")
      .select(BASE_BLOG_QUERY)
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching post with slug ${slug}:`, error);
      return { post: null, error };
    }

    return { post: data, error: null };
  }

  /**
   * Obtiene posts por sitio
   */
  static async getPostsBySite(
    siteId: string
  ): Promise<{ posts: Post[]; error: Error | null }> {
    const { data, error } = await supabase
      .from("blogs")
      .select(BASE_BLOG_QUERY)
      .eq("ui_store", siteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching posts for site ${siteId}:`, error);
      return { posts: [], error };
    }

    return { posts: data || [], error: null };
  }

  /**
   * Obtiene todos los slugs para generateStaticParams
   */
  static async getAllSlugs(): Promise<string[]> {
    const { data, error } = await supabase.from("blogs").select("slug");

    if (error) {
      console.error("Error fetching slugs:", error);
      return [];
    }

    return data?.map((post) => post.slug) || [];
  }
}
