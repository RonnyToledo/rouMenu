import React from "react";
import { ScheduleInterface } from "@/types/InitialStatus";
import {
  IsOpenStoreInteface,
  estadoApertura,
  estadoCierre,
} from "@/functions/time";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/GeneralComponents/DateTime";

export default function OpenClose({
  newHorario,
  open,
  className,
}: {
  newHorario: ScheduleInterface[];
  open: IsOpenStoreInteface;
  className?: string;
}) {
  return (
    <div className={cn("text-muted-foreground text-[9px]", className)}>
      {open?.open ? (
        estadoCierre(newHorario) ? (
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
        "24 horas"
      )}
    </div>
  );
}
