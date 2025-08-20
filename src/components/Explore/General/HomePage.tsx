"use client";
import React, { useContext } from "react";
import CardMinus from "@/components/Explore/Home/Plantillas/CardMinus";
import GridPost from "@/components/Explore/Home/Plantillas/GridPost";
import MostLike from "@/components/Explore/Home/Plantillas/MostLike";
import Popular from "@/components/Explore/Home/Plantillas/Popular";
import PostCard from "@/components/Explore/Home/Plantillas/PostCard";
import { MyGeneralContext } from "@/context/GeneralContext";

export default function HomePage() {
  const { generalData } = useContext(MyGeneralContext);
  console.log(generalData);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CardMinus />
      <MostLike />
      <Popular />
      <GridPost />
      <PostCard />
    </div>
  );
}
