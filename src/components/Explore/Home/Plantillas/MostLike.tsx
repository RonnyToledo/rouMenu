"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import Link from "next/link";

export default function MostLike() {
  const { generalData } = useApp();

  return (
    <div className=" shadow-lg">
      {" "}
      <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4 ">
        Catalogs You Might Like
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {generalData.catalogsYouMightLike.map((catalog, index) => (
          <Link
            href={`/t/${catalog.store_sitioweb}/category/${catalog.category_id}`}
            key={index}
            className="flex flex-col gap-3 pb-3"
          >
            <Image
              src={catalog.image || logoApp}
              alt={catalog.category_name || ""}
              width={300}
              height={300}
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
            />
            <p className="text-[#0d141c] text-base font-medium leading-normal">
              {catalog.category_name || ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
