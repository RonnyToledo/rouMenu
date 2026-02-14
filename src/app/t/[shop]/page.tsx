import React from "react";
import Products from "@/components/Catalogos/home/Products";
import { CatalogFooter } from "@/components/Catalogos/General/Footer";
import TestimonialCarouselDemo from "@/components/Catalogos/home/Testimonial";
import DrawerCart from "@/components/Catalogos/General/DrawerCart";

export default function page() {
  return (
    <div>
      <div className="grid grid-cols-1 ">
        <Products />
      </div>
      <DrawerCart />
      <TestimonialCarouselDemo />
      <CatalogFooter />
    </div>
  );
}
