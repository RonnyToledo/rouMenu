"use client";
import React from "react";
import { useAuth } from "@/context/AppContext";
import { logoUser } from "@/lib/image";
import Image from "next/image";

export function ProfileHeader() {
  const { user } = useAuth();
  return (
    <div className="mb-12">
      <div className="">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <Image
              src={
                user?.user_metadata.avatar ||
                user?.user_metadata.picture ||
                logoUser
              }
              alt="Profile"
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-slate-700"
            />
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {user?.user_metadata.full_name || user?.email || "Usuario"}
          </h1>
          <p className="text-slate-700">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
