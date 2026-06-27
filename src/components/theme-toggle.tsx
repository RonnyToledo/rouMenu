"use client";

import * as React from "react";
import { Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled
      className="rounded-full w-10 h-10"
      aria-label="Tema claro fijo"
    >
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Tema claro fijo</span>
    </Button>
  );
}
