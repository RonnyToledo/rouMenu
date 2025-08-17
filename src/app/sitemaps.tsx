// app/sitemap.ts
import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

type SitioRow = {
  sitioweb: string | null;
  updated: string | null;
};

async function getPostsFromDB({ limit = 50 } = {}): Promise<SitioRow[]> {
  const { data, error } = await supabase
    .from("Sitios")
    .select("sitioweb, updated")
    .order("updated", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://roumenu.vercel.app";

  const posts = await getPostsFromDB({ limit: 20 });

  // Elemento home con tipo explícito
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily", // literal permitida
    priority: 1,
  };

  // Mapeamos posts, dando a cada objeto el tipo correcto MetadataRoute.Sitemap[number]
  const postEntries: MetadataRoute.Sitemap = posts
    .filter((p): p is SitioRow & { sitioweb: string } => Boolean(p?.sitioweb))
    .map((post): MetadataRoute.Sitemap[number] => {
      const lastModified = post.updated ? new Date(post.updated) : undefined; // Date | undefined ok
      return {
        url: `${baseUrl}/t/${encodeURIComponent(post.sitioweb)}`,
        lastModified,
        changeFrequency: "weekly", // EXACTAMENTE una de las literales válidas
        priority: 0.8,
      };
    });

  return [homeEntry, ...postEntries];
}
