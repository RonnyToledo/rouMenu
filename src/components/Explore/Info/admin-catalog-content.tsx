"use client";
import React from "react";
import adminCatalogData from "@/components/Explore/Info/json/data.json";
import { useRouter } from "next/navigation";

export default function HomePage() {
  // Redirect to the first section
  const router = useRouter();
  const firstSection = adminCatalogData.sections[0];
  if (firstSection) {
    router.push(`/info/${firstSection.slug}`);
  }

  // Fallback if no sections exist
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 dark:text-slate-100">
          Administrador de Catálogos
        </h1>
        <p className="text-muted-foreground dark:text-slate-400">
          Cargando contenido...
        </p>
      </div>
    </div>
  );
}
