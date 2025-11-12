"use client";
import React from "react";
import CardMinus from "@/components/Explore/Home/Plantillas/CardMinus";
import MostLike from "@/components/Explore/Home/Plantillas/MostLike";
import Popular from "@/components/Explore/Home/Plantillas/Popular";
import PostCard from "@/components/Explore/Home/Plantillas/PostCard";
import { useApp } from "@/context/AppContext";
import ArcGalleryHero from "./HeroPage";
import OptionsSelector from "./Plantillas/CardProduct";
import { cardsinfo } from "./Header";

import Link from "next/link";

export default function HomePage() {
  const { generalData } = useApp();
  const products = generalData?.products || [];
  const images = generalData?.images || [];
  // Últimos 10 posts (o menos si hay menos)
  const latest = products.slice(0, 10);
  const remaining = products.slice(10); // los que vamos a intercalar uno a uno

  // Componentes extras que queremos insertar *una sola vez* cada uno
  const extras = [
    <OptionsSelector key="extra-options" />,
    <CardMinus key="extra-cardminus" />,
    <MostLike key="extra-mostlike" />,
    <Popular key="extra-popular" />,
  ];

  // Distribuir posiciones para los extras a lo largo de `latest`
  const n = Math.max(1, latest.length); // evitar div/0
  const m = extras.length;
  const positionsSet = new Set<number>();
  const extrasPositions: number[] = [];

  for (let i = 0; i < m; i++) {
    // calculo aproximado y luego garantizo unicidad
    let pos = Math.round(((i + 1) * n) / (m + 1)) - 1; // índice base 0
    if (pos < 0) pos = 0;
    // asegurar unicidad: si ya existe, desplazar +1 hasta encontrar hueco
    while (positionsSet.has(pos) && pos < n - 1) pos++;
    // si aun así está ocupado y pos==n-1 ocupado, retroceder
    while (positionsSet.has(pos) && pos > 0) pos--;
    positionsSet.add(pos);
    extrasPositions.push(pos);
  }

  // Map index -> extra component
  const extrasByIndex: Record<number, React.ReactNode> = {};
  extras.forEach((comp, idx) => {
    const pos = extrasPositions[idx];
    extrasByIndex[pos] = comp;
  });

  // Construimos el array final intercalado
  const interleaved: React.ReactNode[] = [];
  let remIndex = 0;

  for (let i = 0; i < latest.length; i++) {
    // 1) Insertamos el PostCard (aquí se asume PostCard acepta `product` prop)
    interleaved.push(<PostCard key={`post-${i}`} filterIndex={i} />);

    // 2) Insertamos un producto restante (si existe)
    if (remIndex < remaining.length) {
      interleaved.push(<PostCard key={`post-${i}`} filterIndex={remIndex++} />);
    }

    // 3) Si toca un extra en este índice lo insertamos
    if (extrasByIndex[i]) {
      // ya vienen con key desde extras
      interleaved.push(extrasByIndex[i]);
    }
  }

  // Si quedaron remaining al final, los añadimos
  while (remIndex < remaining.length) {
    interleaved.push(
      <PostCard key={`post-${remIndex++}`} filterIndex={remIndex++} />
    );
  }

  // Si por alguna razón algún extra no fue insertado (no debería), los añadimos al final
  extras.forEach((comp) => {
    const already = interleaved.some(
      (node) =>
        React.isValidElement(node) &&
        node.key === (comp as React.ReactElement).key
    );
    if (!already) interleaved.push(comp);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="relative bg-background mb-6  py-2">
        <ArcGalleryHero images={images} />
      </main>

      <main id="main-general" className="grid gap-6">
        {/* Renderizamos la lista intercalada */}
        <div className="hidden grid-cols-1  gap-8 mb-8 top-20 p-2 h-fit">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 uppercase">
                RouMenu
              </h3>
              <div className="space-y-3 text-slate-600">
                <div>
                  <Link href="/">
                    Herramienta para la creacion y diseño de catalogos onlines
                    para venta de productos y servicios
                  </Link>
                </div>
                <div>
                  <Link href={"https://rouadmin.vercel.app/createAccount"}>
                    Registra tu negocio ahora en nuestro catálogo
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">
                Guía para potenciar tu negocio
              </h4>
              <div className="space-y-2">
                <div className=" text-slate-600 text-sm">
                  <Link href={"/services"}>
                    Preguntas frecuentes nuestro servicio?
                  </Link>
                </div>
                <div className=" text-slate-600 text-sm">
                  <Link href={"/info"}>Guia para usar nuestra plataforma?</Link>
                </div>
                <div className=" text-slate-600 text-sm">
                  <Link href={"/contact"}>Contactanos</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 space-y-4">{interleaved}</div>
        <div className="hidden h-fit sticky top-20">
          {cardsinfo
            .filter((obj) => obj.path !== "/info")
            .map((card, index) => (
              <Link
                key={`Active_${index}`}
                href={card.path}
                className="bg-accent text-accent-foreground p-4 rounded-xl shadow-sm h-fit"
              >
                <card.icon className="w-6 h-6 mb-2" />
                <h3 className="font-semibold text-sm">{card.name}</h3>
                <p className="text-xs opacity-90 mt-1">{card.descripcion}</p>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
