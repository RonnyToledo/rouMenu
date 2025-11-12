// ============================================
// PROFILE PAGE - Mejorado
// ============================================

"use client";

import React, { useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { userContext } from "@/context/userContext";

export default function ProfilePage() {
  const { events } = useContext(userContext);
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  // Redirect si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.back();
    }
  }, [loading, user, router]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.back();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full">
        <ProfileHeader />

        <div className="">
          <ProfileStats total={events.length} />
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Historial de Compras
        </h2>
        <Link href="/user/compra">
          <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border-0 h-12 text-base rounded-xl">
            Ver Historial Completo
          </Button>
        </Link>
      </div>

      {/* Logout Button */}
      <Button
        variant="outline"
        onClick={() => handleSignOut()}
        className="w-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500 h-12 text-base rounded-xl bg-transparent"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
