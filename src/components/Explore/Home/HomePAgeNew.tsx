"use client";
import React from "react";
import type { Metadata } from "next";
import { useApp } from "@/context/AppContext";
import Footer from "./NewModelHome/Footer";
import HeroSection from "./NewModelHome/HeroSection";
import FeaturedOffersSection from "./NewModelHome/FeaturedOffersSection";
import TopCatalogsSection from "./NewModelHome/TopCatalogsSection";
import SuggestionsSection from "./NewModelHome/SuggestionsSection";
import CTASection from "./NewModelHome/CTASection";
import {
  HeroItem,
  HomeCatalogItem,
  ProductItem,
  TopPostItem,
} from "@/types/HomeContentInterface";

export const metadata: Metadata = {
  title: "RouMenu — Ofertas y Catálogos de Venta ",
  description:
    "Descubre los mejores catálogos de venta . Ofertas destacadas, productos sugeridos y los catálogos más populares del mercado cubano.",
  alternates: { canonical: "/homepage" },
  openGraph: {
    title: "RouMenu — Ofertas y Catálogos de Venta",
    description: "Los mejores catálogos de venta del mercado.",
    images: [{ url: "/assets/images/app_logo.png", width: 1200, height: 630 }],
  },
};

export default function HomepagePage() {
  const { generalData: data } = useApp();
  console.log(data);
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <main>
        <HeroSection
          hero={(data?.hero ?? []) as HeroItem[]}
          catalogs={(data?.catalogs ?? []) as HomeCatalogItem[]}
        />
        <div className="section-divider" />
        <FeaturedOffersSection
          products={(data?.products ?? []) as ProductItem[]}
          top_posts={(data?.top_posts ?? []) as TopPostItem[]}
        />
        <div className="section-divider" />
        <TopCatalogsSection
          catalogs={(data?.catalogs ?? []) as HomeCatalogItem[]}
        />
        <div className="section-divider" />
        <SuggestionsSection
          products={data?.products ?? ([] as ProductItem[])}
        />
        <div className="section-divider" />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
