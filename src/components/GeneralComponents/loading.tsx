"use client";

import { useState, useEffect } from "react";

export default function PageLoading({
  title = "Cargando página...",
  subtitle = "Preparando contenido",
}: {
  title: string;
  subtitle: string;
}) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div
        className={`text-center space-y-6 transition-opacity duration-500 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Page loading animation */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="page-spin w-16 h-16 border-2 border-muted border-t-primary rounded-full"></div>
            {/* Inner ring */}
            <div className="absolute inset-2 page-spin-reverse border-2 border-muted border-b-accent rounded-full"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        {/* Loading dots indicator */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
