"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import Link from "next/link";

export default function Popular() {
  const { generalData } = useApp();

  return (
    <div className="shadow-lg bg-white dark:bg-slate-900 rounded-lg">
      <h3 className="text-[#0d141c] dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Categorias
      </h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        {generalData.popularCatalogs.map((popular, index) => (
          <Link
            href={`t/${popular.store_sitioweb}/category/${popular.id}`}
            key={index}
            className="flex flex-col gap-3 pb-3 group"
          >
            <Image
              src={popular.image || logoApp}
              alt={popular.name || ""}
              width={300}
              height={300}
              className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg group-hover:opacity-80 transition-opacity"
            />

            <p className="text-[#0d141c] dark:text-slate-200 text-base font-medium leading-normal">
              {popular.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
