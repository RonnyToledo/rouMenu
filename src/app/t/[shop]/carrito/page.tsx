import React from "react";
import CarritoPage from "@/components/Catalogos/Carrito/CarritoPage";
import { supabase } from "@/lib/supabase";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  try {
    const { shop } = await params;
    const { data: product, error } = await supabase
      .from("Sitios")
      .select("*")
      .eq("sitioweb", shop)
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
    const { name, parrrafo, urlPoster } = product;

    return {
      title: `rouMenu | ${name} -> Carrito`,
      description: parrrafo,
      openGraph: {
        type: "website",
        locale: "es_ES", // Ajusta según el idioma de tu sitio
        url: `https://randh-menu.vercel.app/t/${shop}`, // URL de la página
        title: `rouMenu | ${name} -> Carrito`,
        description: parrrafo,
        images: [
          {
            url:
              urlPoster ||
              "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg",
            width: 1200,
            height: 630,
            alt: `${name} - Imagen de vista previa`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `rouMenu | ${name} -> Carrito`,
        description: parrrafo,
        images: [
          urlPoster ||
            "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg",
        ],
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
export default function page() {
  return (
    <div>
      <CarritoPage />
    </div>
  );
}
