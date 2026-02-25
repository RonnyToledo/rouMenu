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

  const posts = await getPostsFromDB({ limit: 50 });

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/info",
    "/services",
    "/blog",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((p): p is SitioRow & { sitioweb: string } => Boolean(p?.sitioweb))
    .map((post): MetadataRoute.Sitemap[number] => {
      const lastModified = post.updated ? new Date(post.updated) : undefined;
      return {
        url: `${baseUrl}/t/${encodeURIComponent(post.sitioweb)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

  return [...staticRoutes, ...postEntries];
}
