import { ScheduleInterface } from "@/context/InitialStatus";

export interface IsOpenStoreInteface {
  week: number;
  open: boolean;
}

/**
 * Determina si la tienda está abierta actualmente
 */
export function isOpen(newHorario: ScheduleInterface[]): IsOpenStoreInteface {
  const now = new Date();

  for (const horario of newHorario) {
    const apertura = new Date(horario.apertura);
    const cierre = new Date(horario.cierre);

    // Verificar si apertura y cierre son iguales (día cerrado)
    if (apertura.getTime() === cierre.getTime()) {
      continue;
    }

    // Si estamos dentro del horario de apertura
    if (now >= apertura && now < cierre) {
      return {
        week: now.getDay(),
        open: true,
      };
    }
  }

  return { week: now.getDay(), open: false };
}

/**
 * Devuelve la fecha de la próxima apertura
 */
export function estadoApertura(fechas: ScheduleInterface[]): Date | null {
  const ahora = new Date();
  let proximaApertura: Date | null = null;
  let menorDiferencia = Infinity;

  for (const horario of fechas) {
    const apertura = new Date(horario.apertura);
    const cierre = new Date(horario.cierre);

    // Ignorar días cerrados (apertura === cierre)
    if (apertura.getTime() === cierre.getTime()) {
      continue;
    }

    // Solo considerar aperturas futuras
    if (apertura > ahora) {
      const diferencia = apertura.getTime() - ahora.getTime();

      // Buscar la apertura más cercana
      if (diferencia < menorDiferencia) {
        menorDiferencia = diferencia;
        proximaApertura = apertura;
      }
    }
  }

  return proximaApertura;
}

/**
 * Devuelve la fecha del próximo cierre (para tiendas actualmente abiertas)
 */
export function estadoCierre(fechas: ScheduleInterface[]): Date | null {
  const ahora = new Date();
  const dayOfWeek = ahora.getDay();

  // Mapeo de nombres de días
  const diaMap: { [key: string]: number } = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    Miercoles: 3,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sabado: 6,
    Sábado: 6,
  };

  for (const horario of fechas) {
    const apertura = new Date(horario.apertura);
    const cierre = new Date(horario.cierre);

    // Ignorar días cerrados
    if (apertura.getTime() === cierre.getTime()) {
      continue;
    }

    const diaNumero = diaMap[horario.dia] ?? -1;

    // Si es el día correcto
    if (diaNumero === dayOfWeek) {
      // Verificar si estamos dentro del horario de apertura
      // Necesitamos comparar solo la fecha, no la hora exacta de apertura
      const aperturaDate = new Date(apertura);
      aperturaDate.setHours(0, 0, 0, 0);

      const ahoraDate = new Date(ahora);
      ahoraDate.setHours(0, 0, 0, 0);

      // Si es el mismo día y el cierre es futuro
      if (aperturaDate.getTime() === ahoraDate.getTime() && cierre > ahora) {
        return cierre;
      }
    }
  }

  return null;
}

/**
 * Verifica si la tienda está abierta 24 horas HOY
 */
export function isOpen24HoursToday(fechas: ScheduleInterface[]): boolean {
  const ahora = new Date();
  const dayOfWeek = ahora.getDay();

  const diaMap: { [key: string]: number } = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    Miercoles: 3,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sabado: 6,
    Sábado: 6,
  };

  for (const horario of fechas) {
    const apertura = new Date(horario.apertura);
    const cierre = new Date(horario.cierre);
    const diaNumero = diaMap[horario.dia] ?? -1;

    // Si es el día de hoy
    if (diaNumero === dayOfWeek) {
      // Calcular la diferencia en horas
      const diffMs = cierre.getTime() - apertura.getTime();
      const horas = diffMs / (1000 * 60 * 60);

      // Si abre a las 00:00 y cierra a las 00:00 del día siguiente = 24 horas
      if (horas === 24) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Verifica si la tienda está abierta 24/7 toda la semana
 */
export function isOpen24Hours(fechas: ScheduleInterface[]): boolean {
  if (fechas.length !== 7) return false;

  let diasAbiertos24h = 0;

  for (const horario of fechas) {
    const apertura = new Date(horario.apertura);
    const cierre = new Date(horario.cierre);

    const diffMs = cierre.getTime() - apertura.getTime();
    const horas = diffMs / (1000 * 60 * 60);

    if (horas === 24) {
      diasAbiertos24h++;
    }
  }

  // Si todos los días están abiertos 24h
  return diasAbiertos24h === 7;
}

/**
 * Obtiene el horario del día actual
 */
export function getHorarioHoy(
  fechas: ScheduleInterface[]
): ScheduleInterface | null {
  const ahora = new Date();
  const dayOfWeek = ahora.getDay();

  const diaMap: { [key: string]: number } = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    Miercoles: 3,
    Miércoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sabado: 6,
    Sábado: 6,
  };

  for (const horario of fechas) {
    const diaNumero = diaMap[horario.dia] ?? -1;
    if (diaNumero === dayOfWeek) {
      return horario;
    }
  }

  return null;
}
