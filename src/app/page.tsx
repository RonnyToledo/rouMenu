"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Bookmark,
  Eye,
  Heart,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface Catalog {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  views: number;
  likes: number;
  isBookmarked: boolean;
  url: string;
  tags: string[];
  featured: boolean;
  size: "small" | "medium" | "large";
}

// Datos simulados de catálogos
const catalogs: Catalog[] = [
  {
    id: 1,
    title: "Minimalist Home Decor",
    description: "Curated collection of modern minimalist furniture and decor",
    image: "/placeholder.svg?height=400&width=300&text=Home+Decor",
    category: "Home & Decor",
    views: 12500,
    likes: 890,
    isBookmarked: true,
    url: "https://example.com/home-decor",
    tags: ["minimalist", "furniture", "modern"],
    featured: true,
    size: "large",
  },
  {
    id: 2,
    title: "Organic Beauty Products",
    description: "Natural skincare and beauty essentials",
    image: "/placeholder.svg?height=300&width=300&text=Beauty+Products",
    category: "Beauty & Spa",
    views: 8900,
    likes: 654,
    isBookmarked: false,
    url: "https://example.com/beauty",
    tags: ["organic", "skincare", "natural"],
    featured: true,
    size: "medium",
  },
  {
    id: 3,
    title: "Tech Gadgets 2024",
    description: "Latest technology and innovative gadgets",
    image: "/placeholder.svg?height=250&width=300&text=Tech+Gadgets",
    category: "Technology",
    views: 15600,
    likes: 1200,
    isBookmarked: true,
    url: "https://example.com/tech",
    tags: ["technology", "gadgets", "innovation"],
    featured: false,
    size: "small",
  },
  {
    id: 4,
    title: "Artisan Coffee Collection",
    description: "Premium coffee beans from around the world",
    image: "/placeholder.svg?height=350&width=300&text=Coffee+Collection",
    category: "Food & Beverage",
    views: 6700,
    likes: 445,
    isBookmarked: false,
    url: "https://example.com/coffee",
    tags: ["coffee", "artisan", "premium"],
    featured: false,
    size: "medium",
  },
  {
    id: 5,
    title: "Sustainable Fashion",
    description: "Eco-friendly clothing and accessories",
    image: "/placeholder.svg?height=400&width=300&text=Sustainable+Fashion",
    category: "Fashion",
    views: 9800,
    likes: 720,
    isBookmarked: true,
    url: "https://example.com/fashion",
    tags: ["sustainable", "fashion", "eco-friendly"],
    featured: true,
    size: "large",
  },
  {
    id: 6,
    title: "Digital Art Marketplace",
    description: "Contemporary digital art and NFT collections",
    image: "/placeholder.svg?height=300&width=300&text=Digital+Art",
    category: "Art & Design",
    views: 11200,
    likes: 980,
    isBookmarked: false,
    url: "https://example.com/art",
    tags: ["digital", "art", "nft"],
    featured: false,
    size: "medium",
  },
  {
    id: 7,
    title: "Wellness & Meditation",
    description: "Products for mindfulness and well-being",
    image: "/placeholder.svg?height=250&width=300&text=Wellness",
    category: "Health & Wellness",
    views: 5400,
    likes: 380,
    isBookmarked: false,
    url: "https://example.com/wellness",
    tags: ["wellness", "meditation", "mindfulness"],
    featured: false,
    size: "small",
  },
  {
    id: 8,
    title: "Luxury Watches",
    description: "Premium timepieces and luxury accessories",
    image: "/placeholder.svg?height=350&width=300&text=Luxury+Watches",
    category: "Luxury",
    views: 18900,
    likes: 1450,
    isBookmarked: true,
    url: "https://example.com/watches",
    tags: ["luxury", "watches", "premium"],
    featured: true,
    size: "medium",
  },
];

const categories = [
  "Todos",
  "Home & Decor",
  "Beauty & Spa",
  "Technology",
  "Fashion",
  "Art & Design",
  "Food & Beverage",
  "Health & Wellness",
  "Luxury",
];

export default function CatalogExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredCatalogs, setFilteredCatalogs] = useState(catalogs);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    let filtered = catalogs;

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(
        (catalog) => catalog.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (catalog) =>
          catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          catalog.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          catalog.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredCatalogs(filtered);
  }, [searchTerm, selectedCategory]);

  const featuredCatalogs = catalogs.filter((catalog) => catalog.featured);

  const toggleBookmark = (catalogId: number) => {
    setFilteredCatalogs((prev) =>
      prev.map((catalog) =>
        catalog.id === catalogId
          ? { ...catalog, isBookmarked: !catalog.isBookmarked }
          : catalog
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">CatalogHub</h1>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Explorar
                </Link>
                <Link
                  href="/trending"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Trending
                </Link>
                <Link
                  href="/collections"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Colecciones
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar catálogos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 border-0 focus:bg-white transition-colors"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trending</h2>
            <Link
              href="/trending"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Ver todos
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {featuredCatalogs.map((catalog, index) => (
              <div
                key={catalog.id}
                className="flex-shrink-0 text-center animate-in slide-in-from-left-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 mx-auto ring-2 ring-gray-200 hover:ring-gray-300 transition-all duration-300 hover:scale-105">
                  <Image
                    width={300}
                    height={300}
                    src={catalog.image || "/placeholder.svg"}
                    alt={catalog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 max-w-20 truncate">
                  {catalog.title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredCatalogs.length} catálogos encontrados
            {selectedCategory !== "Todos" && ` en ${selectedCategory}`}
          </p>
        </div>

        {/* Catalogs Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {filteredCatalogs.map((catalog, index) => (
            <div
              key={catalog.id}
              className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 ${
                catalog.size === "large" && viewMode === "grid"
                  ? "sm:col-span-2 sm:row-span-2"
                  : ""
              } ${
                catalog.size === "medium" && viewMode === "grid"
                  ? "sm:row-span-1"
                  : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onMouseEnter={() => setHoveredCard(catalog.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Image */}
              <div
                className={`relative overflow-hidden ${
                  viewMode === "list"
                    ? "w-48 h-32"
                    : catalog.size === "large"
                    ? "h-80"
                    : catalog.size === "medium"
                    ? "h-48"
                    : "h-40"
                }`}
              >
                <Image
                  width={300}
                  height={300}
                  src={catalog.image || "/placeholder.svg"}
                  alt={catalog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay */}
                <div
                  className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    hoveredCard === catalog.id
                      ? "bg-opacity-20"
                      : "bg-opacity-0"
                  }`}
                />

                {/* Action Buttons */}
                <div
                  className={`absolute top-3 right-3 flex gap-2 transition-all duration-300 ${
                    hoveredCard === catalog.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2"
                  }`}
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    onClick={() => toggleBookmark(catalog.id)}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        catalog.isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 text-gray-700"
                  >
                    {catalog.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-1">
                    {catalog.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {catalog.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {catalog.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{catalog.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{catalog.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCatalogs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron catálogos
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta con otros términos de búsqueda o explora diferentes
              categorías
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
