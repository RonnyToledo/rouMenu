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
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 dark:from-slate-900 dark:to-slate-800">
      <div className="h-16" />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-balance text-slate-900 dark:text-slate-100">
            Comentarios y Reseñas
          </h1>
          <p className="text-muted-foreground dark:text-slate-400 text-pretty">
            Lee lo que nuestros clientes tienen que decir
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="pt-2">
              <div className="flex flex-col items-center gap-2">
                <MessageCircle className="size-4 text-muted-foreground dark:text-slate-400" />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {reviews.length}
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400 text-center">
                  Total
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="pt-2">
              <div className="flex flex-col items-center gap-2">
                <Star className="size-5 fill-yellow-500 text-yellow-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400 text-center">
                  Promedio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Filtrar por:
            </span>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as TabsType)}>
            <TabsList className="dark:bg-slate-900">
              <TabsTrigger
                value="all"
                className="dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="positive"
                className="gap-1.5 dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
              >
                <Star className="size-3 fill-yellow-500 text-yellow-500" />
                Positivos
              </TabsTrigger>
              <TabsTrigger
                value="negative"
                className="gap-1.5 dark:data-[state=active]:bg-slate-700 dark:text-slate-300"
              >
                <Star className="size-3 dark:text-slate-400" />
                Negativos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} {...review} setReviews={setReviews} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="size-16 rounded-full bg-muted dark:bg-slate-900 flex items-center justify-center mb-4">
              <MessageCircle className="size-8 text-muted-foreground dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No hay comentarios
            </h3>
            <p className="text-sm text-muted-foreground dark:text-slate-400 text-center text-balance">
              No se encontraron comentarios con los filtros seleccionados
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-card dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <Button
              onClick={handlePrevPage}
              disabled={page === 1 || loading}
              variant="outline"
              size="sm"
              className="gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Badge
              variant="secondary"
              className="dark:bg-slate-900 dark:text-slate-300"
            >
              Página {page} de {totalPages}
            </Badge>
            <Button
              onClick={handleNextPage}
              disabled={page === totalPages || loading}
              variant="outline"
              size="sm"
              className="gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Siguiente
              <ChevronRight className="size-4" />
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
