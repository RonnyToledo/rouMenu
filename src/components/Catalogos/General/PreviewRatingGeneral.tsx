"use client";
import React, { useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { initialState, Rating, RatingInterface } from "../About/RatingModal";
import { useAuth } from "@/context/AppContext";
import { logoUser } from "@/lib/image";
import { MyContext } from "@/context/MyContext";

export default function PreviewRatingGeneral({
  reviewOpen,
  onClose,
  ratingSelect,
}: {
  reviewOpen: boolean;
  onClose: () => void;
  ratingSelect?: number;
}) {
  const { user } = useAuth();
  const { store, dispatchStore } = useContext(MyContext);
  const [rating, setRating] = useState<RatingInterface>(() => ({
    ...initialState,
    selectedRating: ratingSelect || 0,
    nombre: user?.user_metadata.full_name || "",
  }));

  // Sync with ratingSelect prop only if it changes while modal is open
  useEffect(() => {
    if (ratingSelect !== undefined) {
      setRating((prev) => ({
        ...prev,
        selectedRating: ratingSelect,
      }));
    }
  }, [ratingSelect]);

  // Sync with user only if not already set
  useEffect(() => {
    if (user?.user_metadata.full_name && !rating.nombre) {
      setRating((prev) => ({
        ...prev,
        nombre: user.user_metadata.full_name,
      }));
    }
  }, [user?.user_metadata.full_name, rating.nombre]);

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        throw new Error("No existe el usuario");
      }
      if (!rating.nombre) {
        throw new Error("No existe el campo de nombre");
      }
      const res = await axios.post(
        `/api/tienda/${store}/coment`,
        {
          comentario: {
            cmt: rating.description,
            star: rating.selectedRating,
          },
          uid: store.UUID,
          uuid: user?.id,
        },
        {
          headers: { "Content-Type": "application/json" },
        }, // Cambia a application/json
      );

      if (res.status === 200 || res.status === 201) {
        window.localStorage.setItem(`${store.sitioweb}-userRating`, "ok");
        toast.success("Tarea Ejecutada", {
          description: "Comentario realizado",
        });
        dispatchStore({
          type: "AddComent",
          payload: { star: res.data.star },
        });
      }
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      toast("Error", {
        description: "No se pudo enviar el comentario.",
      });
    }
  };
  const closeReview = useCallback(() => onClose(), [onClose]);

  const userAvatar = user?.user_metadata.avatar_url || logoUser;
  const userName = user?.user_metadata.full_name || "user";

  return (
    <Rating
      rating={rating}
      setRating={setRating}
      isOpen={reviewOpen}
      onClose={closeReview}
      userName="Usuario"
      user={userName}
      imageUser={userAvatar}
      handleSubmit={handleSubmit}
    />
  );
}
