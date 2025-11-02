"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
export default function ExpandableText({
  text,
  className,
  lines = 5,
}: {
  text: string;
  className?: string;
  lines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [shouldClamp, setShouldClamp] = useState(false);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textRef.current).lineHeight
      );
      const maxHeight = lineHeight * lines; // 2 líneas
      const actualHeight = textRef.current.scrollHeight;

      // Solo activar truncado si el texto ocupa más de 2 líneas
      if (actualHeight > maxHeight) {
        setShouldClamp(true);
      }
    }
  }, [lines]);
  function getLines(line: number) {
    switch (line) {
      case 1:
        return "line-clamp-1";
      case 2:
        return "line-clamp-2";
      case 3:
        return "line-clamp-3";
      case 4:
        return "line-clamp-4";
      case 5:
        return "line-clamp-5";
      case 6:
        return "line-clamp-6";
      default:
        return "line-clamp-5";
    }
  }
  return (
    <div className="space-y-0">
      {/* contenedor que anima el cambio de layout (altura) */}
      <motion.div
        layout
        initial={false}
        transition={{ duration: 0.33, ease: [0.22, 0.9, 0.23, 1] }}
        className="overflow-hidden"
      >
        <motion.p
          // ref sigue igual para medir/clamp si lo usas
          ref={textRef}
          layout
          initial={{ opacity: 0.0 }}
          animate={{ opacity: 1.0 }}
          exit={{ opacity: 0.0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            `whitespace-pre-line text-slate-700`,
            !expanded && shouldClamp ? getLines(lines) : "",
            className
          )}
          aria-expanded={expanded}
        >
          {text}
        </motion.p>
      </motion.div>

      {/* botón con entrada/salida animada */}
      <AnimatePresence initial={false}>
        {shouldClamp && (
          <motion.div
            key="ver-mas-btn"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Button
              variant="link"
              className={cn(
                "p-0 m-0 h-auto text-sm max-w-24 truncate",
                className
              )}
              onClick={() => setExpanded(!expanded)}
              aria-controls="descripcion"
              aria-expanded={expanded}
            >
              {expanded ? "Ver menos" : "Ver más"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
