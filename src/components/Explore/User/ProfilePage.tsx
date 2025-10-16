// ============================================
// PROFILE PAGE - Mejorado
// ============================================

"use client";

import React, { useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LiaSignOutAltSolid } from "react-icons/lia";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { PurchaseHistory } from "./PurchaseHistory";
import { userContext } from "@/context/userContext";

type FilterType = "all" | "completed" | "shipped";

export default function ProfilePage() {
  const { events } = useContext(userContext);
  const router = useRouter();
  const { user, loading, signOut } = useContext(AuthContext);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <ProfileHeader />

        <div className="space-y-8">
          <ProfileStats total={events.length} />
          <PurchaseHistory
            events={events}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>
      </div>

      <div className="sticky bottom-0 p-4 bg-background border-t">
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleSignOut}
        >
          Cerrar Sesión
          <LiaSignOutAltSolid />
        </Button>
      </div>
    </div>
  );
}
