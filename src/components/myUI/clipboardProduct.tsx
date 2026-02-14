"use client";
import React, { useState } from "react";
import { toast } from "sonner";
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

  async function copyImageWithTextAsPng() {
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
              "image/png"
            );
          };
          img.onerror = () => reject(new Error("falló carga img"));
          img.src = URL.createObjectURL(originalBlob);
        });

        const item = new ClipboardItem({
          "image/png": pngBlob,
          "text/plain": new Blob([text], { type: "text/plain" }),
        });

        toast.success("Informacion Copiada");

        await navigator.clipboard.write([item]);
      } else {
        const item = new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
        });
        toast("Informacion Copiada");
        await navigator.clipboard.write([item]);
      }
    } catch (err) {
      toast("Error copiando informacion");
      console.error("Error en copyImageWithTextAsPng:", err);
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
        onClick={copyImageWithTextAsPng}
        disabled={busy}
        aria-disabled={busy}
        aria-live="polite"
      >
        {children ?? <RxClipboardCopy />}
      </Button>
    </div>
  );
}
