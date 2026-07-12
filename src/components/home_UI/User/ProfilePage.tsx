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

  useEffect(() => {
    if (!loading && !user) router.back();
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
      <ProfileHeader />
      <ProfileStats total={events.length} />

      {/* Historial */}
      <div className="mb-4">
        <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
          Historial de Compras
        </h2>
        <Link href="/user/compra">
          <Button className="w-full h-12 rounded-full font-semibold active:scale-[0.98] transition-all">
            Ver Historial Completo
          </Button>
        </Link>
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="w-full h-12 rounded-full border-red-500/40 text-red-500 hover:bg-red-500/10 hover:border-red-500 bg-transparent font-semibold active:scale-[0.98] transition-all gap-2"
      >
        <LogOut className="w-4 h-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
