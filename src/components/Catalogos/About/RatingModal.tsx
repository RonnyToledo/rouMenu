"use client";

import React, { FC, useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { logoUser } from "@/lib/image";
import { IoIosSend } from "react-icons/io";
import { Spinner } from "@/components/ui/spinner";

interface RatingModalProps {
  isOpen: boolean;
  rating: RatingInterface;
  userName: string;
  user?: string;
  imageUser?: string;
  onClose: (open: boolean) => void;
  setRating: React.Dispatch<React.SetStateAction<RatingInterface>>;
  sendToWhatsapp?: () => void;
  handleSubmit: () => Promise<void>;
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
  userName,
  imageUser = logoUser,
  user,
  sendToWhatsapp,
  handleSubmit,
  rating,
  setRating,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <Image src={imageUser} alt={userName} width={40} height={40} />
              </Avatar>
              <div className="flex flex-col">
                <DialogTitle className="text-base">{userName}</DialogTitle>
                <p className="text-xs text-slate-400">
                  Las opiniones son públicas.{" "}
                  <span className="underline">Más información</span>
                </p>
              </div>
            </div>
            <div></div>
          </div>
        </DialogHeader>
        <div className="space-y-1">
          <Input
            placeholder="Nombre"
            className="bg-transparent border-slate-300 text-sm"
            readOnly={!!user}
            value={rating.nombre}
            onChange={(e) =>
              setRating({ ...rating, nombre: e.currentTarget.value })
            }
          />

          <div className="flex gap-1 my-2 justify-center items-center">
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
                      : "text-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Describe tu experiencia (opcional)"
            className="bg-transparent border-slate-300 text-xs"
            value={rating.description}
            onChange={(e) =>
              setRating({ ...rating, description: e.currentTarget.value })
            }
            maxLength={500}
          />
          <div className="text-right text-xs text-slate-400">
            {rating.description.length}/500
          </div>
        </div>
        <DialogFooter className="flex flex-row items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-400"
            onClick={async () => {
              try {
                setLoading(true);
                await handleSubmit();
                if (sendToWhatsapp) {
                  sendToWhatsapp();
                }
                onClose(false);
              } catch (error) {
                console.error("Error submitting rating:", error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <Spinner className="size-8 animate-spin" />
            ) : (
              <IoIosSend className="size-8" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
