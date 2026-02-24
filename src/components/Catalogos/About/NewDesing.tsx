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
    <div className="bg-background dark:bg-slate-950">
      <div className="mx-auto p-4 space-y-4">
        {/* Profile Section */}
        <Card className="overflow-hidden p-0 dark:bg-slate-900 dark:border-slate-700">
          <CardContent className="p-0">
            <div className="bg-linear-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 p-4 flex items-center justify-center">
              <Image
                height={200}
                width={200}
                src={store.urlPoster || logoApp}
                alt={store.name || ""}
                className="w-44 h-44 rounded-full object-cover"
              />
            </div>
            <div className="p-8 space-y-2">
              {store.history && (
                <>
                  <h2 className="font-heading text-2xl font-bold text-card-foreground dark:text-slate-100">
                    Sobre Mí
                  </h2>
                  <ExpandableText text={store.history} lines={6} />
                </>
              )}

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="size-6 text-slate-700 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {store.Provincia}, {store.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="size-6 text-slate-700 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    +{stockCount} Productos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="bg-accent/5 dark:bg-slate-900/50 rounded-lg p-2">
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <SkillCard key={skill.name} skill={skill} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SkillCard = memo(function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 py-2 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-slate-600">
      <CardContent className="p-2 text-center">
        <skill.icon className="h-8 w-8 text-slate-700 dark:text-slate-400 mx-auto mb-4" />
        <h3 className="font-heading font-semibold mb-2 text-slate-900 dark:text-slate-100">
          {skill.name}
        </h3>
        <p className="text-sm text-muted-foreground dark:text-slate-400">
          {skill.description}
        </p>
      </CardContent>
    </Card>
  );
});
