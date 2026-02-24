"use client";
import React, {
  useState,
  useContext,
  useCallback,
  useEffect,
  memo,
} from "react";
import axios from "axios";
import { sileo } from "sileo";
import { initialState, Rating, RatingInterface } from "../About/RatingModal";
import { useAuth } from "@/context/AppContext";
import { logoUser } from "@/lib/image";
import { MyContext } from "@/context/MyContext";

interface PreviewRatingGeneralProps {
  reviewOpen: boolean;
  onClose: () => void;
  ratingSelect?: number;
}

const PreviewRatingGeneral = memo(function PreviewRatingGeneral({
  reviewOpen,
  onClose,
  ratingSelect,
}: PreviewRatingGeneralProps) {
  const { user } = useAuth();
  const { store, dispatchStore } = useContext(MyContext);

  const [rating, setRating] = useState<RatingInterface>({
    ...initialState,
    selectedRating: ratingSelect ?? 0,
  });

  // Sincronizar rating externo
  useEffect(() => {
    if (ratingSelect !== undefined) {
      setRating((prev) => ({ ...prev, selectedRating: ratingSelect }));
    }
  }, [ratingSelect]);

  // Prellenar nombre desde el usuario
  useEffect(() => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      setRating((prev) => ({ ...prev, nombre: fullName }));
    }
  }, [user?.user_metadata?.full_name]);

  const handleSubmit = useCallback(async () => {
    try {
      if (!user?.id) throw new Error("No existe el usuario");
      if (!rating.nombre) throw new Error("No existe el campo de nombre");

      // Bug fix: usar store.sitioweb (string) en lugar de store (objeto) en la URL
      const res = await axios.post(
        `/api/tienda/${store.sitioweb}/coment`,
        {
          comentario: {
            cmt: rating.description,
            star: rating.selectedRating,
          },
          uid: store.UUID,
          uuid: user.id,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.status === 200 || res.status === 201) {
        window.localStorage.setItem(`${store.sitioweb}-userRating`, "ok");
        sileo.success({
          title: "Tarea Ejecutada",
          description: "Comentario realizado",
        });
        dispatchStore({
          type: "AddComent",
          payload: { star: res.data.star },
        });
      }
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      sileo.error({
        title: "Error al enviar el comentario",
        description: "No se pudo enviar el comentario.",
      });
    }
  }, [user, rating, store.sitioweb, store.UUID, dispatchStore]);

  const closeReview = useCallback(() => onClose(), [onClose]);

  const userAvatar = user?.user_metadata?.avatar_url || logoUser;
  const userName = user?.user_metadata?.full_name || "user";

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
});

export default PreviewRatingGeneral;
