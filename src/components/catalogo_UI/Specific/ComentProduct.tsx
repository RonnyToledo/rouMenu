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
          <h1 className="eclipse-title font-serif text-2xl font-bold tracking-tight text-foreground">
            Comentarios y Reseñas
          </h1>
          <p className="text-sm text-muted-foreground">
            Lee lo que nuestros clientes tienen que decir
          </p>
        </div>

        {/* Stats — card blanco con borde suave, icono dentro de círculo, al estilo de los grupos del checkout */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-border rounded-2xl shadow-none bg-card">
            <CardContent className="pt-4 pb-3.5 px-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="eclipse-title text-2xl font-bold text-foreground leading-none">
                  {totalCount}
                </p>
                <p className="text-[11px] text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border rounded-2xl shadow-none bg-card">
            <CardContent className="pt-4 pb-3.5 px-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="eclipse-title text-2xl font-bold text-foreground leading-none">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-[11px] text-muted-foreground">Promedio</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border rounded-2xl shadow-none bg-card">
            <CardContent className="pt-4 pb-3.5 px-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="eclipse-title text-2xl font-bold text-foreground leading-none">
                  {positivePercent}%
                </p>
                <p className="text-[11px] text-muted-foreground">Positivos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros — mismo patrón de "grupo con pregunta" del checkout: eyebrow + control */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-[13px] font-semibold text-foreground">
              Filtrar por
            </span>
          </div>
          <Tabs value={filter} onValueChange={handleFilterChange}>
            <TabsList className="rounded-full bg-secondary w-full sm:w-auto">
              <TabsTrigger
                value="all"
                className="rounded-full text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="positive"
                className="rounded-full text-xs gap-1 data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Positivos
              </TabsTrigger>
              <TabsTrigger
                value="negative"
                className="rounded-full text-xs gap-1 data-[state=active]:bg-foreground data-[state=active]:text-background"
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
              <h3 className="eclipse-title font-serif text-lg font-semibold text-foreground mb-1">
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
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-2xl border border-border">
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
