"use client";
import React, { useContext } from "react";
import { MyContext } from "@/context/MyContext";
import CatalogHero from "./Hero/HeroNew";
import HeroPremium from "./Hero/Premium";
import HeroGlobal from "./Hero/HeroGlobal";

const VISITAS_THRESHOLDS = {
  hero: 3000,
  premium: 1000,
} as const;

export default function HeroSelector() {
  const { store } = useContext(MyContext);
  const visitas = store?.visitas ?? 0;

  if (visitas >= VISITAS_THRESHOLDS.hero) return <CatalogHero />;
  if (visitas >= VISITAS_THRESHOLDS.premium) return <HeroPremium />;
  return <HeroGlobal />;
}
