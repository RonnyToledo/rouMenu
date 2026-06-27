import { ScheduleInterface } from "@/types/InitialStatus";

/**
 * Convierte "HH:MM:SS" a minutos desde medianoche
 */
function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Minutos actuales desde medianoche (hora local)
 */
function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Día de semana actual como nombre español
 */
function diaHoy(): string {
  return [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ][new Date().getDay()];
}

/**
 * ¿Está abierto ahora?
 */
export function isOpenNow(horario: ScheduleInterface[]): boolean {
  if (!horario?.length) return false;
  const hoy = horario.find((h) => h.dia === diaHoy());
  if (!hoy || !hoy.turnos.length) return false;
  const now = nowMinutes();

  for (const turno of hoy.turnos) {
    if (!turno.open) continue;
    if (turno.es_24h) return true;
    const ap = timeToMinutes(turno.apertura);
    const ci = timeToMinutes(turno.cierre);
    if (turno.cruza_medianoche) {
      if (now >= ap || now < ci) return true;
    } else {
      if (now >= ap && now < ci) return true;
    }
  }
  return false;
}

/**
 * Minutos hasta el próximo cierre (si está abierto)
 */
export function minutosParaCierre(horario: ScheduleInterface[]): number | null {
  if (!horario?.length) return null;
  const hoy = horario.find((h) => h.dia === diaHoy());
  if (!hoy || !hoy.turnos.length) return null;
  const now = nowMinutes();

  for (const turno of hoy.turnos) {
    if (!turno.open) continue;
    if (turno.es_24h) return null; // 24h → no cierra
    const ap = timeToMinutes(turno.apertura);
    const ci = timeToMinutes(turno.cierre);
    if (turno.cruza_medianoche) {
      if (now >= ap) return 24 * 60 - now + ci;
      if (now < ci) return ci - now;
    } else {
      if (now >= ap && now < ci) return ci - now;
    }
  }
  return null;
}

/**
 * Minutos hasta la próxima apertura (si está cerrado)
 */
export function minutosParaApertura(
  horario: ScheduleInterface[],
): number | null {
  if (!horario?.length) return null;
  const now = nowMinutes();
  // Busca en los próximos 7 días
  for (let offset = 0; offset < 7; offset++) {
    const fecha = horario[offset];
    if (!fecha || !fecha.turnos.length) continue;
    for (const turno of fecha.turnos) {
      if (!turno.open) continue;
      const ap = timeToMinutes(turno.apertura);
      if (offset === 0 && ap > now) return ap - now;
      if (offset > 0) return offset * 24 * 60 - now + ap;
    }
  }
  return null;
}

/**
 * Fecha del próximo cierre como Date (para relative-time)
 */
export function estadoCierre(horario: ScheduleInterface[]): Date | null {
  const mins = minutosParaCierre(horario);
  if (mins === null) return null;
  const d = new Date();
  d.setSeconds(d.getSeconds() + mins * 60);
  return d;
}

/**
 * Fecha de la próxima apertura como Date (para relative-time)
 */
export function estadoApertura(horario: ScheduleInterface[]): Date | null {
  const mins = minutosParaApertura(horario);
  if (mins === null) return null;
  const d = new Date();
  d.setSeconds(d.getSeconds() + mins * 60);
  return d;
}

export interface IsOpenStoreInteface {
  week: number;
  open: boolean;
}

/**
 * Compatibilidad con componentes existentes
 */
export function isOpen(horario: ScheduleInterface[]): IsOpenStoreInteface {
  return {
    week: new Date().getDay(),
    open: isOpenNow(horario),
  };
}

/**
 * ¿Es 24h hoy?
 */
export function isOpen24HoursToday(horario: ScheduleInterface[]): boolean {
  const hoy = horario?.find((h) => h.dia === diaHoy());
  return hoy?.turnos.some((t) => t.open && t.es_24h) ?? false;
}

/**
 * ¿Abierto 24/7 toda la semana?
 */
export function isOpen24Hours(horario: ScheduleInterface[]): boolean {
  if (!horario?.length) return false;
  return horario.every((dia) => dia.turnos.some((t) => t.open && t.es_24h));
}
