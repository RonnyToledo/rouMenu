"use client";

import { useMemo } from "react";
import {
  isOpenNow,
  estadoCierre,
  estadoApertura,
  isOpen24Hours,
  isOpen24HoursToday,
} from "@/functions/time";
import "@github/relative-time-element";

function useScheduleStatus(horario) {
  const abierto = useMemo(() => isOpenNow(horario), [horario]);
  const es24x7 = useMemo(() => isOpen24Hours(horario), [horario]);
  const es24hHoy = useMemo(() => isOpen24HoursToday(horario), [horario]);
  const cierre = useMemo(() => estadoCierre(horario), [horario]);
  const apertura = useMemo(() => estadoApertura(horario), [horario]);
  return { abierto, es24x7, es24hHoy, cierre, apertura };
}

export function StoreState({ schedule }) {
  const { abierto } = useScheduleStatus(schedule);
  return (
    <div className="flex items-center gap-1">
      <div
        className={`size-2 rounded-full ${abierto ? "bg-green-500" : "bg-red-500"}`}
        aria-hidden
      />
      <span className="text-xs font-semibold text-on-surface dark:text-inverse-on-surface">
        {abierto ? "Abierta" : "Cerrada"}
      </span>
    </div>
  );
}

export function NextChange({ schedule }) {
  const { abierto, es24x7, es24hHoy, cierre, apertura } =
    useScheduleStatus(schedule);

  if (es24x7)
    return (
      <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
        Abierta 24h · 7 días
      </span>
    );

  if (abierto) {
    if (es24hHoy || !cierre)
      return (
        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
          Abierto 24h hoy
        </span>
      );
    return (
      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
        Cierra{" "}
        <relative-time
          datetime={cierre.toISOString()}
          tense="future"
          format="relative"
          lang="es"
        />
      </span>
    );
  }

  if (!apertura) return null;
  return (
    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
      Abre{" "}
      <relative-time
        datetime={apertura.toISOString()}
        tense="future"
        format="relative"
        lang="es"
      />
    </span>
  );
}
