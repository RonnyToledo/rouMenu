import { useEffect, useRef, useState } from "react";

/**
 * Detecta cuándo un elemento "sentinel" sale del viewport para poder
 * animar/ocultar un header sticky. Reutilizable en cualquier página
 * que necesite este patrón (ya se usa la misma idea en el header
 * principal y en CategoryStickyBar).
 */
export function useStickyHeader(hiddenOffsetPx = 49) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: `-${hiddenOffsetPx}px 0px 0px 0px`, threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hiddenOffsetPx]);

  return { sentinelRef, isStuck };
}
