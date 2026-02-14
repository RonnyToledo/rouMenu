// utils/flatten.ts

import { FlatItem } from "./types";
import { ContectDataInterace } from "@/components/Explore/Info/json/interfaceTsx";

/**
 * flattenSections
 * - data: array de secciones (tu JSON.sections)
 * - opts.basePath: prefijo para las rutas (ej "/docs" o "/admin")
 * - opts.includeNoSlug: si true, genera slugs a partir de id para nodos sin slug
 */
export function flattenSections(
  data: ContectDataInterace[],
  opts: { basePath?: string; includeNoSlug?: boolean } = {}
): FlatItem[] {
  const basePath = opts.basePath?.replace(/\/+$/, "") ?? ""; // eliminar slash final
  const includeNoSlug = !!opts.includeNoSlug;
  const out: FlatItem[] = [];

  function normalizeSlug(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, ""); // simple slugify
  }

  function walk(
    nodes: ContectDataInterace[],
    parentSlugs: string[],
    level: number
  ) {
    for (const node of nodes) {
      // determinar slug usable
      let slug = node.slug ?? null;
      if (!slug && includeNoSlug && node.id) slug = normalizeSlug(node.id);

      if (slug) {
        const path = basePath + "/" + slug;
        out.push({
          id: node.id,
          slug,
          title: node.title,
          path,
          level,
          parentSlugs: [...parentSlugs],
        });
      }

      // decidir nuevos parentSlugs: si este nodo tiene slug lo agrega como ancestro
      const nextParents = slug ? [...parentSlugs, slug] : [...parentSlugs];

      // Recorrer subsecciones (tu JSON usa both "sections" y "subsections")
      if (Array.isArray(node.subsections))
        walk(node.subsections, nextParents, level + 1);
      if (Array.isArray(node.sections))
        walk(node.sections, nextParents, level + 1);
    }
  }

  walk(data, [], 0);
  return out;
}
