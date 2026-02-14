import React from "react";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import Head from "next/head";
import Header from "@/components/Explore/Home/Header";
import { createClient } from "@/lib/supabase";
import { logoApp } from "@/lib/image";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { buildSiteMetadata } from "@/lib/siteMeta";
import { AppProvider, AppState } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  // Ejemplo para la home:
  return await buildSiteMetadata({
    pageTitle: "Home",
    description: "rouMenu — Catálogos digitales para tu negocio.",
    image: "/og/home.png",
    url: "https://roumenu.vercel.app",
    path: "/", // opcional
    locale: "es_ES",
    language: "es-ES",
    twitterHandle: "@roumenu",
  });
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, error } = await createClient().rpc("get_home_content", {
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
          content="20d-mYG2Ay0CgmdMKXvYaKBDnuzB1ESMlAYH5CfBpzA"
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
        <div className="flex justify-center bg-linear-to-br from-slate-50 to-slate-300">
          <div className="max-w-md w-full bg-white shadow-xl/30 min-h-dvh">
            <AppProvider storeSSD={newData}>
              <Header>
                {children}
                <Toaster richColors position="top-center" />
              </Header>
            </AppProvider>
          </div>
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
    }),
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
