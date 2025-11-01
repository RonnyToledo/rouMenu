"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function CardMinus({ value = 1 }: { value?: number }) {
  const { generalData } = useApp();
  const data = generalData.top_provinces[value];
  if (!data) return null;

  return (
    <div className="flex h-full flex-1 flex-col gap-2 p-4 rounded-lg min-w-60  shadow-lg">
      <p className="text-[#0d141c] text-base font-medium leading-normal">
        Explorar {data?.provincia || ""}
      </p>
      <Image
        src={data?.image || logoApp}
        alt={data?.provincia || "aa"}
        width={300}
        height={300}
        className="w-full aspect-square object-center object-cover rounded-lg"
      />
      <div>
        <p className="text-[#49739c] text-sm font-normal leading-normal">
          Explora por provincia ({data.top_sites.length} tienda
          {data.top_sites.length > 1 ? "s" : ""})
        </p>
      </div>
      <div>
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] pb-1 pt-2">
          Destacados
        </h3>
        <ScrollArea className="w-full h-fit  rounded-md  whitespace-nowrap">
          <div className="flex h-full w-max space-x-4">
            {generalData.top_provinces[value]?.top_sites.map((site, index) => (
              <Link
                href={`/t/${site.sitioweb}`}
                key={index}
                className="flex  flex-1 flex-col gap-1 rounded-lg "
              >
                <Image
                  src={site.image || logoApp}
                  alt={site.name || ""}
                  width={300}
                  height={300}
                  className="w-full h-32 bg-center bg-no-repeat aspect-square bg-cover rounded-lg border"
                />
                <p className="text-[#0d141c] text-base font-medium leading-normal">
                  {site.name}
                </p>
              </Link>
            ))}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
