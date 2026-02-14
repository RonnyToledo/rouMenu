import ContactoPage from "@/components/Explore/Contacto/Contacto";
import React from "react";

import { Metadata } from "next";
import { buildSiteMetadata } from "@/lib/siteMeta";

export async function generateMetadata(): Promise<Metadata> {
  // Ejemplo para la home:
  return await buildSiteMetadata({
    pageTitle: "Contacto",
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
  return <ContactoPage />;
}
