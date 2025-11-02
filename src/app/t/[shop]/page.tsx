import React from "react";
import Products from "@/components/Catalogos/home/Products";
import HeroNew from "@/components/Catalogos/home/HeroNew";

export default function page() {
  return (
    <div>
      <HeroNew />
      <div className="grid grid-cols-1 ">
        <Products />
      </div>
    </div>
  );
}
