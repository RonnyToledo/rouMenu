"use client";
import React, { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { logoUser } from "@/lib/image";

export function ProfileHeader() {
  const { user, loading } = useContext(AuthContext);
  return (
    <div className="mb-12">
      <div className="flex  items-start justify-center">
        <div className="flex flex-col items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage
              src={
                user?.user_metadata.avatar ||
                user?.user_metadata.picture ||
                logoUser
              }
              alt="Usuario"
            />
            <AvatarFallback className="text-2xl font-medium bg-secondary text-secondary-foreground">
              {user?.user_metadata.full_name.charAt(0) ||
                (user?.email || "").charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-serif font-light tracking-tight text-foreground mb-2">
              {user?.user_metadata.full_name || user?.email || "Usuario"}
            </h1>
            <p className="text-muted-foreground text-lg">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
