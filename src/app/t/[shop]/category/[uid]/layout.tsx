import React from "react";
import { supabase } from "@/lib/supabase";
import { logoApp } from "@/lib/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string; shop: string }>;
}) {
  try {
    const { uid, shop } = await params;
    const { data: product, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("id", uid)
      .single();

    if (error) {
      throw error;
    }

    if (!product) {
      return {
        title: "Sitio no encontrado",
        description: "No se encontró el sitio solicitado.",
      };
    }
    const { description, name, image } = product;

    return {
      title: `rouMenu | ${name} -> Categorias`,
      description: description || "",
      openGraph: {
        type: "website",
        locale: "es_ES", // Ajusta según el idioma de tu sitio
        url: `https://roumenu.vercel.app/t/${shop}/category/${uid}`, // URL de la página
        title: `rouMenu | ${name} -> Categorias`,
        description: description || "",
        images: [
          {
            url: image || logoApp,
            width: 1200,
            height: 630,
            alt: `${name} - Imagen de vista previa`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `rouMenu | ${name} -> Categorias`,
        description: description || "",
        images: [image || logoApp],
      },
    };
  } catch (error) {
    console.error("Error al obtener los datos del sitio:", error);
    return {
      title: "Error al cargar los metadatos",
      description: "Ocurrió un error al cargar la información del sitio.",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div> {children}</div>;
}
