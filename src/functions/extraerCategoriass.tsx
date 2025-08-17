import { Categoria, Product } from "@/context/InitialStatus";

export function ExtraerCategorias(categoria: Categoria[], products: Product[]) {
  const productCategories = new Set(products.map((product) => product.caja));
  return categoria.filter((category) => productCategories.has(category.id));
}
