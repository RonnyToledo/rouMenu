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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      {/* Main Error Section */}
      <div className="text-center mb-16">
        <div className="relative mb-8 animate-in zoom-in-50 duration-700">
          <div className="w-32 h-32 mx-auto bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 opacity-50" />
            <AlertCircle className="w-16 h-16 text-orange-500 relative z-10" />
            <div
              className="absolute top-4 right-6 w-2 h-2 bg-orange-300 dark:bg-orange-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-red-300 dark:bg-red-600 rounded-full animate-bounce"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute top-8 left-8 w-1 h-1 bg-orange-400 dark:bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "1.5s" }}
            />
          </div>
        </div>

        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Catálogo no disponible
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Lo sentimos, este catálogo no está disponible en este momento. Esto
            puede deberse a varias razones.
          </p>
        </div>

        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 max-w-2xl mx-auto mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Posibles causas
            </h3>
            <ul className="space-y-3 text-left">
              {reasons.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-slate-600 dark:text-slate-400 animate-in slide-in-from-left-2 duration-500"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-700 delay-700">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 h-auto text-base font-medium transition-all duration-300 hover:scale-105 disabled:scale-100"
          >
            {isRetrying ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Reintentando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </div>
            )}
          </Button>

          <Button
            asChild
            variant="link"
            className="px-8 py-3 h-auto text-base font-medium border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 hover:scale-105 bg-transparent dark:text-slate-300"
          >
            <Link href="/">
              <Search className="w-4 h-4 mr-2" />
              Explorar otros catálogos
            </Link>
          </Button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-16 text-center animate-in fade-in duration-1000 delay-1000">
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
            Si crees que esto es un error o necesitas acceder urgentemente a
            este catálogo, no dudes en contactarnos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="link"
              className="hover:bg-slate-50 dark:hover:bg-slate-900 bg-transparent dark:text-slate-300"
            >
              <Link href={"https://wa.me/5352489105"}>Contactar soporte</Link>
            </Button>
            <Button
              variant="link"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <Link
                href={`mailto:ronnytoledo33@gmail.com?subject=Quiero%20reportar%20un%20problema`}
              >
                Reportar problema
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
