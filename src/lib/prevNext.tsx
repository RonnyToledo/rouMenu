// utils/nav.ts
import { FlatItem } from "./types";

/**
 * getPrevNext
 * - flat: resultado de flattenSections
 * - slug: slug que buscas
 */
export function getPrevNext(flat: FlatItem[], slug: string) {
  const idx = flat.findIndex((f) => f.slug === slug);
  if (idx === -1) return { prev: null, next: null, index: -1 };

  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  return { prev, next, index: idx };
}
