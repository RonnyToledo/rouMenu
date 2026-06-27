"use client";

import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { ReviewCard } from "../About/ReviewCard";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { Review } from "../About/CommentPage";
import { MyContext } from "@/context/MyContext";
import { ReordenateData } from "@/functions/ReordenateDataReviews";

const loadingStates = [
  { text: "Cargando comentarios" },
  { text: "Seleccionando comentarios" },
  { text: "Renderizando" },
];

const PAGE_SIZE = 10;

type tabsType = "all" | "positive" | "negative";

export default function CommentsPage({ id }: { id: string }) {
  const { store } = useContext(MyContext);
  const [filter, setFilter] = useState<tabsType>("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchComments = useCallback(
    async (
      currentPage: number = 1,
      filterParam: string = "all",
      UUID: string,
    ): Promise<void> => {
      setLoading(true);
      try {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;

        let query = supabase
          .from("coment")
          .select("* ,user(*),replies_coment(*,user(*))", { count: "exact" })
          .eq("UIProduct", UUID)
          .order("created_at", { ascending: false })
          .range(start, end);

        if (filterParam === "positive") {
          query = query.gte("star", 3);
        } else if (filterParam === "negative") {
          query = query.lt("star", 2);
        }

        const { data, count, error } = await query;

        if (error) throw error;
        if (data) {
          setReviews(ReordenateData(data, store));
          setTotalCount(count ?? 0);
          setTotalPages(Math.ceil((count ?? 0) / PAGE_SIZE));
        }
      } catch (err) {
        console.error("Error al cargar comentarios:", err);
      } finally {
        setLoading(false);
      }
    },
    [store],
  );

  useEffect(() => {
    if (id) {
      fetchComments(page, filter, id);
    }
  }, [page, filter, id, fetchComments]);

  // Reset to page 1 when filter changes
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value as tabsType);
    setPage(1);
  }, []);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, rev) => rev.star + sum, 0) / reviews.length;
  }, [reviews]);

  const positivePercent = useMemo(() => {
    if (reviews.length === 0) return 0;
    return Math.round(
      (reviews.filter((r) => r.star >= 4).length / reviews.length) * 100,
    );
  }, [reviews]);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-16" />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-0.5">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Comentarios y Reseñas
          </h1>
          <p className="text-sm text-muted-foreground">
            Lee lo que nuestros clientes tienen que decir
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">
                  {totalCount}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <p className="text-2xl font-bold text-foreground">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Promedio</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <p className="text-2xl font-bold text-foreground">
                  {positivePercent}%
                </p>
                <p className="text-xs text-muted-foreground">Positivos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Filtrar por:
            </span>
          </div>
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <TabsList className="rounded-full">
              <TabsTrigger value="all" className="rounded-full text-xs">
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="positive"
                className="rounded-full text-xs gap-1"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Positivos
              </TabsTrigger>
              <TabsTrigger
                value="negative"
                className="rounded-full text-xs gap-1"
              >
                <Star className="w-3 h-3" />
                Negativos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                {...review}
                setReviews={setReviews}
                table="replies_coment"
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                No hay comentarios
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                No se encontraron comentarios con los filtros seleccionados
              </p>
            </div>
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              variant="ghost"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Badge variant="secondary" className="rounded-full text-xs px-3">
              {page} / {totalPages}
            </Badge>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              variant="ghost"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={500}
      />
    </div>
  );
}
