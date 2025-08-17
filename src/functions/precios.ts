export function smartRound(value: number): number {
  const factor = 100;
  const raw = value * factor;
  const floored = Math.floor(raw);
  const frac = raw - floored;

  // Si la parte fraccionaria está muy cerca de 0 → subimos al siguiente centésimo
  if (frac > 0) {
    return (floored + 1) / factor;
  }

  // En otro caso hacemos el redondeo normal
  return Math.round(raw) / factor;
}
