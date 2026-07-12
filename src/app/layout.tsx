import React from "react";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sileo";
import { GoogleAnalytics } from "@next/third-parties/google";
import Head from "next/head";
import Header from "@/components/home_UI/Home/Header";
import { createClient } from "@/lib/supabase";
import { logoApp } from "@/lib/image";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { buildSiteMetadata } from "@/lib/siteMeta";
import { AppProvider } from "@/context/AppContext";
import { findItemUrlByName } from "@/lib/items";
import { HomeContentData } from "@/types/HomeContentInterface";
import { NotificationWrapper } from "@/components/NotificationWrapper";
import { PushNotificationInitializer } from "@/components/PushNotificationInitializer";

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
    limit_catalogs: 50,
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
        <div className="flex justify-center bg-linear-to-br from-slate-50 to-slate-300 transition-colors duration-500">
          <div className="max-w-md w-full bg-white shadow-xl/30 min-h-dvh transition-colors duration-500">
            <AppProvider storeSSD={newData}>
              {/* Inicializa Web Push Notifications en background */}
              <PushNotificationInitializer autoRequest={false} debug={false} />

              {/* Sistema de notificaciones del navegador */}
              <NotificationWrapper
                autoRequestPermission={false}
                enableAutoMonitoring={false}
              />
              <Header>
                {children}
                <Toaster position="top-center" />
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

// 1) renombrado y tipado correcto: devuelve Promise<HomeContentData>
async function modifyData(data: HomeContentData): Promise<HomeContentData> {
  if (!data?.top_municipios || !Array.isArray(data.top_municipios)) return data;

  const top_provinces_with_image = await Promise.all(
    data.top_municipios.map(async (prov) => {
      const image = await findItemUrlByName(prov.municipio ?? "");
      return { ...prov, image: image || logoApp }; // coincide con types.app.ts
    }),
  );

  return { ...data, top_municipios: top_provinces_with_image };
}
