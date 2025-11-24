"use client";

import React, { useState, useContext, useEffect } from "react";
import { Star } from "lucide-react";
import { Product, StarDistribution } from "@/context/InitialStatus";
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
}: {
  specific: string;
  sitioweb: string;
}) {
  const { store, dispatchStore } = useContext(MyContext);
  const [product, setproduct] = useState<Product>();
  const { user, requireAuth } = useAuth();
  const [reviewOpen, setReviewOpen] = useState(false); // controla modal de reseña
  const [rating, setRating] = useState<RatingInterface>(initialState);

  useEffect(() => {
    if (user?.user_metadata.full_name) {
      setRating((prev) => ({
        ...prev,
        nombre: user?.user_metadata.full_name || "",
      }));
    }
  }, [user?.user_metadata.full_name]);

  const handleStarClick = async (rating: number) => {
    setRating((prev) => ({
      ...prev,
      selectedRating: rating,
    }));

    const isAuthenticated = await requireAuth(
      "Debes iniciar sesión para dejar una reseña"
    );
    // Si el usuario no se autenticó o canceló, detener el proceso
    if (!isAuthenticated) {
      console.info("Usuario no autenticado, review cancelada");
      return;
    }

    setReviewOpen(true);
  };

  useEffect(() => {
    setproduct(store.products.find((obj) => obj.productId == specific));
  }, [store.products, specific]);

  const handleSubmit = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.post(
        `/api/tienda/${store}/product/${product?.productId || ""}/coment`,
        {
          comentario: {
            cmt: rating.description,
            star: rating.selectedRating,
          },
          uuid: user?.id,
        },
        { headers: { "Content-Type": "application/json" } } // Cambia a application/json
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
      toast("Error", {
        description: "No se pudo enviar el comentario.",
      });
    }
  };
  return (
    <>
      {store.products
        .filter((env) => env.productId === specific)
        .map((obj, ind) => (
          <div key={ind} className="max-w-xl mx-auto p-2 ">
            <p className="text-slate-500 mb-2 text-sm text-center">
              {obj.coment?.total == 0
                ? "Sé el primero en dejar una reseña para recomendar a próximos usuarios"
                : "Las calificaciones y opiniones provienen de personas que compraron este producto con otros usuarios."}
            </p>

            {product?.coment.promedio ? (
              <>
                <div className="grid grid-cols-2 items-center gap-2 mb-2">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl font-bold text-slate-800 mb-2">
                      {product?.coment.promedio}
                    </div>
                    <div className="flex items-center justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product?.coment.promedio || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-400"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">
                      {product?.coment.total} reseñas
                    </p>
                  </div>

                  <StarSpecifications datos={obj.coment.porEstrellas} />
                </div>
                <div>
                  <Button asChild variant="ghost">
                    <Link
                      href={`/t/${store.sitioweb}/producto/${product?.productId}/coment`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Todos los comentarios →
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}
            <Separator />
            <div className="pt-2">
              <h3 className="text-lg mb-1 text-center text-slate-700 font-medium">
                Califica este producto
              </h3>
              <p className="text-slate-400 mb-4 text-base text-center">
                Comparte tu opinión con otros usuarios
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    onClick={() => handleStarClick(starValue)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`size-7 ${
                        starValue <= rating.selectedRating
                          ? "fill-slate-600 text-slate-600"
                          : "text-slate-400"
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
              imageUser={
                user?.user_metadata.avatar_url || user?.user_metadata.avatar_url
              }
            />
          </div>
        ))}
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

  // 1️⃣ Calcula el total solo 1 vez
  const totalVotos = Object.values(porEstrellas).reduce(
    (sum, v) => (sum = (sum || 0) + (v || 0)),
    0
  );

  return (
    <div className="flex-1">
      {[5, 4, 3, 2, 1].map((item) => {
        const votos =
          porEstrellas[item.toString() as keyof typeof porEstrellas] || 0;
        // evita dividir por cero
        const porcentaje = totalVotos > 0 ? (votos * 100) / totalVotos : 0;
        return (
          <div key={item} className="flex items-center gap-1">
            <span className="w-3 text-slate-700">{item}</span>
            <div className="flex-1 h-2 bg-slate-400 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400"
                style={{
                  width: `${porcentaje}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
