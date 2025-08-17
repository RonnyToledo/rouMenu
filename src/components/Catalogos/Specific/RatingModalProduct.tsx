"use client";

import React, { FC, useState, useContext, useEffect } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import axios from "axios";
import { toast } from "sonner";
import { initialState, RatingInterface } from "../About/RatingModal";
import { logoUser } from "@/lib/image";

interface RatingModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  userName: string;
  starsSelected: number;
  id: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RatingModalProduct: FC<RatingModalProps> = ({
  isOpen,
  onClose,
  starsSelected,
  userName,
  id,
  setIsModalOpen,
}) => {
  const { store, dispatchStore } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product>();
  const [rating, setRating] = useState<RatingInterface>(initialState);

  useEffect(() => {
    setProduct(store.products.find((obj) => obj.productId == id));
  }, [store.products, id]);

  useEffect(() => {
    setRating((prev) => ({ ...prev, selectedRating: starsSelected }));
  }, [starsSelected]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `/api/tienda/${store}/product/${product?.productId || ""}/coment`,
        {
          comentario: {
            cmt: rating.description,
            star: rating.selectedRating,
            name: rating.nombre,
          },
        },
        { headers: { "Content-Type": "application/json" } } // Cambia a application/json
      );

      if (res.status === 200 || res.status === 201) {
        toast("Tarea Ejecutada", {
          description: "Comentario realizado",
        });
        dispatchStore({
          type: "AddComentProduct",
          payload: { data: res?.data?.value, specific: id },
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error al enviar el comentario:", error);
      toast("Error", {
        description: "No se pudo enviar el comentario.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <Image src={logoUser} alt={userName} width={40} height={40} />
              </Avatar>
              <div className="flex flex-col">
                <DialogTitle className="text-base">{userName}</DialogTitle>
                <p className="text-xs text-gray-400">
                  Las opiniones son públicas.{" "}
                  <span className="underline">Más información</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-blue-400"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </DialogHeader>
        <Input
          placeholder="Nombre"
          className="bg-transparent border-gray-700"
          value={rating.nombre}
          onChange={(e) =>
            setRating({ ...rating, nombre: e.currentTarget.value })
          }
        />

        <div className="flex gap-1 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating({ ...rating, selectedRating: star })}
              className="hover:scale-110 transition-transform"
              type="button"
            >
              <Star
                className={`w-12 h-12 ${
                  star <= rating.selectedRating
                    ? "fill-blue-600 text-blue-600"
                    : "text-gray-400"
                }`}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Describe tu experiencia (opcional)"
          className="bg-transparent border-gray-700"
          value={rating.description}
          onChange={(e) =>
            setRating({ ...rating, description: e.currentTarget.value })
          }
          maxLength={500}
        />
        <div className="text-right text-xs text-gray-400">
          {rating.description.length}/500
        </div>
      </DialogContent>
    </Dialog>
  );
};
