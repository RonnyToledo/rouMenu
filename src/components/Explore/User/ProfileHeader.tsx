"use client";
import React from "react";
import { useAuth } from "@/context/AppContext";
import { logoUser } from "@/lib/image";
import Image from "next/image";

export function ProfileHeader() {
  const { user } = useAuth();
  return (
    <div className="mb-10">
      <div className="text-center mb-6">
        <div className="relative w-28 h-28 mx-auto mb-4">
          <Image
            src={
              user?.user_metadata.avatar ||
              user?.user_metadata.picture ||
              logoUser
            }
            alt="Profile"
            width={112}
            height={112}
            className="rounded-full object-cover border-2 border-border w-full h-full"
          />
        </div>
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">
          {user?.user_metadata.full_name || user?.email || "Usuario"}
        </h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
}
