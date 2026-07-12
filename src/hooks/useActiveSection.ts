import { useEffect, useState } from "react";

/**
 * Detecta qué sección (por id) está actualmente "activa" según el scroll,
 * usando la posición de cada elemento en vez de IntersectionObserver para
 * poder aplicar un offset fijo (útil con headers sticky).
 */
export function useActiveSection(sectionIds: string[], offset = 140) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (!sectionIds.length) return;

    let raf = 0;

    const updateActive = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const sections = sectionIds
          .map((id) => document.getElementById(id))
          .filter(Boolean) as HTMLElement[];

        if (!sections.length) return;

        const scrollPos = window.scrollY + offset;
        let current = sections[0];

        for (const section of sections) {
          if (section.offsetTop <= scrollPos) current = section;
          else break;
        }

        setActiveId((prev) =>
          current?.id && current.id !== prev ? current.id : prev,
        );
      });
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
      cancelAnimationFrame(raf);
    };
  }, [sectionIds, offset]);

  return activeId;
}
