"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableOfContentsProps {
  headings: { id: string; text: string; level: number }[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Espacio desde el top (útil si tienes navbar fijo)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Actualiza la URL sin recargar la página
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="my-8 border rounded-lg bg-muted/30">
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto font-semibold text-base hover:bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        Tabla de Contenidos
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>
      {isOpen ? (
        <div className="px-4 pb-4">
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
