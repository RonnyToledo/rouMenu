"use client";
import React, { useState } from "react";
import { sileo } from "sileo";
import { Button } from "../ui/button";
import { RxClipboardCopy } from "react-icons/rx";
import { cn } from "@/lib/utils";

export default function ClipboardProduct({
  title,
  url,
  descripcion,
  price,
  oldPrice,
  className,
  children,
}: {
  url: string | undefined;
  title: string;
  descripcion: string;
  price: number;
  oldPrice: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function copyImageWithTextAsPng(): Promise<{
    title: string;
    description: string;
  }> {
    setBusy(true);
    let text = `${title}\n`;
    text += `Precio: $${Number(price).toFixed(2)} `;
    if (oldPrice > price) {
      text += `$~${Number(oldPrice).toFixed(2)}~`;
    }
    text += `\n`;
    if (descripcion) {
      text += `Descripcion:\n${descripcion}\n`;
    }
    try {
      if (url && url !== undefined) {
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

        const item = new ClipboardItem({
          "image/png": pngBlob,
          "text/plain": new Blob([text], { type: "text/plain" }),
        });

        return {
          title: "Información Copiada",
          description:
            "La información del producto ha sido copiada al portapapeles.",
        };

        await navigator.clipboard.write([item]);
      } else {
        const item = new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
        return {
          title: "Información Copiada",
          description:
            "La información del producto ha sido copiada al portapapeles.",
        };
      }
    } catch (err) {
      console.error("Error en copyImageWithTextAsPng:", err);
      return {
        title: "Error",
        description: "Error copiando información",
      };
    } finally {
      setBusy(false);
    }
  }
  async function CopyBoard() {
    sileo.promise(copyImageWithTextAsPng(), {
      loading: { title: "Loading..." },
      success: (data) => ({
        title: data?.title || "Información Copiada",
        description:
          data?.description ||
          "La información del producto ha sido copiada al portapapeles.",
      }),
      error: () => ({
        title: "Error",
        description: "Error copiando información",
      }),
    });
  }
  return (
    <div>
      <Button
        type="button"
        variant={"ghost"}
        className={cn(
          "text-(--text-gold) hover:underline flex items-center text-lg",
          className,
        )}
        onClick={CopyBoard}
        disabled={busy}
        aria-disabled={busy}
        aria-live="polite"
      >
        {children ?? <RxClipboardCopy />}
      </Button>
    </div>
  );
}
