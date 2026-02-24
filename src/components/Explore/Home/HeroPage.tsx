"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { logoApp } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { ScrollTo } from "@/functions/ScrollTo";

type ArcGalleryHeroProps = {
  images: string[];
  // angle range in degrees (e.g., -110 to 110 for a nice top arc)
  startAngle?: number;
  endAngle?: number;
  // radius as a tailwind-friendly pixel value
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  // size of each card
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  // optional extra class on outer section
  className?: string;
};

const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 30,
  endAngle = 150,
  radiusLg = 340,
  radiusMd = 280,
  radiusSm = 200,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = "",
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);
  // Ensure at least 2 points to distribute angles
  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section className={`relative overflow-hidden  flex flex-col ${className}`}>
      {/* Background ring container that controls geometry */}
      <div
        className="relative mx-auto"
        style={{
          width: "100%",
          height: dimensions.radius * 1.2,
        }}
      >
        {/* Center pivot for transforms - positioned at bottom center */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-10 h-full w-full">
          {/* Each image is positioned on the circle and rotated to face outward */}
          {images.map((src, i) => {
            const angle = startAngle + step * i; // degrees
            const angleRad = (angle * Math.PI) / 180;

            // Calculate x and y positions
            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;

            return (
              <div
                key={i}
                className="absolute  animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: "forwards",
                  zIndex: count - i,
                }}
              >
                <div
                  className="rounded-2xl shadow-xl dark:shadow-slate-950/50 overflow-hidden ring-1 ring-border dark:ring-slate-700 bg-card dark:bg-slate-900 transition-transform hover:scale-105 w-full h-full"
                  style={{ transform: `rotate(${angle / 4}deg)` }}
                >
                  <Image
                    src={src || logoApp}
                    alt=""
                    className="block w-full h-full object-cover"
                    draggable={false}
                    width={200}
                    height={200}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content positioned below the arc */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div
          className="text-center max-w-2xl px-6 animate-fade-in"
          style={{ animationDelay: "800ms", animationFillMode: "forwards" }}
        >
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground dark:text-slate-100">
            Bienvenidos a RouMenu
          </h1>
          <p className="mt-4 text-lg text-muted-foreground dark:text-slate-400">
            Donde la creatividad se encuentra con la simplicidad
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => ScrollTo("main-general")}
              className="w-full py-3 bg-linear-to-r from-slate-700 via-slate-800 to-slate-700 dark:from-slate-600 dark:via-slate-700 dark:to-slate-600 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 dark:hover:from-slate-500 dark:hover:via-slate-400 dark:hover:to-slate-500 text-white hover:text-slate-800 dark:hover:text-slate-100 px-8 transform hover:scale-105 transition-all duration-800 shadow-lg hover:shadow-xl hover:border dark:hover:border-slate-600"
            >
              Explorar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcGalleryHero;
