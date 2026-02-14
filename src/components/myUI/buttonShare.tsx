"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { cn } from "@/lib/utils";
type iconType = "icon" | "letter";
type ShareButtonProps = {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  children?: React.ReactNode;
  tipo?: iconType;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

export default function ShareButton({
  title = "Compartir",
  text = "",
  url = typeof window !== "undefined" ? window.location.href : "",
  className,
  children,
  onSuccess,
  onError,
}: ShareButtonProps) {
  const [busy, setBusy] = useState(false);

  async function copyUsingClipboardItem(toCopy: string) {
    // Intentar ClipboardItem moderno
    try {
      // Comprueba que la API esté disponible
      const hasClipboardWrite =
        typeof navigator !== "undefined" &&
        "clipboard" in navigator &&
        typeof navigator.clipboard.write === "function";
      const hasClipboardItem =
        typeof globalThis.ClipboardItem === "function" ||
        typeof window.ClipboardItem === "function";

      if (hasClipboardWrite && hasClipboardItem) {
        const blob = new Blob([toCopy], { type: "text/plain" });
        const item = new globalThis.ClipboardItem({
          "text/plain": blob,
        });
        // navigator.clipboard.write acepta un array de ClipboardItem
        await navigator.clipboard.write([item]);
        return true;
      }
    } catch (err) {
      // Si falla, seguimos con el fallback
      console.warn("ClipboardItem copy falló, fallback a writeText:", err);
    }

    // Fallback: writeText
    try {
      if (
        typeof navigator !== "undefined" &&
        "clipboard" in navigator &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(toCopy);
        return true;
      }
    } catch (err) {
      console.warn("navigator.clipboard.writeText falló:", err);
    }

    return false;
  }

  async function handleShare() {
    setBusy(true);

    const shareData: ShareData = { title, text, url };
    const toCopy = [title, text, url].filter(Boolean).join("\n\n");

    try {
      // 1) Web Share API si está disponible
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);

        onSuccess?.();
        return;
      }

      // 2) Intentar ClipboardItem moderno -> navigator.clipboard.write([ClipboardItem])
      const ok = await copyUsingClipboardItem(toCopy);
      if (ok) {
        onSuccess?.();
        return;
      }

      window.prompt("Copia y comparte:", toCopy);

      onSuccess?.();
    } catch (err) {
      console.error("Share/copy error", err);

      onError?.(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={"ghost"}
        className={cn(
          "text-(--text-gold) hover:underline flex items-center text-lg",
          className
        )}
        onClick={handleShare}
        disabled={busy}
        aria-disabled={busy}
        aria-live="polite"
      >
        {children ?? <FaRegShareFromSquare />}
      </Button>
    </div>
  );
}
