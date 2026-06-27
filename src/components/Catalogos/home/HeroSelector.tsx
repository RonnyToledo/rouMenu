"use client";
import React, { useContext } from "react";
import { MyContext } from "@/context/MyContext";
import Products from "./ProductUI/Products";
import CatalogHero from "./Hero/HeroNew";
import HeroPremium from "./Hero/Premium";
import HeroGlobal from "./Hero/HeroGlobal";

export default function HeroSelector() {
  const { store } = useContext(MyContext);
  const visitas = store?.visitas ?? 0;

  if (visitas >= 3000)
    return (
      <>
        <CatalogHero />
        <Products />
      </>
    );
  if (visitas >= 1000)
    return (
      <>
        <HeroPremium />

        <Products />
      </>
    );
  return (
    <>
      <HeroGlobal />

      <Products />
    </>
  );
}
