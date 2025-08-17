"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [shouldClamp, setShouldClamp] = useState(false);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textRef.current).lineHeight
      );
      const maxHeight = lineHeight * 5; // 2 líneas
      const actualHeight = textRef.current.scrollHeight;

      // Solo activar truncado si el texto ocupa más de 2 líneas
      if (actualHeight > maxHeight) {
        setShouldClamp(true);
      }
    }
  }, [text]);

  return (
    <div className="space-y-0">
      <p
        ref={textRef}
        className={`whitespace-pre-line text-gray-700 ${
          !expanded && shouldClamp ? "line-clamp-5" : ""
        }`}
      >
        {text}
      </p>

      {shouldClamp && (
        <Button
          variant="link"
          className="p-0 m-0 h-auto text-sm max-w-24 truncate"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Ver menos" : "Ver más"}
        </Button>
      )}
    </div>
  );
}
