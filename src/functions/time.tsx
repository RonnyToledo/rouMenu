import { ScheduleInterface } from "@/context/InitialStatus";
export interface IsOpenStoreInteface {
  week: number;
  open: boolean;
}

interface TimeRemaining {
  horas: number;
  minutos: number;
  segundos: number;
}

interface AperturaResult {
  apertura: Date;
  cierre: Date;
  abierto: boolean;
  tiempoRestante: TimeRemaining;
}

interface CierreResult {
  apertura: Date;
  cierre: Date;
  cerrado: boolean;
  tiempoRestante: TimeRemaining;
}

export function isOpen(newHorario: ScheduleInterface[]): IsOpenStoreInteface {
  const now = new Date();

  let element;
  for (let index = 0; index < newHorario.length; index++) {
    const apertura = new Date(newHorario[index]?.apertura);
    const cierre = new Date(newHorario[index]?.cierre);
    if (!(newHorario[index]?.apertura == newHorario[index]?.cierre)) {
      if (apertura <= now && cierre > now) {
        element = {
          week: apertura.getDay() % 7,
          open: true,
        };
      }
    }
  }
  if (element) {
    return element;
  } else {
    return { week: 7, open: false }; // Está cerrado
  }
}

/**
 * Devuelve la fecha de la próxima apertura (o null si no la hay)
 */
export function estadoApertura(fechas: ScheduleInterface[]): Date | null {
  const ahora = new Date();
  const resultados: AperturaResult[] = fechas.map(({ apertura, cierre }) => {
    const aperturaInit = new Date(apertura);
    const cierreInit = new Date(cierre);
    const abierto = ahora >= aperturaInit && ahora < cierreInit;
    const diffMs = abierto
      ? cierreInit.getTime() - ahora.getTime()
      : aperturaInit.getTime() - ahora.getTime();

    const tiempoRestante: TimeRemaining = {
      horas: Math.floor(diffMs / (1000 * 60 * 60)),
      minutos: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
      segundos: Math.floor((diffMs % (1000 * 60)) / 1000),
    };

    return {
      apertura: aperturaInit,
      cierre: cierreInit,
      abierto,
      tiempoRestante,
    };
  });

  let proximaApertura: Date | null = null;

  for (let i = 0; i < resultados.length; i++) {
    const { apertura, cierre, tiempoRestante } = resultados[i];
    const cierreHoy = resultados[i].cierre;

    // Si hay algo de tiempo restante (horas, minutos o segundos)
    const tieneTiempo = Object.values(tiempoRestante).some((v) => v > 0);
    if (!tieneTiempo) continue;

    // Evitamos intervalos de “24h” exactas
    const es24h =
      apertura.getTime() === cierre.getTime() &&
      apertura.getTime() === cierreHoy.getTime();
    if (es24h) continue;

    // Si la apertura futura es > ahora y no coincide con el cierre de hoy
    if (apertura > ahora && apertura.getTime() !== cierreHoy.getTime()) {
      proximaApertura = apertura;
      break;
    }
  }

  return proximaApertura;
}

/**
 * Devuelve la fecha del próximo cierre (o null si no lo hay)
 */
export function estadoCierre(fechas: ScheduleInterface[]): Date | null {
  const ahora = new Date();
  const estado: CierreResult[] = fechas.map(({ apertura, cierre }, i) => {
    const aperturaInit = new Date(apertura);
    const cierreInit = new Date(cierre);
    const siguienteApertura = new Date(
      fechas[(i + 1) % fechas.length].apertura
    );
    const cerrado = ahora >= cierreInit && aperturaInit < siguienteApertura;
    const diffMs = siguienteApertura.getTime() - ahora.getTime();

    const tiempoRestante: TimeRemaining = {
      horas: Math.floor(diffMs / (1000 * 60 * 60)),
      minutos: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
      segundos: Math.floor((diffMs % (1000 * 60)) / 1000),
    };

    return {
      apertura: aperturaInit,
      cierre: cierreInit,
      cerrado,
      tiempoRestante,
    };
  });

  let proximoCierre: Date | null = null;

  for (let i = 0; i < estado.length; i++) {
    const { apertura } = estado[(i + 1) % estado.length];
    const { cierre } = estado[i];
    const aperturaHoy = estado[i].apertura;

    // Sólo buscamos cierres en el futuro inmediato
    if (cierre <= ahora) continue;

    // Evitamos intervalos de “24h” exactas
    if (apertura.getTime() === cierre.getTime()) continue;

    // Si el cierre coincide con la apertura de hoy → es un fin de jornada
    if (aperturaHoy.getTime() === cierre.getTime()) {
      proximoCierre = cierre;
      break;
    }
  }

  return proximoCierre;
}
