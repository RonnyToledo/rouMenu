"use client";

import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { MyContext } from "@/context/MyContext";
import { ReviewCard } from "./ReviewCard";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { ReordenateData } from "@/functions/ReordenateDataReviews";

const PAGE_SIZE = 10;

const loadingStates = [
  { text: "Cargando comentarios" },
  { text: "Seleccionando comentarios" },
  { text: "Renderizando" },
];

interface UserRelation {
  id: string;
  name: string;
  role: string;
  email: string;
  image: string | null;
  login: boolean;
}

export interface Review {
  id?: string;
  UIStore: string;
  cmt?: string;
  star: number;
  title?: string;
  created_at: string;
  user: UserRelation;
  user_id: string;
  reply: boolean;
  replies?: Review[];
  replies_coment?: Review[];
}

type TabsType = "all" | "positive" | "negative";

export default function CommentsPage() {
  const { store } = useContext(MyContext);
  const [filter, setFilter] = useState<TabsType>("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchComments = useCallback(
    async (currentPage: number, filterParam: string, UUID: string) => {
      setLoading(true);
      try {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;

        let query = supabase
          .from("comentTienda")
          .select("*, user(*), replies(*, user(*))", { count: "exact" })
          .eq("UIStore", UUID)
          .order("created_at", { ascending: false })
          .range(start, end);

        if (filterParam === "positive") query = query.gte("star", 3);
        else if (filterParam === "negative") query = query.lt("star", 2);

        const { data, count, error } = await query;
        if (error) throw error;

        if (data) {
          setReviews(ReordenateData(data, store));
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
    if (store.UUID) {
      fetchComments(page, filter, store.UUID);
    }
  }, [page, filter, store.UUID, fetchComments]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, rev) => sum + rev.star, 0) / reviews.length;
  }, [reviews]);

  const handlePrevPage = useCallback(
    () => setPage((p) => Math.max(p - 1, 1)),
    [],
  );
  const handleNextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages],
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="h-16" />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-0.5">
          <h1 className="font-serif text-xl font-bold text-foreground">
            Comentarios y Reseñas
          </h1>
          <p className="text-sm text-muted-foreground">
            Lee lo que nuestros clientes tienen que decir
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">
                  {reviews.length}
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
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Filtrar por:
            </span>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as TabsType)}>
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
              <ReviewCard key={review.id} {...review} setReviews={setReviews} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
              No hay comentarios
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              No se encontraron comentarios con los filtros seleccionados
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
            <Button
              onClick={handlePrevPage}
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
              onClick={handleNextPage}
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
