"use client";

import React, { useState, useContext } from "react";
import { Star } from "lucide-react";
import { StarDistribution } from "@/context/InitialStatus";
import { MyContext } from "@/context/MyContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RatingModalProduct } from "./RatingModalProduct";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";

export default function RatingSection({
  specific,
}: {
  specific: string;
  sitioweb: string;
}) {
  const pathname = usePathname();
  const { store } = useContext(MyContext);
  const { user, loading } = useAuth();
  const [selectedRating, setSelectedRating] = useState(0);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false); // controla modal de reseña

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);

    if (user && loading === false) {
      setReviewOpen(true);
      return;
    }

    // Si no está logueado -> marcar pending y abrir LoginPopover
    setIsLoginOpen(true);
  };

  return (
    <>
      {store.products
        .filter((env) => env.productId === specific)
        .map((obj, ind) => (
          <div key={ind} className="max-w-xl mx-auto px-6 py-2 ">
            <p className="text-gray-500 mb-2 text-sm">
              {obj.coment?.total == 0
                ? "Sé el primero en dejar una reseña para recomendar a próximos usuarios"
                : "Las calificaciones y opiniones provienen de personas que usan el mismo tipo de dispositivo que tú."}
            </p>

            <div className="grid grid-cols-2 items-center gap-2 mb-2">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-light">
                  {(obj?.coment?.promedio).toFixed(1)}
                </div>
                <div className="flex gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Number(obj.coment?.promedio)
                          ? "fill-yellow-600 text-yellow-600"
                          : "text-yellow-600"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  {obj.coment?.total.toLocaleString()} reseñas
                </div>
              </div>

              <StarSpecifications datos={obj.coment.porEstrellas} />
            </div>
            <div>
              <Button asChild variant="ghost">
                <Link
                  href={`/t/${store.sitioweb}/producto/${obj.productId}/coment`}
                  className="w-full flex justify-between"
                >
                  <h2 className="text-lg ">Todos los comentarios</h2>
                  <div className="text-lg">→</div>
                </Link>
              </Button>
            </div>

            <div className="border-t border-gray-800 pt-2">
              <h3 className="text-lg mb-1 text-center">
                Califica este producto
              </h3>
              <p className="text-gray-400 mb-4 text-base text-center">
                Comparte tu opinión con otros usuarios
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleStarClick(rating)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= selectedRating
                          ? "fill-gray-600 text-gray-600"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <LoginPopover
              isOpen={isLoginOpen}
              onClose={() => {
                setIsLoginOpen(false);
                // Si el usuario cerró el popover sin loguearse, desistimos de la intención
              }}
              redirectTo={pathname} // Ruta dinámica
            />
            <RatingModalProduct
              isOpen={reviewOpen}
              onClose={() => setReviewOpen(false)}
              id={specific}
              userName="Usuario"
              setIsModalOpen={setReviewOpen}
              starsSelected={selectedRating}
              user={user?.user_metadata.full_name}
              imageUser={
                user?.user_metadata.avatar_url || user?.user_metadata.avatar_url
              }
              uuid={user?.id || ""}
            />
          </div>
        ))}
    </>
  );
}
function StarSpecifications({ datos }: { datos: StarDistribution }) {
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
            <span className="w-3">{item}</span>
            <div className="flex-1 h-2 bg-gray-400 rounded-full overflow-hidden">
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
