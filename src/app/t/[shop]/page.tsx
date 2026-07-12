import React from "react";
import HomeContent from "@/components/catalogo_UI/home/HomeContent";
import DrawerCart from "@/components/catalogo_UI/General/DrawerCart";

export default function page() {
  return (
    <div>
      <div className="grid grid-cols-1 ">
        <HomeContent />
      </div>
      <DrawerCart />
    </div>
  );
}
