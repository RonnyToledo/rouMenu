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
      className={`border-border shadow-sm transition-all hover:shadow-md gap-2 ${
        reply ? "py-3" : "py-4"
      }`}
    >
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-9 h-9 border border-border">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground leading-none">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formattedDate}
              </p>
            </div>
          </div>
          {/* Rating badge — rounded-full coherente con el sistema */}
          {!reply && star > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full gap-1 border border-border text-xs px-2"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-foreground">{star}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      {cmt && (
        <CardContent className="pb-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{cmt}</p>
        </CardContent>
      )}

      {!reply && (
        <CardFooter className="flex flex-col pt-0">
          <div className="flex gap-1 pb-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8 px-3"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Responder
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border bg-background">
                <DialogHeader>
                  <DialogTitle className="text-foreground text-base">
                    Responder a {user.name}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    Escribe tu respuesta al comentario de {user.name}
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-28 border-border bg-background text-foreground placeholder:text-muted-foreground resize-none text-sm"
                />
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-full text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitReply}
                    disabled={!replyText.trim() || loadingReplies}
                    className="rounded-full gap-2 text-xs"
                  >
                    {loadingReplies ? (
                      <Loader className="animate-spin w-3.5 h-3.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
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
                className="rounded-full gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8 px-3"
              >
                {showReplies ? "Ocultar" : "Ver"} {replies.length}{" "}
                {replies.length === 1 ? "respuesta" : "respuestas"}
              </Button>
            )}
          </div>

          {showReplies && replies && replies.length > 0 && (
            <div className="w-full space-y-1 pl-2 border-l border-border">
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
