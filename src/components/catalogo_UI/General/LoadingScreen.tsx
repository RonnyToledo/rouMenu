"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import type { StoreComment } from "@/lib/getStoreComments";
import Image from "next/image";
import { logoApp } from "@/lib/image";

interface LoadingScreenProps {
  comments: StoreComment[];
  onLoadComplete?: () => void;
  loadingDuration?: number;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LoadingScreen({
  comments,
  onLoadComplete,
  loadingDuration = 8000,
}: LoadingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const validComments = comments.filter((c) => c.star > 0);

  useEffect(() => {
    if (validComments.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % validComments.length);
        setIsTransitioning(false);
      }, 300);
    }, 3200);
    return () => clearInterval(interval);
  }, [validComments.length]);

  useEffect(() => {
    const step = 100 / (loadingDuration / 100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 100);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [loadingDuration]);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        setIsVisible(false);
        onLoadComplete?.();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [progress, onLoadComplete]);

  if (!isVisible) return null;

  const current = validComments[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10 px-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary">
            <Image
              src={logoApp}
              alt="Logo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            Preparando tu experiencia
          </h1>
        </div>

        {/* Review card */}
        {current ? (
          <div
            className={`w-full transition-all duration-300 ${
              isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <div className="relative rounded-2xl border border-border bg-card p-8 shadow-sm">
              <Quote className="absolute right-6 top-6 h-7 w-7 text-muted-foreground/20" />

              {/* Stars arriba, estilo pill como el rating del hero */}
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < current.star
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              {current.cmt && (
                <p className="mb-6 text-base leading-relaxed text-foreground/90 line-clamp-6">
                  &ldquo;{current.cmt}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {current.user?.image ? (
                    <Image
                      width={50}
                      height={50}
                      src={current.user.image}
                      alt={current.user.name ?? "Usuario"}
                      className="h-11 w-11 rounded-full border-2 border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-medium text-muted-foreground">
                      {getInitials(current.user?.name)}
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-foreground">
                      {current.user?.name ?? "Usuario anónimo"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(current.created_at).toLocaleDateString(
                        "es-ES",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Cargando reseñas...
          </div>
        )}

        {/* Dots */}
        {validComments.length > 1 && (
          <div className="flex gap-2">
            {validComments.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(i);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted hover:bg-muted-foreground/30"
                }`}
                aria-label={`Ver reseña ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="w-full max-w-md space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Cargando datos... {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
