import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { HistoryProvider } from "@/context/HistoryContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechStore Pro - Tu tienda de tecnología y más",
  description:
    "Encuentra los mejores productos de tecnología, ropa y hogar al mejor precio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className + " flex justify-center"}>
        <HistoryProvider>
          <div className=" max-w-xl w-full">
            {children}
            <Toaster />
          </div>
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ""}
          />
          <SpeedInsights />
        </HistoryProvider>
      </body>
    </html>
  );
}
