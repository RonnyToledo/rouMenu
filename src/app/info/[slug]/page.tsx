import React from "react";
import { DynamicPageContent } from "@/components/Explore/Info/dynamic-page-content";
import adminCatalogData from "@/components/Explore/Info/json/data.json";
import { DataInterface } from "@/components/Explore/Info/json/interfaceTsx";

import { Metadata } from "next";
import { buildSiteMetadata } from "@/lib/siteMeta";

export async function generateMetadata(): Promise<Metadata> {
  // Ejemplo para la home:
  return await buildSiteMetadata({
    pageTitle: "Informacion",
    description: "rouMenu — Catálogos digitales para tu negocio.",
    image: "/og/home.png",
    url: "https://roumenu.vercel.app",
    path: "/", // opcional
    locale: "es_ES",
    language: "es-ES",
    twitterHandle: "@roumenu",
  });
}

export default function DynamicPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DynamicPageContent
          allData={adminCatalogData as unknown as DataInterface}
        />
      </div>
    </div>
  );
}
