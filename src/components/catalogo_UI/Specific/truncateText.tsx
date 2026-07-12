"use client";

import { useState, useLayoutEffect, useRef } from "react";
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

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * lines;
      const actualHeight = element.scrollHeight;
      setShouldClamp(actualHeight > maxHeight);
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [lines]);

  function getLines(line: number) {
    const map: Record<number, string> = {
      1: "line-clamp-1",
      2: "line-clamp-2",
      3: "line-clamp-3",
      4: "line-clamp-4",
      5: "line-clamp-5",
      6: "line-clamp-6",
    };
    return map[line] ?? "line-clamp-5";
  }

  return (
    <div className="space-y-0">
      <motion.div
        layout
        initial={false}
        transition={{ duration: 0.33, ease: [0.22, 0.9, 0.23, 1] }}
        className="overflow-hidden"
      >
        <motion.p
          ref={textRef}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "whitespace-pre-line text-sm text-muted-foreground leading-relaxed",
            !expanded && shouldClamp ? getLines(lines) : "",
            className,
          )}
          aria-expanded={expanded}
        >
          {text}
        </motion.p>
      </motion.div>

      {/* Botón — alineado con Button ghost/link del resto de la UI */}
      <AnimatePresence initial={false}>
        {shouldClamp && (
          <motion.div
            key="ver-mas-btn"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-0 h-auto text-xs font-medium text-primary hover:text-primary/80 hover:bg-transparent rounded-full",
                className,
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
