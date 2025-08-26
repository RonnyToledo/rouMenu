"use client";
import React, { useContext } from "react";
import CardMinus from "@/components/Explore/Home/Plantillas/CardMinus";
import MostLike from "@/components/Explore/Home/Plantillas/MostLike";
import Popular from "@/components/Explore/Home/Plantillas/Popular";
import PostCard from "@/components/Explore/Home/Plantillas/PostCard";
import { MyGeneralContext } from "@/context/GeneralContext";
import ArcGalleryHero from "./HeroPage";
import OptionsSelector from "./Plantillas/CardProduct";

export default function HomePage() {
  const { generalData } = useContext(MyGeneralContext);
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
    <div className="min-h-screen bg-gray-50">
      <main className="relative bg-background mb-6  py-2">
        <ArcGalleryHero images={images} />
      </main>

      <main id="main-general" className="grid gap-6">
        {/* Renderizamos la lista intercalada */}
        <div className="grid grid-cols-1 gap-6 space-y-4">{interleaved}</div>
      </main>
    </div>
  );
}
