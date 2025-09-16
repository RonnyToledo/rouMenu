"use client";

import { useEffect, useState, useContext } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { MyContext } from "@/context/MyContext";
import { ReviewCard } from "./ReviewCard";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

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

// --- Tipos ---
export interface Review {
  id?: string;
  UIStore: string;
  cmt?: string;
  star: number;
  title?: string;
  name?: string;
  created_at: string;
  // añade aquí cualquier otro campo que venga de tu tabla comentTienda
}

// --- Componente ---
export default function CommentsPage() {
  const { store } = useContext(MyContext);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const pageSize = 10;

  const fetchComments = async (
    currentPage: number = 1,
    ratingFilter: number = 0,
    UUID: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from("comentTienda")
        .select("*", { count: "exact" })
        .eq("UIStore", UUID)
        .order("created_at", { ascending: false })
        .range(start, end);

      if (ratingFilter > 0) {
        query = query.eq("star", ratingFilter);
      }

      const { data, count, error } = await query;

      if (error) throw error;
      if (data) {
        setReviews(data);
        setTotalPages(Math.ceil((count ?? 0) / pageSize));
      }
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store.UUID) {
      fetchComments(page, selectedRating, store.UUID);
    }
  }, [page, selectedRating, store.UUID]);

  const handleRatingFilter = (rating: number): void => {
    setSelectedRating((prev) => (prev === rating ? 0 : rating));
    setPage(1);
  };

  return (
    <div className="max-w-xl mx-auto p-6 min-h-screen">
      <div className="flex justify-between mb-6">
        <p className="text-gray-400">Filtrar por calificación:</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant="ghost"
              size="icon"
              onClick={() => handleRatingFilter(rating)}
              className={`flex items-center justify-center size-7  p-0 gap-0 rounded-full`}
            >
              <Star
                className={`size-6 ${
                  selectedRating >= rating
                    ? "fill-gray-800 text-gray-800"
                    : "text-gray-400"
                }`}
              />
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {reviews.map((review, index) => (
          <ReviewCard key={index} {...review} />
        ))}
      </div>

      {!loading && reviews.length === 0 && (
        <p className="text-center text-gray-600 mt-8">
          No se encontraron comentarios que coincidan con tu búsqueda.
        </p>
      )}

      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || loading}
          className="rounded-full"
        >
          <ChevronLeft />
        </Button>
        <p className="text-gray-600">
          Página {page} de {totalPages}
        </p>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || loading}
          className="rounded-full"
        >
          <ChevronRight />
        </Button>
      </div>
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={500}
      />
    </div>
  );
}
