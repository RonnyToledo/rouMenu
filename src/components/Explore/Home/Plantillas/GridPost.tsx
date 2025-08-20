"use client";
import React, { useContext } from "react";
import { MyGeneralContext } from "@/context/GeneralContext";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import Link from "next/link";
export default function GridPost() {
  const { generalData } = useContext(MyGeneralContext);
  return (
    <div>
      <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Catalogs
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {generalData.catalogs.map((catalog, index) => (
          <Link
            href={`t/${catalog.sitioweb}`}
            key={index}
            className="flex flex-col gap-3 pb-3"
          >
            <Image
              src={catalog.image || logoApp}
              alt={catalog.name || ""}
              width={300}
              height={300}
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
            />

            <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">
              {catalog.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
