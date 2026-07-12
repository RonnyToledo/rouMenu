"use client";

import React, { useState } from "react";
import { Search, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Unavailable() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRetrying(false);
  };

  const reasons = [
    "El catálogo está temporalmente fuera de línea",
    "El propietario ha pausado la publicación",
    "Estamos realizando mantenimiento en este catálogo",
    "El enlace puede haber expirado",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Icon */}
      <div className="text-center mb-12">
        <div className="relative mb-8 animate-in zoom-in-50 duration-700">
          <div className="w-28 h-28 mx-auto bg-secondary border border-border rounded-full shadow-sm flex items-center justify-center relative overflow-hidden">
            <AlertCircle className="w-12 h-12 text-orange-500 relative z-10" />
            <div
              className="absolute top-4 right-6 w-2 h-2 bg-orange-300 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"
              style={{ animationDelay: "1s" }}
            />
          </div>
        </div>

        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-3">
            Catálogo no disponible
          </h1>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed text-sm">
            Lo sentimos, este catálogo no está disponible en este momento. Esto
            puede deberse a varias razones.
          </p>
        </div>

        {/* Reasons */}
        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="bg-secondary border border-border rounded-2xl p-5 max-w-xl mx-auto mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Posibles causas
            </h3>
            <ul className="space-y-2 text-left">
              {reasons.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground animate-in slide-in-from-left-2 duration-500"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-in slide-in-from-bottom-4 duration-700 delay-700">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="rounded-full gap-2 px-8 h-11 active:scale-[0.98] transition-all bg-orange-500 hover:bg-orange-600 text-white"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Reintentando..." : "Reintentar"}
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full gap-2 px-8 h-11 border-border active:scale-[0.98] transition-all"
          >
            <Link href="/">
              <Search className="w-4 h-4" />
              Explorar otros catálogos
            </Link>
          </Button>
        </div>
      </div>

      {/* Help section */}
      <div className="mt-12 text-center animate-in fade-in duration-1000 delay-1000">
        <div className="bg-secondary/50 border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-xs text-muted-foreground mb-5 max-w-xl mx-auto leading-relaxed">
            Si crees que esto es un error o necesitas acceder urgentemente a
            este catálogo, no dudes en contactarnos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="rounded-full border-border text-xs h-9"
              asChild
            >
              <Link href="https://wa.me/5352489105">Contactar soporte</Link>
            </Button>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground rounded-full text-xs h-9"
              asChild
            >
              <Link href="mailto:ronnytoledo33@gmail.com?subject=Quiero%20reportar%20un%20problema">
                Reportar problema
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
