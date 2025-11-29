import { Categoria, Product } from "@/context/InitialStatus";

export function ExtraerCategorias(categoria: Categoria[], products: Product[]) {
  const productCategories = new Set(products.map((product) => product.caja));
  return categoria.filter((category) => productCategories.has(category.id));
}
export function ExtraerProductosSinCategoria(
  categorias: Categoria[],
  products: Product[]
) {
  const categoryIds = new Set(categorias.map((c) => c.id));

  return products.filter(
    (product) => !categoryIds.has(product.caja || "") || !product.caja
  );
}
