// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api"], // ajusta según tu caso
      },
    ],
    sitemap: "https://roumenu.vercel.app/sitemap.xml",
  };
}
