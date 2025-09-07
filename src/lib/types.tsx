// types.ts (o en el mismo archivo)
export type AnyNode = {
  id?: string;
  slug?: string;
  title?: string;
  sections?: AnyNode[]; // subsecciones genéricas
  subsections?: AnyNode[]; // tu JSON usa "subsections"
  // resto de campos que quieras ignorar...
};

// Elemento "plano" resultante
export type FlatItem = {
  id?: string;
  slug: string;
  title?: string;
  path: string; // ruta calculada (ej: /categoria/editar-categoria)
  level: number; // profundidad 0 = top, 1 = subseccion, ...
  parentSlugs: string[]; // slugs de ancestros
};
