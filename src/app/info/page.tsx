import React from "react";
import HomePage from "@/components/Explore/Info/admin-catalog-content";

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

export default function DocsPage() {
  return <HomePage />;
}
