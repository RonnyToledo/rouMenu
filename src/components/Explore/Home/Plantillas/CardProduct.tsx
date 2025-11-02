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
        className={cn(style.optionsContainer, "my-2 p-2 space-y-2 shadow-lg")}
      >
        <div className="w-full text-start text-slate-800 font-bold text-lg">
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
                  activeOption === option.id && style.active
                )}
                onClick={() => handleOptionClick(option.id)}
              >
                <Image
                  height={300}
                  width={300}
                  src={option.banner || option.image || logoApp}
                  alt={option.name || ""}
                  className=" w-full h-full object-cover object-center"
                />

                <div className={style.optionLabel}>
                  <div
                    className={style.optionIcon}
                    style={{
                      color: "#C0C0C0",
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.5)",
                      filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))",
                    }}
                  >
                    <Image
                      height={80}
                      width={80}
                      src={option.image || logoApp}
                      alt={option.name || ""}
                      className="rounded-full  w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className={style.optionInfo}>
                    <div
                      className={cn(style.optionMain, "font-mono line-clamp-1")}
                    >
                      {option.name}
                    </div>
                    <div
                      className={cn(style.optionSub, " font-mono line-clamp-1")}
                    >
                      {option.tipo}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          <div className={style.inactiveOptions}>
            {generalData.catalogs
              .map((o, index) => ({ id: index, ...o }))
              .slice(0, 4)
              .map(
                (option) =>
                  option.id !== activeOption && (
                    <Image
                      key={option.id}
                      height={80}
                      width={80}
                      src={option.image || logoApp}
                      alt={option.name || ""}
                      className={style.inactiveOption}
                      onClick={() => handleOptionClick(option.id)}
                    />
                  )
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OptionsSelector;
