"use client";

import { logoApp } from "@/lib/image";
import type React from "react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import Image from "next/image";
import style from "./styles.module.css";
import { cn } from "@/lib/utils";

const OptionsSelector: React.FC = () => {
  const { generalData } = useApp();
  const [activeOption, setActiveOption] = useState<number>(0);

  const handleOptionClick = (optionId: number) => {
    setActiveOption(optionId);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      />
      <div
        className={cn(
          style.optionsContainer,
          "my-2 p-2 space-y-2 shadow-lg bg-slate-50 dark:bg-slate-900 rounded-lg",
        )}
      >
        <div className="w-full text-start text-slate-800 dark:text-slate-100 font-bold text-lg">
          Catalogos destacados
        </div>
        <div className={style.optionsWrapper}>
          {generalData.catalogs
            .map((o, index) => ({ id: index, ...o }))
            .slice(0, 4)
            .map((option) => (
              <Link
                href={`/t/${option.sitioweb}`}
                key={option.id}
                className={cn(
                  style.optionItem,
                  activeOption === option.id && style.active,
                  "hover:shadow-xl transition-shadow",
                )}
                onClick={() => handleOptionClick(option.id)}
              >
                <Image
                  height={300}
                  width={300}
                  src={option.banner || option.image || logoApp}
                  alt={option.name || ""}
                  className="w-full h-full object-cover object-center"
                  priority={activeOption === option.id}
                />

                <div className={style.optionLabel}>
                  <div
                    className={cn(
                      style.optionIcon,
                      "bg-white dark:bg-slate-700 ring-2 ring-white dark:ring-slate-600 shadow-lg",
                    )}
                  >
                    <Image
                      height={80}
                      width={80}
                      src={option.image || logoApp}
                      alt={option.name || ""}
                      className="rounded-full w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className={cn(style.optionInfo, "drop-shadow-lg")}>
                    <div
                      className={cn(
                        style.optionMain,
                        "font-mono line-clamp-1 text-white",
                      )}
                    >
                      {option.name}
                    </div>
                    <div
                      className={cn(
                        style.optionSub,
                        "font-mono line-clamp-1 text-white/90",
                      )}
                    >
                      {option.tipo}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          <div className={cn(style.inactiveOptions, "mt-4")}>
            {generalData.catalogs
              .map((o, index) => ({ id: index, ...o }))
              .slice(0, 4)
              .map(
                (option) =>
                  option.id !== activeOption && (
                    <div
                      key={option.id}
                      className="relative group cursor-pointer"
                      onClick={() => handleOptionClick(option.id)}
                    >
                      <Image
                        height={80}
                        width={80}
                        src={option.image || logoApp}
                        alt={option.name || ""}
                        className={cn(
                          style.inactiveOption,
                          "ring-2 ring-slate-200 dark:ring-slate-600 hover:ring-4 hover:ring-slate-300 dark:hover:ring-slate-500 transition-all",
                        )}
                      />
                      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 rounded-full group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-colors"></div>
                    </div>
                  ),
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionsSelector;
