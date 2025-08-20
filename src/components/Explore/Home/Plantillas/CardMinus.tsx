"use client";
import React, { useContext } from "react";
import { MyGeneralContext } from "@/context/GeneralContext";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function CardMinus({ value = 1 }: { value?: number }) {
  const { generalData } = useContext(MyGeneralContext);

  return (
    <div className="flex h-full flex-1 flex-col gap-2 p-4 rounded-lg min-w-60">
      <Image
        src={logoApp}
        alt={generalData.top_provinces[value]?.provincia || ""}
        width={300}
        height={300}
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
      />
      <div>
        <p className="text-[#0d141c] text-base font-medium leading-normal">
          {generalData.top_provinces[value]?.provincia || ""}
        </p>
        <p className="text-[#49739c] text-sm font-normal leading-normal">
          Explora por provincia (
          {generalData.top_provinces[value]?.sitios_count} tiendas)
        </p>
      </div>
      <div>
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4">
          Destacados
        </h3>
        <ScrollArea className="w-full h-fit  rounded-md  whitespace-nowrap">
          <div className="flex h-full w-max space-x-4">
            {generalData.top_provinces[value]?.top_sites.map((site, index) => (
              <div
                key={index}
                className="flex  flex-1 flex-col gap-4 rounded-lg "
              >
                <Image
                  src={site.image || logoApp}
                  alt={site.name || ""}
                  width={300}
                  height={300}
                  className="w-full h-32 bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                />
                <p className="text-[#0d141c] text-base font-medium leading-normal">
                  {site.name}
                </p>
              </div>
            ))}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
