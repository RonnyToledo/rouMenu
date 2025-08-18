"use client";

import React, { useContext } from "react";
import { Award, MapPin, Home, BanknoteArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MyContext } from "@/context/MyContext";
import { logoApp } from "@/lib/image";
import ExpandableText from "../Specific/truncateText";
import Image from "next/image";
interface Skill {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  description: string;
}
export default function AboutMePage() {
  const { store } = useContext(MyContext);

  return (
    <div className="bg-background">
      {/* Header Section */}
      <div
        className={`bg-gradient-to-r from-black/15 to-black/20 border-b`}
        style={{
          width: "100%",
          backgroundImage: `url(${store.banner || store.urlPoster || logoApp})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className=" mx-auto px-4 py-12 text-center">
          <ExpandableText
            text={store.parrrafo || "..."}
            className={"text-gray-100"}
            lines={3}
          />
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge
              variant="secondary"
              className="bg-accent text-accent-foreground"
            >
              {store.tipo || "Catalogo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" mx-auto p-4 space-y-4">
        {/* Profile Section */}
        {store.history && (
          <Card className="overflow-hidden p-0">
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-accent/10 p-4 flex items-center justify-center">
                  <Image
                    height={200}
                    width={200}
                    src={store.urlPoster || logoApp}
                    alt={store.name || ""}
                    className="w-44 h-44 rounded-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-8 space-y-2">
                  <h2 className="font-heading text-2xl font-bold text-card-foreground ">
                    Sobre Mí
                  </h2>
                  <ExpandableText text={store.history || "..."} lines={6} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-6 text-gray-700" />
                      <span>
                        {store.Provincia}, {store.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="size-6 text-gray-700" />
                      <span>
                        +{store.products.filter((obj) => !obj.agotado).length}{" "}
                        Productos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Section */}
        {[
          store.domicilio && {
            icon: Home,
            name: "Delivery",
            description: "Envio a Domicilio disponible",
          },
          store.domicilio && {
            icon: BanknoteArrowUp,
            name: "Pago",
            description: "Permitido pago en transferencia",
          },
        ].length > 0 && (
          <div className="bg-accent/5 rounded-lg p-2">
            <h2 className="font-heading text-2xl font-bold text-center mb-4">
              Caracteristicas
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  store.domicilio && {
                    icon: Home,
                    name: "Delivery",
                    description: "Envio a Domicilio disponible",
                  },
                  store.domicilio && {
                    icon: BanknoteArrowUp,
                    name: "Pago",
                    description: "Permitido pago en transferencia",
                  },
                ] as Skill[]
              ).map((skill, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                >
                  <CardContent className="p-2 text-center">
                    <skill.icon className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                    <h3 className="font-heading font-semibold mb-2">
                      {skill.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {skill.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
