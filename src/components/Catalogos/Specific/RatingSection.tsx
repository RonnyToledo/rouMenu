"use client";

import React, { useState, useContext, useEffect, useMemo } from "react";
import { Star } from "lucide-react";
import { Product, StarDistribution } from "@/types/InitialStatus";
import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AppContext";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { toast } from "sonner";
import { initialState, Rating, RatingInterface } from "../About/RatingModal";

export default function RatingSection({
  specific,
  productData,
}: {
  specific: string;
  sitioweb: string;
  productData?: Product;
}) {
  const { store, dispatchStore } = useContext(MyContext);
  const { user, requireAuth } = useAuth();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState<RatingInterface>(() => ({
    ...initialState,
    nombre: user?.user_metadata.full_name || "",
  }));

  const product = useMemo(
    () =>
      productData ?? store.products.find((obj) => obj.productId == specific),
    [productData, store.products, specific],
  );

  useEffect(() => {
    if (user?.user_metadata.full_name && !rating.nombre) {
      queueMicrotask(() => {
        setRating((prev) => ({
          ...prev,
          nombre: user.user_metadata.full_name,
        }));
      });
    }
  }, [user?.user_metadata.full_name, rating.nombre]);

  const handleStarClick = async (rating: number) => {
    setRating((prev) => ({ ...prev, selectedRating: rating }));
    const isAuthenticated = await requireAuth(
      "Debes iniciar sesión para dejar una reseña",
    );
    if (!isAuthenticated) {
      return;
    }
    setReviewOpen(true);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.post(
        `/api/tienda/${store.sitioweb || ""}/product/${product?.productId || ""}/coment`,
        {
          comentario: {
            cmt: rating.description,
            star: rating.selectedRating,
          },
          uuid: user?.id,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.status === 200 || res.status === 201) {
        toast.success("Tarea Ejecutada", {
          description: "Comentario realizado",
        });
        dispatchStore({
          type: "AddComentProduct",
          payload: { data: res?.data?.value, specific: specific },
        });
        setReviewOpen(false);
      }
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      toast("Error", { description: "No se pudo enviar el comentario." });
    }
  };

  return (
    <>
      {product && (
        <div className="max-w-xl mx-auto px-2 py-1">
          <p className="text-sm text-muted-foreground mb-3 text-center leading-relaxed">
            {product.coment?.total == 0
              ? "Sé el primero en dejar una reseña para recomendar a próximos usuarios"
              : "Las calificaciones y opiniones provienen de personas que compraron este producto."}
          </p>

          {product?.coment.promedio ? (
            <>
              <div className="grid grid-cols-2 items-center gap-3 mb-3">
                {/* Score grande */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl font-bold text-foreground leading-none">
                    {product.coment.promedio}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.coment.promedio || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {product.coment.total} reseñas
                  </p>
                </div>

                <StarSpecifications datos={product.coment.porEstrellas} />
              </div>

              {/* Link — mismo estilo Button ghost del header */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-xs px-3 h-8"
              >
                <Link
                  href={`/t/${store.sitioweb}/producto/${product?.productId}/coment`}
                  className="text-primary"
                >
                  Ver todos los comentarios →
                </Link>
              </Button>
            </>
          ) : null}

          <Separator className="my-3" />

          {/* Rating stars */}
          <div className="pt-1 space-y-2">
            <div className="text-center">
              <h3 className="font-serif text-base font-semibold text-foreground">
                Califica este producto
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comparte tu opinión con otros usuarios
              </p>
            </div>

            {/* Stars — mismo patrón del ProductSpecific (rounded-full bg-secondary) */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  onClick={() => handleStarClick(starValue)}
                  className="w-10 h-10 rounded-full bg-radial from-product/20 to-transparent hover:bg-product/10 flex items-center justify-center transition-colors group"
                  aria-label={`Calificar con ${starValue} estrella${starValue > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      starValue <= rating.selectedRating
                        ? " fill-product text-product"
                        : "text-muted-foreground/40 group-hover:text-product group-hover:fill-product"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Rating
            rating={rating}
            setRating={setRating}
            isOpen={reviewOpen}
            onClose={() => setReviewOpen(false)}
            userName="Usuario"
            user={user?.user_metadata.full_name}
            handleSubmit={handleSubmit}
            imageUser={user?.user_metadata.avatar_url}
          />
        </div>
      )}
    </>
  );
}

export function StarSpecifications({ datos }: { datos: StarDistribution }) {
  const porEstrellas = datos || {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
    "0": 0,
  };

  const totalVotos = Object.values(porEstrellas).reduce(
    (sum, v) => (sum = (sum || 0) + (v || 0)),
    0,
  );

  return (
    <div className="flex-1 space-y-1">
      {[5, 4, 3, 2, 1].map((item) => {
        const votos =
          porEstrellas[item.toString() as keyof typeof porEstrellas] || 0;
        const porcentaje = totalVotos > 0 ? (votos * 100) / totalVotos : 0;
        return (
          <div key={item} className="flex items-center gap-2">
            <span className="w-3 text-xs text-muted-foreground">{item}</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-product rounded-full transition-all duration-500"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
