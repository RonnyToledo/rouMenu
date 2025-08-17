"use client";

import React, { FC } from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "@formkit/tempo";
import { Review } from "./CommentPage";

export const ReviewCard: FC<Review> = ({ name, created_at, star, cmt }) => {
  return (
    <div className="py-2">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
              {(name || "A").charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarImage src="/placeholder.svg" alt={name} />
          </Avatar>
          <div>
            <h3 className="font-medium">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((ind) => (
                  <Star
                    key={ind}
                    className={`w-4 h-4 ${
                      ind <= star
                        ? "fill-blue-400 text-blue-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {format(created_at, "short")}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400"></Button>
      </div>
      <p className="mt-2 text-gray-500">{cmt ?? "— sin comentario —"}</p>
    </div>
  );
};
