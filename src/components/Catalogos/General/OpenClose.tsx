"use client";

import React from "react";
import { ScheduleInterface } from "@/types/InitialStatus";
import {
  isOpenNow,
  estadoCierre,
  estadoApertura,
  isOpen24HoursToday,
} from "@/functions/time";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/GeneralComponents/DateTime";

export default function OpenClose({
  newHorario,
  className,
}: {
  newHorario: ScheduleInterface[];
  open?: unknown; // mantenido por compatibilidad, ya no se usa
  className?: string;
}) {
  const abierto = isOpenNow(newHorario);
  const es24h = isOpen24HoursToday(newHorario);

  return (
    <div className={cn("text-muted-foreground text-[9px]", className)}>
      {abierto ? (
        es24h ? (
          "24 horas"
        ) : estadoCierre(newHorario) ? (
          <>
            Cierra <RelativeTime datetime={estadoCierre(newHorario)} />
          </>
        ) : (
          "24 horas"
        )
      ) : estadoApertura(newHorario) ? (
        <>
          Abre <RelativeTime datetime={estadoApertura(newHorario)} />
        </>
      ) : (
        "Cerrado"
      )}
    </div>
  );
}
