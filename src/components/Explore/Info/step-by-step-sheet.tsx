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
    subsection?: SubsectionsInterace
  ) => {
    const targetSlug = subsection ? subsection?.slug : section?.slug;

    router.push(`/info/${targetSlug}`);

    onSectionChange(targetSlug || "");
    setIsOpen(false);
  };

  if (!data) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 z-50"
        disabled
      >
        <BookOpen className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 z-50"
          onClick={() => setIsOpen(true)}
        >
          <BookOpen className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-emerald-700">Guía de RouAdmin</SheetTitle>
          <SheetDescription>
            Navega por las diferentes secciones de la documentación
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {(data.sections || ([] as ContectDataInterace[])).map((section) => (
            <div key={section?.id} className="space-y-1">
              <button
                onClick={() => handleSectionClick(section)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 border flex items-center justify-between ${
                  activeSection === section?.slug
                    ? "bg-emerald-100 border-emerald-300 shadow-sm text-emerald-700 font-medium"
                    : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                }`}
              >
                <span>{section?.title}</span>
                {section?.subsections && <ChevronRight className={`h-4 w-4`} />}
              </button>

              {section?.subsections && (
                <div className="ml-4 space-y-1">
                  {section?.subsections.map(
                    (subsection: SubsectionsInterace) => (
                      <button
                        key={subsection?.id}
                        onClick={() => handleSectionClick(section, subsection)}
                        className={`w-full text-left p-2 rounded text-sm transition-all duration-200 ${
                          activeSection === subsection?.slug
                            ? "bg-emerald-50 text-emerald-600 font-medium"
                            : "hover:bg-slate-50 text-muted-foreground"
                        }`}
                      >
                        {subsection?.title}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enlaces útiles */}
        <div className="border-t pt-4 mt-6 space-y-2">
          <h4 className="font-medium text-sm">Enlaces útiles:</h4>
          <div className="space-y-1 text-sm">
            <a
              href="https://rouadmin.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-emerald-600 hover:text-emerald-700 underline transition-colors"
            >
              → Acceder a RouAdmin
            </a>
            <a
              href="https://github.com/RonnyToledo/adminWebShop"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-emerald-600 hover:text-emerald-700 underline transition-colors"
            >
              → Ver código fuente en GitHub
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
