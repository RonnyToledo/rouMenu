import { useCallback, useState } from "react";

/**
 * Comparte una URL con el Web Share API si está disponible; si no,
 * la copia al portapapeles y expone `copied` por 2s para feedback visual.
 */
export function useShareOrCopy(feedbackMs = 2000) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(
    async (payload: { title: string; url: string }) => {
      try {
        if (navigator.share) {
          await navigator.share(payload);
          return;
        }
        await navigator.clipboard.writeText(payload.url);
        setCopied(true);
        setTimeout(() => setCopied(false), feedbackMs);
      } catch {
        // Si el share nativo falla (ej: usuario cancela) o clipboard no
        // está disponible, intentamos una copia de respaldo silenciosa.
        await navigator.clipboard.writeText(payload.url).catch(() => null);
        setCopied(true);
        setTimeout(() => setCopied(false), feedbackMs);
      }
    },
    [feedbackMs],
  );

  return { share, copied };
}
