import React from "react";
import UserContextProvider from "@/context/userContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <UserContextProvider>{children}</UserContextProvider>
    </div>
  );
}
