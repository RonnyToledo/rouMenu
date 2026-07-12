import React, { useEffect, useRef } from "react";
import { Categoria } from "@/types/InitialStatus";
import { Button } from "@/components/ui/button";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import { ScrollTo } from "@/functions/ScrollTo";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const SCROLL_STEP_PX = 260;

export function CategoryStickyBar({
  categories,
  activeId,
  isStuck,
}: {
  categories: Categoria[];
  activeId: string;
  isStuck: boolean;
}) {
  const { generalData } = useApp();
  const listRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeChip = chipRefs.current[activeId];
    if (!activeChip) return;
    activeChip.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  const scroll = (dir: "left" | "right") => {
    listRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_STEP_PX : SCROLL_STEP_PX,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="w-full max-w-md z-10 bg-background/80 backdrop-blur-md border-b border-border transition-transform duration-300 sticky top-12"
      style={{
        transform: !(isStuck && generalData.top_hidden)
          ? "translateY(0)"
          : "translateY(-48px)",
      }}
    >
      <div className="relative flex items-center gap-2 px-1 py-2">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10 bg-linear-to-r from-background to-transparent" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 z-20 rounded-full h-7 md:h-9"
        >
          <MdNavigateBefore />
        </Button>

        <div
          ref={listRef}
          className="flex gap-2 overflow-x-auto no-scrollbar flex-1 px-12 h-8"
        >
          {categories.map((cat) => {
            const active = cat.id === activeId;
            return (
              <Button
                key={cat.id}
                ref={(el) => {
                  chipRefs.current[cat.id] = el;
                }}
                onClick={() => ScrollTo(cat.id, 90)}
                variant="outline"
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all",
                  "shrink-0 whitespace-nowrap h-7 md:h-9",
                  "max-w-[60vw] md:max-w-55",
                  active
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-border hover:bg-secondary",
                )}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-linear-to-l from-background to-transparent" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 z-20 rounded-full h-7 md:h-9"
        >
          <MdNavigateNext />
        </Button>
      </div>
    </div>
  );
}
