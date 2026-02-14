import React from "react";
import BusquedaPage from "@/components/Explore/Search/SearchPage";

import { Metadata } from "next";
import { buildSiteMetadata } from "@/lib/siteMeta";

export async function generateMetadata(): Promise<Metadata> {
  // Ejemplo para la home:
  return await buildSiteMetadata({
    pageTitle: "Buscar",
    description: "rouMenu — Catálogos digitales para tu negocio.",
    image: "/og/home.png",
    url: "https://roumenu.vercel.app",
    path: "/", // opcional
    locale: "es_ES",
    language: "es-ES",
    twitterHandle: "@roumenu",
  });
}

export default function page() {
  return <BusquedaPage />;
}
