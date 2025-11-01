"use client";
import React from "react";
import Products from "@/components/Catalogos/home/Products";
import HeroNew from "@/components/Catalogos/home/HeroNew";

export default function usePage() {
  return (
    <div>
      <HeroNew />
      <Products />
    </div>
  );
}
