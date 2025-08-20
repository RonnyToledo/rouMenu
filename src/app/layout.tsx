import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { HistoryProvider } from "@/context/HistoryContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";
import Header from "@/components/Explore/General/Header";
import { supabase } from "@/lib/supabase";
import GeneralProvider from "@/context/GeneralContext";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "TechStore Pro - Tu tienda de tecnología y más",
  description:
    "Encuentra los mejores productos de tecnología, ropa y hogar al mejor precio",
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
  return (
    <html lang="es">
      <Head>
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_VERIFI}
        />
      </Head>
      <body className={inter.className + " flex justify-center"}>
        <HistoryProvider>
          <GeneralProvider storeSSD={data}>
            <Header>
              <div className=" max-w-xl w-full">
                {children}
                <Toaster />
              </div>
            </Header>
          </GeneralProvider>
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""}
          />
          <SpeedInsights />
        </HistoryProvider>
      </body>
    </html>
  );
}
