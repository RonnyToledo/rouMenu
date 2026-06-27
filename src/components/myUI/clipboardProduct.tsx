"use client";
import React, { useState } from "react";
import { sileo } from "sileo";
import { Button } from "../ui/button";
import { RxClipboardCopy } from "react-icons/rx";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

type ProductMode = {
  mode?: "product";
  title: string;
  descripcion: string;
  url?: string;
  price: number;
  oldPrice: number;
};

type SectionMode = {
  mode: "section";
  title: string; // section.label
  descripcion: string; // section.content
  url?: never;
  price?: never;
  oldPrice?: never;
};

type ClipboardProductProps = (ProductMode | SectionMode) & {
  children?: React.ReactNode;
  className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClipboardProduct({
  mode = "product",
  title,
  descripcion,
  url,
  price,
  oldPrice,
  className,
  children,
}: ClipboardProductProps) {
  const [busy, setBusy] = useState(false);

  function buildText(): string {
    if (mode === "section") {
      return [title, descripcion].filter(Boolean).join("\n\n");
    }

    let text = `${title}\n`;
    text += `Precio: $${Number(price).toFixed(2)}`;
    if ((oldPrice ?? 0) > (price ?? 0)) {
      text += ` ~~$${Number(oldPrice).toFixed(2)}~~`;
    }
    text += `\n`;
    if (descripcion) {
      text += `Descripción:\n${descripcion}\n`;
    }
    return text;
  }

  async function copyToClipboard(): Promise<{
    title: string;
    description: string;
  }> {
    setBusy(true);
    const text = buildText();

    try {
      if (mode === "product" && url) {
        const res = await fetch(url);
        const originalBlob = await res.blob();

        const pngBlob: Blob = await new Promise<Blob>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d")?.drawImage(img, 0, 0);
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("no PNG"))),
              "image/png",
            );
          };
          img.onerror = () => reject(new Error("falló carga img"));
          img.src = URL.createObjectURL(originalBlob);
        });

        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": pngBlob,
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
          }),
        ]);
      }

      return {
        title: "Información Copiada",
        description: "La información ha sido copiada al portapapeles.",
      };
    } catch (err) {
      console.error("Error en copyToClipboard:", err);
      return {
        title: "Error",
        description: "Error copiando información",
      };
    } finally {
      setBusy(false);
    }
  }

  function handleClick() {
    sileo.promise(copyToClipboard(), {
      loading: { title: "Copiando..." },
      success: (data) => ({
        title: data?.title ?? "Información Copiada",
        description:
          data?.description ??
          "La información ha sido copiada al portapapeles.",
      }),
      error: () => ({
        title: "Error",
        description: "Error copiando información",
      }),
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "text-product bg-radial from-product/20 to-transparent hover:underline flex items-center text-lg p-2! rounded-full",
        className,
      )}
      onClick={handleClick}
      disabled={busy}
      aria-disabled={busy}
      aria-live="polite"
    >
      {children ?? <RxClipboardCopy />}
    </Button>
  );
}
