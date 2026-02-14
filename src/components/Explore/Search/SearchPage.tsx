"use client";

import React, { useState, useEffect } from "react";
import { Search, Package, Store, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { logoApp } from "@/lib/image";

interface ProductResult {
  type: "producto";
  id: number;
  productId: string;
  title: string;
  price: number;
  image?: string;
  descripcion?: string;
  storeId: string;
  storeName?: string;
  stock: number;
  score: number;
  storeSitioWeb?: string;
}

interface CategoriaResult {
  type: "categoria";
  id: string;
  name: string;
  description?: string;
  image?: string;
  storeId: string;
  storeName?: string;
  score: number;
  sitioweb?: string;
}

interface SitioResult {
  type: "sitio";
  id: number;
  UUID: string;
  name: string;
  sitioweb?: string;
  urlPoster?: string;
  parrrafo?: string;
  tipo?: string;
  Provincia?: string;
  municipio?: string;
  direccion?: string;
  score: number;
}

interface SearchResults {
  query: string;
  productos: ProductResult[];
  categorias: CategoriaResult[];
  sitios: SitioResult[];
}

export default function BusquedaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  async function fetchFuzzySearch(
    query: string
  ): Promise<SearchResults | null> {
    if (!query.trim()) {
      return null;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc("rpc_fuzzy_search", {
        q: query.trim(),
        limit_per_type: 6,
      });

      if (error) {
        console.error("Error en búsqueda fuzzy:", error);
        return null;
      }
      return data as SearchResults;
    } catch (error) {
      console.error("Error inesperado:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Efecto para manejar cambios en searchParams
  useEffect(() => {
    const searchQuery = searchParams.get("buscar") || "";
    setSearchTerm(searchQuery);
  }, [searchParams]);

  // Efecto para realizar búsqueda con debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const searchResults = await fetchFuzzySearch(searchTerm);
      setResults(searchResults);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Función para obtener todos los resultados combinados
  const getAllResults = () => {
    if (!results) return [];

    return [
      ...results.productos,
      ...results.categorias,
      ...results.sitios,
    ].sort((a, b) => b.score - a.score);
  };

  const renderProductCard = (product: ProductResult) => (
    <Card key={`product-${product.productId}`} className="w-full">
      <Link
        href={`/t/${product.storeSitioWeb}/producto/${product.productId}`}
        target="_blank"
      >
        <CardContent className="pt-0 flex  items-center w-full justify-between">
          <div className="flex items-center gap-2">
            <Image
              width={100}
              height={100}
              src={product.image || logoApp}
              alt={product.title || "Objeto Titulo"}
              className="size-16 object-cover rounded-full"
            />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {product.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  {product.storeName && (
                    <span className="text-sm text-muted-foreground">
                      en {product.storeName}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Badge variant={product.stock ? "secondary" : "destructive"}>
              {product.stock ? `$${product.price}` : "Agotado"}
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const renderCategoriaCard = (categoria: CategoriaResult) => (
    <Card key={`categoria-${categoria.id}`} className="w-full">
      <Link
        href={`/t/${categoria.sitioweb}/category/${categoria.id}`}
        target="_blank"
      >
        <CardContent className="pt-0 flex  items-center w-full justify-between">
          <div className="flex items-center gap-2">
            <Image
              width={100}
              height={100}
              src={categoria.image || logoApp}
              alt={categoria.name || "Objeto Titulo"}
              className="size-16 object-cover rounded-full"
            />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold">
                  {categoria.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {categoria.storeName && (
                    <span className="text-sm text-muted-foreground">
                      Categoría en {categoria.storeName}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const renderSitioCard = (sitio: SitioResult) => (
    <Card key={`sitio-${sitio.UUID}`} className="w-full">
      <Link href={`/t/${sitio.sitioweb}`} target="_blank">
        <CardContent className="pt-0 flex  items-center w-full justify-between">
          <div className="flex items-center gap-2 w-full">
            <Image
              width={100}
              height={100}
              src={sitio.urlPoster || logoApp}
              alt={sitio.name || "Objeto Titulo"}
              className="size-16 object-cover rounded-full"
            />

            <div className="flex items-start justify-between w-full">
              <div className="flex-1 w-full">
                <CardTitle className="text-lg font-semibold">
                  {sitio.name}
                </CardTitle>
                <CardDescription className="mt-1 flex flex-row  gap-1 line-clamp-1 w-full">
                  {sitio.tipo && (
                    <Badge variant="outline" className="text-xs">
                      {sitio.tipo}
                    </Badge>
                  )}
                  {(sitio.Provincia || sitio.municipio) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">
                        {[sitio.municipio, sitio.Provincia]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Barra de búsqueda */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative"></div>
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Buscando...</p>
          </div>
        )}

        {/* Tabs de resultados */}
        {results && !isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex bg-white w-full max-w-md mx-auto mb-8 p-2">
              <TabsTrigger
                value="all"
                className="flex items-center text-xs data-[state=active]:bg-slate-200 p-2"
              >
                Todo ({getAllResults().length})
              </TabsTrigger>
              <TabsTrigger
                value="sitios"
                className="flex items-center text-xs data-[state=active]:bg-slate-200 p-2"
              >
                Tiendas ({results.sitios.length})
              </TabsTrigger>
              <TabsTrigger
                value="productos"
                className="flex items-center text-xs data-[state=active]:bg-slate-200 p-2"
              >
                Productos ({results.productos.length})
              </TabsTrigger>
              <TabsTrigger
                value="categorias"
                className="flex items-center text-xs data-[state=active]:bg-slate-200 p-2"
              >
                Categorías ({results.categorias.length})
              </TabsTrigger>
            </TabsList>

            {/* Resultados - Todo */}
            <TabsContent value="all">
              <div className="grid gap-4">
                {getAllResults().map((item) => {
                  if (item.type === "producto") {
                    return renderProductCard(item as ProductResult);
                  } else if (item.type === "categoria") {
                    return renderCategoriaCard(item as CategoriaResult);
                  } else {
                    return renderSitioCard(item as SitioResult);
                  }
                })}
              </div>
              {getAllResults().length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {`No se encontraron resultados para "${results.query}"`}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Resultados de Productos */}
            <TabsContent value="productos">
              <div className="grid gap-4">
                {results.productos.map(renderProductCard)}
              </div>
              {results.productos.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {`No se encontraron productos para "${results.query}"`}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Resultados de Categorías */}
            <TabsContent value="categorias">
              <div className="grid gap-4">
                {results.categorias.map(renderCategoriaCard)}
              </div>
              {results.categorias.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {`No se encontraron categorías para "${results.query}"`}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Resultados de Sitios */}
            <TabsContent value="sitios">
              <div className="grid gap-4">
                {results.sitios.map(renderSitioCard)}
              </div>
              {results.sitios.length === 0 && (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {`No se encontraron tiendas para "${results.query}"`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Estado vacío cuando no hay búsqueda */}
        {!searchTerm.trim() && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Busca lo que necesitas
            </h3>
            <p className="text-muted-foreground mb-4">
              Encuentra productos, categorías y tiendas usando la barra de
              búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
