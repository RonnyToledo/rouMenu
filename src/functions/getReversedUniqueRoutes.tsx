import { HistoryEntry } from "@/context/AppContext";
/**
 * Filtra y devuelve las rutas en orden inverso, sin duplicados ni el path actual.
 * @param items Array de rutas [{ path, shop }]
 * @param currentPath Ruta actual (por ejemplo "/t/moondust/about")
 */
export function getReversedUniqueRoutes(
  items: HistoryEntry[],
  currentPath: string
): HistoryEntry[] {
  const seen = new Set<string>();

  // Filtramos duplicados y el path actual
  const filtered = items.filter((item) => {
    if (item.path === currentPath) return false; // excluir el actual
    if (seen.has(item.path)) return false; // excluir duplicados
    seen.add(item.path);
    return true;
  });

  // Invertimos el orden (últimos primero)
  return filtered.reverse();
}
