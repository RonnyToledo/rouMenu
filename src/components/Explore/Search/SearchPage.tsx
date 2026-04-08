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
    query: string,
  ): Promise<SearchResults | null> {
    if (!query.trim()) return null;
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

  useEffect(() => {
    setSearchTerm(searchParams.get("buscar") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }
    const id = setTimeout(async () => {
      const r = await fetchFuzzySearch(searchTerm);
      setResults(r);
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const getAllResults = () => {
    if (!results) return [];
    return [
      ...results.productos,
      ...results.categorias,
      ...results.sitios,
    ].sort((a, b) => b.score - a.score);
  };

  const renderProductCard = (product: ProductResult) => (
    <Link
      key={`product-${product.productId}`}
      href={`/t/${product.storeSitioWeb}/producto/${product.productId}`}
      target="_blank"
    >
      <Card className="border-border hover:bg-secondary/50 transition-colors">
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              width={56}
              height={56}
              src={product.image || logoApp}
              alt={product.title || ""}
              className="w-14 h-14 object-cover rounded-xl border border-border shrink-0"
            />
            <div>
              <CardTitle className="text-sm font-semibold text-foreground line-clamp-1">
                {product.title}
              </CardTitle>
              {product.storeName && (
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  en {product.storeName}
                </CardDescription>
              )}
            </div>
          </div>
          <Badge
            variant={product.stock ? "secondary" : "destructive"}
            className={`rounded-full text-xs shrink-0 ${product.stock ? "border border-border" : ""}`}
          >
            {product.stock ? `$${product.price}` : "Agotado"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );

  const renderCategoriaCard = (categoria: CategoriaResult) => (
    <Link
      key={`categoria-${categoria.id}`}
      href={`/t/${categoria.sitioweb}/category/${categoria.id}`}
      target="_blank"
    >
      <Card className="border-border hover:bg-secondary/50 transition-colors">
        <CardContent className="p-3 flex items-center gap-3">
          <Image
            width={56}
            height={56}
            src={categoria.image || logoApp}
            alt={categoria.name || ""}
            className="w-14 h-14 object-cover rounded-xl border border-border shrink-0"
          />
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {categoria.name}
            </CardTitle>
            {categoria.storeName && (
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Categoría en {categoria.storeName}
              </CardDescription>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderSitioCard = (sitio: SitioResult) => (
    <Link
      key={`sitio-${sitio.UUID}`}
      href={`/t/${sitio.sitioweb}`}
      target="_blank"
    >
      <Card className="border-border hover:bg-secondary/50 transition-colors">
        <CardContent className="p-3 flex items-center gap-3">
          <Image
            width={56}
            height={56}
            src={sitio.urlPoster || logoApp}
            alt={sitio.name || ""}
            className="w-14 h-14 object-cover rounded-xl border border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-foreground">
              {sitio.name}
            </CardTitle>
            <CardDescription className="flex items-center flex-wrap gap-1.5 mt-0.5">
              {sitio.tipo && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 rounded-full border-border"
                >
                  {sitio.tipo}
                </Badge>
              )}
              {(sitio.Provincia || sitio.municipio) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {[sitio.municipio, sitio.Provincia]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-xs text-muted-foreground">Buscando...</p>
          </div>
        )}

        {/* Resultados */}
        {results && !isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-full max-w-md mx-auto mb-6 rounded-full p-1">
              <TabsTrigger value="all" className="rounded-full text-xs flex-1">
                Todo ({getAllResults().length})
              </TabsTrigger>
              <TabsTrigger
                value="sitios"
                className="rounded-full text-xs flex-1"
              >
                Tiendas ({results.sitios.length})
              </TabsTrigger>
              <TabsTrigger
                value="productos"
                className="rounded-full text-xs flex-1"
              >
                Productos ({results.productos.length})
              </TabsTrigger>
              <TabsTrigger
                value="categorias"
                className="rounded-full text-xs flex-1"
              >
                Cats. ({results.categorias.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-2">
                {getAllResults().map((item) => {
                  if (item.type === "producto")
                    return renderProductCard(item as ProductResult);
                  if (item.type === "categoria")
                    return renderCategoriaCard(item as CategoriaResult);
                  return renderSitioCard(item as SitioResult);
                })}
              </div>
              {getAllResults().length === 0 && (
                <EmptyState
                  message={`No se encontraron resultados para "${results.query}"`}
                  icon={<Search className="w-8 h-8 text-muted-foreground" />}
                />
              )}
            </TabsContent>

            <TabsContent value="productos">
              <div className="grid gap-2">
                {results.productos.map(renderProductCard)}
              </div>
              {results.productos.length === 0 && (
                <EmptyState
                  message={`No se encontraron productos para "${results.query}"`}
                  icon={<Package className="w-8 h-8 text-muted-foreground" />}
                />
              )}
            </TabsContent>

            <TabsContent value="categorias">
              <div className="grid gap-2">
                {results.categorias.map(renderCategoriaCard)}
              </div>
              {results.categorias.length === 0 && (
                <EmptyState
                  message={`No se encontraron categorías para "${results.query}"`}
                  icon={<Package className="w-8 h-8 text-muted-foreground" />}
                />
              )}
            </TabsContent>

            <TabsContent value="sitios">
              <div className="grid gap-2">
                {results.sitios.map(renderSitioCard)}
              </div>
              {results.sitios.length === 0 && (
                <EmptyState
                  message={`No se encontraron tiendas para "${results.query}"`}
                  icon={<Store className="w-8 h-8 text-muted-foreground" />}
                />
              )}
            </TabsContent>
          </Tabs>
        )}

        {!searchTerm.trim() && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-base font-semibold text-foreground mb-1">
              Busca lo que necesitas
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Encuentra productos, categorías y tiendas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {message}
      </p>
    </div>
  );
}
