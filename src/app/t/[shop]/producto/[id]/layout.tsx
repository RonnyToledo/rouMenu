import React from "react";
import { Metadata } from "next";
import { buildProductMetadata } from "@/lib/productMeta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string; id: string }>;
}): Promise<Metadata> {
  const { shop, id } = await params;
  // pasar opciones si quieres cambiar defaults (imageFallback, canonicalBase, etc.)
  const meta = await buildProductMetadata(shop, id, {
    siteName: "rouMenu",
    canonicalBase: "https://roumenu.vercel.app",
  });
  // si quieres inyectar jsonLd, devuelve meta y luego renderízalo en la página
  return meta;
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
