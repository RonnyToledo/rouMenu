"use client";
import {
  ArrowLeft,
  Home,
  Search,
  FolderX,
  Compass,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CatalogNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-slate-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex-1" />
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Error Section */}
        <div className="text-center mb-12">
          {/* Animated Icon */}
          <div className="relative mb-8 animate-in zoom-in-50 duration-700">
            <div className="w-32 h-32 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-60" />
              <FolderX className="w-16 h-16 text-blue-500 relative z-10" />

              {/* Floating elements */}
              <div className="absolute top-6 right-8 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
              <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse delay-500" />
              <div className="absolute top-10 left-10 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-1000" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Catálogo no encontrado
            </h1>
            <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              El catálogo que buscas no existe o ha sido movido a otra
              ubicación.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Compass className="w-4 h-4" />
              Error 404 - Catálogo
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link href="/">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 h-auto text-base font-medium transition-all duration-300 hover:scale-105">
                <Search className="w-4 h-4 mr-2" />
                Explorar catálogos
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => router.refresh()}
              className="px-8 py-3 h-auto text-base font-medium border-2 hover:bg-slate-50 transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar página
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
