import React from "react";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import Head from "next/head";
import Header from "@/components/Explore/Home/Header";
import { supabase } from "@/lib/supabase";
import GeneralProvider, { AppState } from "@/context/GeneralContext";
import { logoApp } from "@/lib/image";
import { HistoryProvider } from "@/context/HistoryContext";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "RouMenu by RouDev",
  description: "Encuentra los mejores productos a solo un click de distancia",
  openGraph: {
    type: "website",
    locale: "es_ES", // Ajusta según el idioma de tu sitio
    url: `https://roumenu.vercel.app`, // URL de la página
    title: `rouMenu `,
    description: "Encuentra los mejores productos a solo un click de distancia",
    images: [
      {
        url: "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg",
        width: 1200,
        height: 630,
        alt: `Imagen de vista previa`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `rouMenu`,
    description: "Encuentra los mejores productos a solo un click de distancia",
    images: [
      "https://res.cloudinary.com/dbgnyc842/image/upload/v1721753647/kiphxzqvoa66wisrc1qf.jpg",
    ],
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, error } = await supabase.rpc("get_home_content", {
    limit_sites: 4,
    limit_products: 6,
    cat_limit: 4,
  });

  if (error) {
    console.error("RPC error", error);
    throw error;
  }

  if (!data) {
    // Manejo si la RPC devolvió null
    throw new Error("No data returned from get_home_content");
  }

  // newData será AppState ya resuelto
  const newData = await modifyData(data);
  const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALITYCS;

  return (
    <html lang="es">
      <Head>
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_VERIFI}
        />
      </Head>

      {/* gtag: colocar Scripts en el layout (strategy afterInteractive) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
      <body className={inter.className}>
        <div className=" flex justify-center bg-gray-200">
          <HistoryProvider>
            <div className=" max-w-md w-full bg-white">
              <GeneralProvider storeSSD={newData}>
                <Header>
                  {children}
                  <Toaster richColors position="top-center" />
                </Header>
              </GeneralProvider>
            </div>
          </HistoryProvider>
        </div>
        <GoogleAnalytics gaId={GA_ID || ""} />
        <Analytics />
      </body>
    </html>
  );
}

// 1) renombrado y tipado correcto: devuelve Promise<AppState>
async function modifyData(data: AppState): Promise<AppState> {
  if (!data?.top_provinces || !Array.isArray(data.top_provinces)) return data;

  const top_provinces_with_image = await Promise.all(
    data.top_provinces.map(async (prov) => {
      const image = await fetchUrlByName(prov.provincia ?? "");
      return { ...prov, image: image || logoApp }; // coincide con types.app.ts
    })
  );

  return { ...data, top_provinces: top_provinces_with_image };
}

// 3) fetch con URL absoluta (usar env var NEXT_PUBLIC_APP_URL o fallback local)
async function fetchUrlByName(name: string): Promise<string | null> {
  if (!name) return null;

  // Asegúrate de definir NEXT_PUBLIC_APP_URL en producción (ej. https://mi-dominio.com)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${base}/api/images?name=${encodeURIComponent(name)}`;

  try {
    const res = await fetch(url, { cache: "no-store" }); // en server componentes ok
    if (!res.ok) {
      console.warn("fetchUrlByName: non-ok response", res.status);
      return null;
    }
    // asumimos que la API devuelve directamente la URL como JSON (p. ej. "https://...")
    const data = await res.json();
    // si tu API devuelve { url: '...' } ajusta aquí
    return typeof data === "string" ? data : (data?.url ?? null);
  } catch (err) {
    console.error("fetchUrlByName error:", err);
    return null;
  }
}
