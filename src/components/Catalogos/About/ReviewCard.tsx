"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "./CommentPage";
import { Star, MessageCircle, Send, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AppContext";
import { ReordenateData } from "@/functions/ReordenateDataReviews";
import { MyContext } from "@/context/MyContext";

export function ReviewCard({
  created_at,
  star,
  cmt,
  user,
  reply,
  replies,
  id,
  setReviews,
  table = "replies",
}: Review & {
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  table?: string;
}) {
  const { user: userProfile } = useAuth();
  const { store } = React.useContext(MyContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Hoy";
    if (diffInDays === 1) return "Ayer";
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    try {
      setLoadingReplies(true);
      const { data: replies, error: err } = await supabase
        .from(table)
        .insert([
          {
            cmt: replyText,
            user_id: userProfile?.id,
            id_comment: id,
          },
        ])
        .select("* ,user(*)")
        .single();

      if (err) {
        throw err;
      }
      setReviews((prevReviews: Review[]) => {
        const dataIn = prevReviews.map((review) =>
          review.id === id
            ? {
                ...review,
                replies: review.replies
                  ? [...review.replies, { ...replies, reply: true } as Review]
                  : [replies as Review],
              }
            : review
        );
        const data = ReordenateData(dataIn, store);
        return data;
      });
      setReplyText("");
      setIsDialogOpen(false);
      setShowReplies(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReplies(false);
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md gap-2 ${reply ? "py-3" : "py-4"}`}
    >
      <CardHeader className={`${reply ? "pb-0" : "pb-0"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage
                src={
                  user.image ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                }
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-semibold text-sm leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(created_at)}
              </p>
            </div>
          </div>
          {!reply && star > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Star className="size-3 fill-yellow-500 text-yellow-500" />
              <span>{star}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      {cmt && (
        <CardContent className={`${reply ? "pb-0" : "pb-0"}`}>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            {cmt}
          </p>
        </CardContent>
      )}

      {!reply && (
        <CardFooter className="flex flex-col">
          <div className="pt-0 flex gap-2 pb-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle className="size-4" />
                  Responder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Responder a {user.name}</DialogTitle>
                  <DialogDescription>
                    Escribe tu respuesta al comentario de {user.name}
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-32"
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim()}
                    className="gap-2"
                  >
                    {loadingReplies ? (
                      <Loader className="animate-spin size-4" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Enviar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {replies && replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="gap-2"
              >
                {showReplies ? "Ocultar" : "Ver"} {replies.length}{" "}
                {replies.length === 1 ? "respuesta" : "respuestas"}
              </Button>
            )}
          </div>

          {showReplies && replies && replies.length > 0 && (
            <div className="w-full space-y-1">
              {replies.map((reply) => (
                <ReviewCard
                  key={reply.id}
                  {...reply}
                  setReviews={setReviews}
                  table={table}
                />
              ))}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
