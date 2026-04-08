export function isOpen(
  horario: { dia: string; apertura: string; cierre: string }[],
): boolean {
  if (!horario?.length) return false;
  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];
  const now = new Date();
  const diaActual = dias[now.getDay()];
  const horaActual = now.getHours() + now.getMinutes() / 60;
  const hoy = horario.find((h) => h.dia === diaActual);
  if (!hoy) return false;
  const apertura = parseFloat(hoy.apertura);
  const cierre = parseFloat(hoy.cierre);
  if (apertura === 0 && cierre === 24) return true;
  if (apertura === 0 && cierre === 0) return false;
  return horaActual >= apertura && horaActual < cierre;
}
