import React from "react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  { text: "Cargando datos" },
  { text: "Buscando tienda" },
  { text: "Revisando productos" },
  { text: "Cargando comentarios" },
  { text: "Recibiendo datos" },
  { text: "Preparando página para el usuario" },
  { text: "Casi terminamos" },
];

export default function CatalogLoading() {
  return (
    <MultiStepLoader
      loadingStates={loadingStates}
      loading={true}
      duration={2000}
    />
  );
}
