import React from "react";
import Products from "@/components/Catalogos/home/Products";
import HeroNew from "@/components/Catalogos/home/HeroNew";
import CartScreenOptions from "@/components/Catalogos/General/CartScreenOptions";

export default function page() {
  return (
    <div>
      <HeroNew />
      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="hidden md:grid"></div>
        <div className="md:col-span-2">
          <Products />
        </div>
        <div className="hidden md:grid">
          <CartScreenOptions />
        </div>
      </div>
    </div>
  );
}
