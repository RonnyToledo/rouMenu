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
import axios from "axios";
import { toast } from "sonner";
import { logoUser } from "@/lib/image";

interface RatingModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  userName: string;
  starsSelected: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sendToWhatsapp?: () => void;
}
export interface RatingInterface {
  nombre: string;
  description: string;
  selectedRating: number;
}
export const initialState = {
  nombre: "",
  description: "",
  selectedRating: 0,
};

export const Rating: FC<RatingModalProps> = ({
  isOpen,
  onClose,
  starsSelected,
  userName,
  setIsModalOpen,
  sendToWhatsapp,
}) => {
  const { store, dispatchStore } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<RatingInterface>(initialState);

  useEffect(() => {
    setRating((prev) => ({ ...prev, selectedRating: starsSelected }));
  }, [starsSelected]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!rating.nombre) {
        throw new Error("No existe el campo de nombre");
      }
      const res = await axios.post(
        `/api/tienda/${store}/coment`,
        {
          comentario: {
            cmt: rating.description,
            star: rating.selectedRating,
            name: rating.nombre,
          },
          uid: store.UUID,
        },
        { headers: { "Content-Type": "application/json" } } // Cambia a application/json
      );

      if (res.status === 200 || res.status === 201) {
        window.localStorage.setItem(`${store.sitioweb}-userRating`, "ok");
        toast("Tarea Ejecutada", {
          description: "Comentario realizado",
        });
        dispatchStore({
          type: "AddComent",
          payload: { star: res.data.star },
        });
        setIsModalOpen(false);
        if (sendToWhatsapp) {
          sendToWhatsapp();
        }
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
              variant="outline"
              className="text-blue-400"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            placeholder="Nombre"
            className="bg-transparent border-gray-300 text-sm"
            value={rating.nombre}
            onChange={(e) =>
              setRating({ ...rating, nombre: e.currentTarget.value })
            }
          />

          <div className="flex gap-1 my-4 justify-center items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating({ ...rating, selectedRating: star })}
                className="hover:scale-110 transition-transform "
                type="button"
              >
                <Star
                  className={`w-8 h-8 ${
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
            className="bg-transparent border-gray-300 text-xs"
            value={rating.description}
            onChange={(e) =>
              setRating({ ...rating, description: e.currentTarget.value })
            }
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400">
            {rating.description.length}/500
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
