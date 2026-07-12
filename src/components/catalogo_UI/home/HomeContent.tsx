"use client";

import React from "react";
import HeroSelector from "@/components/catalogo_UI/home/HeroSelector";
import Products from "./ProductUI/Products";
import { CategoryStories } from "./ProductUI/CategoryStories";
import { CatalogFooter } from "@/components/catalogo_UI/General/Footer";
import TestimonialCarouselDemo from "@/components/catalogo_UI/home/Testimonial";
import BlogCarousel from "./BlogCarousel";
import { MyContext } from "@/context/MyContext";

export default function HomeContent() {
  const { store } = React.useContext(MyContext);
  return (
    <main>
      {/* Hero + categorías: se colapsan cuando hay resultados activos */}
      <div className="transition-[max-height,opacity] duration-300 ease-out overflow-hidden p-2">
        <HeroSelector />
        <CategoryStories />
      </div>

      <Products />
      {store.blogs && store.blogs.length > 0 ? (
        <BlogCarousel />
      ) : (
        <TestimonialCarouselDemo />
      )}
      <CatalogFooter />
    </main>
  );
}
