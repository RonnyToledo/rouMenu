"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ContectDataInterace,
  DataInterface,
  SectionsInterace,
  SubsectionsInterace,
} from "./json/interfaceTsx";

interface StepByStepSheetProps {
  data: DataInterface;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function StepByStepSheet({
  data,
  activeSection,
  onSectionChange,
}: StepByStepSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSectionClick = (
    section: SectionsInterace,
    subsection?: SubsectionsInterace,
  ) => {
    const targetSlug = subsection ? subsection?.slug : section?.slug;
    router.push(`/info/${targetSlug}`);
    onSectionChange(targetSlug || "");
    setIsOpen(false);
  };

  if (!data) {
    return (
      <Button
        disabled
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-md bg-primary z-50"
      >
        <BookOpen className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-md bg-primary hover:bg-primary/90 z-50 active:scale-95 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 sm:w-96 overflow-y-auto border-border bg-background">
        <SheetHeader>
          <SheetTitle className="font-serif text-foreground">
            Guía de RouAdmin
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Navega por las diferentes secciones de la documentación
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-1">
          {(data.sections || ([] as ContectDataInterace[])).map((section) => (
            <div key={section?.id} className="space-y-0.5">
              <button
                onClick={() => handleSectionClick(section)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors border flex items-center justify-between ${
                  activeSection === section?.slug
                    ? "bg-primary/10 border-primary/30 text-primary font-medium"
                    : "hover:bg-secondary border-transparent text-foreground"
                }`}
              >
                <span>{section?.title}</span>
                {section?.subsections && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>

              {section?.subsections && (
                <div className="ml-3 space-y-0.5 border-l border-border pl-2">
                  {section?.subsections.map(
                    (subsection: SubsectionsInterace) => (
                      <button
                        key={subsection?.id}
                        onClick={() => handleSectionClick(section, subsection)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                          activeSection === subsection?.slug
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {subsection?.title}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 mt-5 space-y-2">
          <p className="text-xs font-medium text-foreground">Enlaces útiles</p>
          <div className="space-y-1 text-xs">
            <a
              href="https://rouadmin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary hover:opacity-75 transition-opacity underline"
            >
              → Acceder a RouAdmin
            </a>
            <a
              href="https://github.com/RonnyToledo/adminWebShop"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary hover:opacity-75 transition-opacity underline"
            >
              → Ver código fuente en GitHub
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
