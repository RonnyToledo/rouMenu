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
      <DialogContent className="max-w-md border-border bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-border">
              <Image
                src={imageUser}
                alt={userName}
                width={36}
                height={36}
                className="object-cover"
              />
            </Avatar>
            <div className="flex flex-col">
              <DialogTitle className="text-sm font-semibold text-foreground">
                {userName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Las opiniones son públicas.{" "}
                <span className="underline cursor-pointer">
                  Más información
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nombre"
            className="border-border bg-background text-sm text-foreground placeholder:text-muted-foreground"
            readOnly={!!user}
            value={rating.nombre}
            onChange={(e) =>
              setRating({ ...rating, nombre: e.currentTarget.value })
            }
          />

          {/* Stars — mismo patrón rounded-full bg-secondary del sistema */}
          <div className="flex gap-2 justify-center py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating({ ...rating, selectedRating: star })}
                className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary/10 transition-colors group"
                type="button"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= rating.selectedRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40 group-hover:text-amber-400"
                  }`}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Describe tu experiencia (opcional)"
            className="border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none"
            value={rating.description}
            onChange={(e) =>
              setRating({ ...rating, description: e.currentTarget.value })
            }
            maxLength={500}
          />
          <p className="text-right text-xs text-muted-foreground">
            {rating.description.length}/500
          </p>
        </div>

        <DialogFooter className="flex flex-row items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 text-primary hover:bg-primary/10"
            onClick={async () => {
              try {
                setLoading(true);
                await handleSubmit();
                if (sendToWhatsapp) sendToWhatsapp();
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
              <Spinner className="w-5 h-5 animate-spin" />
            ) : (
              <IoIosSend className="w-5 h-5" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
