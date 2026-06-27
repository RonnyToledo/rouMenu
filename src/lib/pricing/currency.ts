import { smartRound } from "@/functions/precios";

export function roundToNearestFive(value: number): number {
  if (value < 5) {
    return parseFloat(value.toFixed(6));
  }

  return Math.round(value / 5) * 5;
}

export function convertAndRoundCurrency(
  amount: number,
  sourceRate: number,
  targetRate: number,
): number {
  const normalizedAmount = Number(amount ?? 0);
  if (!isFinite(normalizedAmount)) return 0;

  const safeSourceRate = Number(sourceRate ?? 1) || 1;
  const safeTargetRate = Number(targetRate ?? 1) || 1;

  if (safeTargetRate === 0) {
    return smartRound(roundToNearestFive(normalizedAmount * safeSourceRate));
  }

  return smartRound(
    roundToNearestFive((normalizedAmount * safeSourceRate) / safeTargetRate),
  );
}
