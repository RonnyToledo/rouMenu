"use client";
import React, { useContext } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { PurchaseHistory } from "./PurchaseHistory";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, session } = useContext(AuthContext);
  if (!loading && !user) {
    router.back();
  }
  console.log(user, session);
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileHeader />
        <ProfileStats />
        <PurchaseHistory />
      </div>
    </div>
  );
}
