import React from "react";
import { CatalogFooter } from "@/components/Catalogos/General/Footer";
import Header from "@/components/Catalogos/General/Header";
import MyProvider from "@/context/MyContext";
import { AppState } from "@/context/InitialStatus";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Unavailable from "@/components/Catalogos/General/Unavailable";
import DrawerCart from "@/components/Catalogos/General/DrawerCart";

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
      title: `rouMenu | ${name}`,
      description: parrrafo,
      openGraph: {
        type: "website",
        locale: "es_ES", // Ajusta según el idioma de tu sitio
        url: `https://roumenu.vercel.app/t/${shop}`, // URL de la página
        title: `rouMenu | ${name}`,
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
        title: `rouMenu | ${name}`,
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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;

  const { data: storeOne, error } = await supabase.rpc(
    "get_store_with_transform",
    { tienda_slug: shop }
  );

  let store = trasnformData(storeOne);
  if (typeof storeOne.edit == "string") {
    store = trasnformData({ ...storeOne, edit: JSON.parse(storeOne.edit) });
  }
  if (error) {
    console.error("Error al obtener tienda:", error);
  } else {
    console.info("Store listo");
  }
  if (!store.sitioweb) notFound();
  console.log(store);

  if (!storeOne.active) return <Unavailable />;
  return (
    <div>
      <MyProvider storeSSD={store}>
        <Header />
        <div className="min-h-[80vh]">{children}</div>
        <DrawerCart />
        <CatalogFooter />
      </MyProvider>
    </div>
  );
}
function trasnformData(store: AppState): AppState {
  return {
    ...store,

    products: store.products.map((obj) => ({
      ...obj,
      Cant: 0,
      comparar: false,
    })),
    envios:
      (store.envios || [])?.map((env) => ({
        ...env,
        municipios: env.municipios.map((m) => ({
          ...m,
          price: Number(m.price),
        })),
      })) ?? [],
  };
}
