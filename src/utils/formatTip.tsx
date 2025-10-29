// utils/formatTopic.ts
export function formatTopic(tipoRaw?: string) {
  const tipo = (tipoRaw || "").trim();
  if (!tipo) return "sobre nosotros";

  const lower = tipo.toLowerCase();

  // caso especial
  if (lower === "nosotros" || lower === "acerca de nosotros")
    return "sobre nosotros";

  // heurística para plural (simple)
  const isPlural = /\b.+s$/.test(lower);

  // heurística de género (femenino si termina en estas terminaciones)
  const feminineEndings = [
    "a",
    "ción",
    "sión",
    "dad",
    "tad",
    "tud",
    "umbre",
    "ie",
    "ez",
  ];
  let gender: "f" | "m" = "m";
  for (const ending of feminineEndings) {
    if (lower.endsWith(ending)) {
      gender = "f";
      break;
    }
  }

  const article = isPlural
    ? gender === "f"
      ? "las"
      : "los"
    : gender === "f"
      ? "la"
      : "el";

  // formatear la palabra con minúscula inicial (mejor lectura en medio de la frase)
  const formatted = tipo.charAt(0).toLowerCase() + tipo.slice(1);

  return `acerca de ${article} ${formatted}`;
}
