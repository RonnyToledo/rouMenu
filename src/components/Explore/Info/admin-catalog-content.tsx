"use client";
import React from "react";
import adminCatalogData from "@/components/Explore/Info/json/data.json";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const firstSection = adminCatalogData.sections[0];
  if (firstSection) router.push(`/info/${firstSection.slug}`);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-xl font-bold text-foreground mb-2">
          Administrador de Catálogos
        </h1>
        <p className="text-sm text-muted-foreground">Cargando contenido...</p>
      </div>
    </div>
  );
}
