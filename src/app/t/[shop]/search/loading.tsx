import React from "react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  {
    text: "Cargando datos",
  },
  {
    text: "Buscando tienda",
  },
  {
    text: "Revisando Porductos",
  },
  {
    text: "Cargando comentarios",
  },
  {
    text: "Recibiendo datos",
  },
  {
    text: "Preprarando pagina para el usuario",
  },
  {
    text: "Casi terminamos",
  },
  {
    text: "Welcome",
  },
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
