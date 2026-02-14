"use client";

import { useEffect, useState, useContext, useCallback } from "react";
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

const loadingStates = [
  {
    text: "Cargando comentarios",
  },
  {
    text: "Seleccionando comentarios",
  },
  {
    text: "Renderizando",
  },
];
interface UserRelation {
  id: string;
  name: string;
  role: string;
  email: string;
  image: string | null;
  login: boolean;
}
// --- Tipos ---
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
  // añade aquí cualquier otro campo que venga de tu tabla comentTienda
}

type tabsType = "all" | "positive" | "negative";

export default function CommentsPage() {
  const { store } = useContext(MyContext);
  const [filter, setFilter] = useState<tabsType>("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const pageSize = 10;

  const fetchComments = useCallback(
    async (
      currentPage: number = 1,
      filterParam: string = "all",
      UUID: string
    ): Promise<void> => {
      setLoading(true);
      try {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize - 1;

        let query = supabase
          .from("comentTienda")
          .select("* ,user(*),replies(*,user(*))", { count: "exact" })
          .eq("UIStore", UUID)
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

          setTotalPages(Math.ceil((count ?? 0) / pageSize));
        }
      } catch (err) {
        console.error("Error al cargar comentarios:", err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, store]
  );

  useEffect(() => {
    if (store.UUID) {
      fetchComments(page, filter, store.UUID);
    }
  }, [page, filter, store.UUID, fetchComments]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="h-16"></div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-balance">
            Comentarios y Reseñas
          </h1>
          <p className="text-muted-foreground text-pretty">
            Lee lo que nuestros clientes tienen que decir
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-2">
              <div className="flex flex-col items-center gap-2">
                <MessageCircle className="size-4 text-muted-foreground" />
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-xs text-muted-foreground text-center">
                  Total
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-2">
              <div className="flex flex-col items-center gap-2">
                <Star className="size-5 fill-yellow-500 text-yellow-500" />
                <p className="text-2xl font-bold">
                  {(
                    reviews.reduce((sum, rev) => rev.star + sum, 0) /
                      reviews.length || 0
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Promedio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card rounded-lg border shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar por:</span>
          </div>
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as tabsType)}
          >
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                Todos
              </TabsTrigger>
              <TabsTrigger value="positive" className="gap-1.5">
                <Star className="size-3 fill-yellow-500 text-yellow-500" />
                Positivos
              </TabsTrigger>
              <TabsTrigger value="negative" className="gap-1.5">
                <Star className="size-3" />
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
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay comentarios</h3>
            <p className="text-sm text-muted-foreground text-center text-balance">
              No se encontraron comentarios con los filtros seleccionados
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Página {page} de {totalPages}
              </Badge>
            </div>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={500}
      />
    </div>
  );
}
