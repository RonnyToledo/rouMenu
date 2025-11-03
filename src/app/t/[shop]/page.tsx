import React from "react";
import Products from "@/components/Catalogos/home/Products";
import HeroNew from "@/components/Catalogos/home/HeroNew";
import { CatalogFooter } from "@/components/Catalogos/General/Footer";

export default function page() {
  return (
    <div>
      <HeroNew />
      <div className="grid grid-cols-1 ">
        <Products />
      </div>
      <CatalogFooter />
    </div>
  );
}
