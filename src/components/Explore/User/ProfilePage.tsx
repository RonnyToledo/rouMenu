"use client";
import React, { useContext } from "react";
import { ProfileHeader } from "./ProfileHeader";
//import { ProfileStats } from "./ProfileStats";
//import { PurchaseHistory } from "./PurchaseHistory";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LiaSignOutAltSolid } from "react-icons/lia";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useContext(AuthContext);
  if (!loading && !user) {
    router.back();
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-svh mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileHeader />
        {/*  <ProfileStats />
        <PurchaseHistory /> */}
      </div>

      <div className="sticky bottom-0 p-4">
        <Button
          className="w-full"
          variant="destructive"
          onClick={async () => {
            await signOut();
            router.back();
          }}
        >
          Cerrar Session
          <LiaSignOutAltSolid />
        </Button>
      </div>
    </div>
  );
}
