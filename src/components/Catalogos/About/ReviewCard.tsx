"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const diffInDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Hoy";
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ReviewCard = memo(function ReviewCard({
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

  const initials = useMemo(
    () =>
      user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?",
    [user.name],
  );

  const formattedDate = useMemo(() => formatDate(created_at), [created_at]);

  const handleSubmitReply = useCallback(async () => {
    if (!replyText.trim()) return;
    setLoadingReplies(true);
    try {
      const { data: newReply, error } = await supabase
        .from(table)
        .insert([{ cmt: replyText, user_id: userProfile?.id, id_comment: id }])
        .select("*, user(*)")
        .single();

      if (error) throw error;

      setReviews((prevReviews) => {
        const updated = prevReviews.map((review) =>
          review.id === id
            ? {
                ...review,
                replies: review.replies
                  ? [...review.replies, { ...newReply, reply: true } as Review]
                  : [newReply as Review],
              }
            : review,
        );
        return ReordenateData(updated, store);
      });

      setReplyText("");
      setIsDialogOpen(false);
      setShowReplies(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReplies(false);
    }
  }, [replyText, table, userProfile?.id, id, setReviews, store]);

  const toggleReplies = useCallback(() => setShowReplies((v) => !v), []);

  const avatarSrc =
    user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

  return (
    <Card
      className={`transition-all hover:shadow-md gap-2 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-slate-600 ${reply ? "py-3" : "py-4"}`}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-semibold text-sm leading-none text-slate-900 dark:text-slate-100">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground dark:text-slate-500 mt-1">
                {formattedDate}
              </p>
            </div>
          </div>
          {!reply && star > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 dark:bg-slate-900 dark:text-slate-300"
            >
              <Star className="size-3 fill-yellow-500 text-yellow-500" />
              <span>{star}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      {cmt && (
        <CardContent className="pb-0">
          <p className="text-sm text-muted-foreground dark:text-slate-400 leading-relaxed text-pretty">
            {cmt}
          </p>
        </CardContent>
      )}

      {!reply && (
        <CardFooter className="flex flex-col">
          <div className="pt-0 flex gap-2 pb-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <MessageCircle className="size-4" />
                  Responder
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-slate-100">
                    Responder a {user.name}
                  </DialogTitle>
                  <DialogDescription className="dark:text-slate-400">
                    Escribe tu respuesta al comentario de {user.name}
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-32 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || loadingReplies}
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
                onClick={toggleReplies}
                className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {showReplies ? "Ocultar" : "Ver"} {replies.length}{" "}
                {replies.length === 1 ? "respuesta" : "respuestas"}
              </Button>
            )}
          </div>

          {showReplies && replies && replies.length > 0 && (
            <div className="w-full space-y-1">
              {replies.map((r) => (
                <ReviewCard
                  key={r.id ?? `${r.user_id}-${r.created_at}`}
                  {...r}
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
});
