"use client";

import React, { useContext, useMemo, memo } from "react";
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

  const skills = useMemo<Skill[]>(() => {
    const result: Skill[] = [];
    if (store.domicilio) {
      result.push({
        icon: Home,
        name: "Delivery",
        description: "Envío a Domicilio disponible",
      });
    }
    if (store.act_tf) {
      result.push({
        icon: BanknoteArrowUp,
        name: "Pago",
        description: "Permitido pago en transferencia",
      });
    }
    return result;
  }, [store.domicilio, store.act_tf]);

  const stockCount = useMemo(
    () => store.products.filter((p) => p.stock).length,
    [store.products],
  );

  return (
    <div className="bg-background transition-colors duration-300">
      <div className="mx-auto p-4 space-y-4">
        {/* Profile card */}
        <Card className="overflow-hidden p-0 border-border shadow-sm">
          <CardContent className="p-0">
            <div className="bg-secondary/60 p-6 flex items-center justify-center">
              <Image
                height={200}
                width={200}
                src={store.urlPoster || logoApp}
                alt={store.name || ""}
                className="w-40 h-40 rounded-full object-cover border-2 border-border"
              />
            </div>
            <div className="p-6 space-y-3">
              {store.history && (
                <>
                  <h2 className="font-serif text-xl font-bold text-foreground">
                    Sobre Mí
                  </h2>
                  <ExpandableText text={store.history} lines={6} />
                </>
              )}

              <div className="space-y-2 text-sm pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    {store.Provincia}, {store.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    +{stockCount} Productos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const SkillCard = memo(function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card className="border-border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
      <CardContent className="p-4 text-center space-y-1.5">
        <skill.icon className="w-7 h-7 text-muted-foreground mx-auto" />
        <h3 className="font-semibold text-sm text-foreground">{skill.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {skill.description}
        </p>
      </CardContent>
    </Card>
  );
});
