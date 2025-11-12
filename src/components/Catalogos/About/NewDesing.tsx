"use client";

import React, { useContext } from "react";
import { Award, MapPin, Home, BanknoteArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      {/* Main Content */}
      <div className=" mx-auto p-4 space-y-4">
        {/* Profile Section */}
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="">
              <div className=" bg-gradient-to-br from-primary/10 to-accent/10 p-4 flex items-center justify-center">
                <Image
                  height={200}
                  width={200}
                  src={store.urlPoster || logoApp}
                  alt={store.name || ""}
                  className="w-44 h-44 rounded-full object-cover"
                />
              </div>
              <div className=" p-8 space-y-2">
                {store.history ? (
                  <>
                    <h2 className="font-heading text-2xl font-bold text-card-foreground ">
                      Sobre Mí
                    </h2>
                    <ExpandableText text={store.history || "..."} lines={6} />
                  </>
                ) : null}

                <div className="grid grid-cols-1  gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-6 text-slate-700" />
                    <span>
                      {store.Provincia}, {store.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="size-6 text-slate-700" />
                    <span>
                      +{store.products.filter((obj) => obj.stock).length}{" "}
                      Productos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        {[
          store.domicilio && {
            icon: Home,
            name: "Delivery",
            description: "Envio a Domicilio disponible",
          },
          store.act_tf && {
            icon: BanknoteArrowUp,
            name: "Pago",
            description: "Permitido pago en transferencia",
          },
        ].length > 0 && (
          <div className="bg-accent/5 rounded-lg p-2">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  store.domicilio && {
                    icon: Home,
                    name: "Delivery",
                    description: "Envio a Domicilio disponible",
                  },
                  store.act_tf && {
                    icon: BanknoteArrowUp,
                    name: "Pago",
                    description: "Permitido pago en transferencia",
                  },
                ] as Skill[]
              ).map((skill, index) => (
                <Card
                  key={index}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 py-2"
                >
                  <CardContent className="p-2 text-center">
                    <skill.icon className="h-8 w-8 text-slate-700 mx-auto mb-4" />
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
