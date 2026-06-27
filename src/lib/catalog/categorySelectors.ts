import { Categoria, Product } from "@/types/InitialStatus";

export function getCategoriesWithProducts(
  categories: Categoria[],
  products: Product[],
): Categoria[] {
  const categoryIdsWithProducts = new Set(products.map((product) => product.caja));
  return categories.filter((category) => categoryIdsWithProducts.has(category.id));
}

export function getUncategorizedProducts(
  categories: Categoria[],
  products: Product[],
): Product[] {
  const categoryIds = new Set(categories.map((category) => category.id));

  return products.filter(
    (product) => !categoryIds.has(product.caja || "") || !product.caja,
  );
}

export function deduplicateProductsByProductId(products: Product[]): Product[] {
  const productsById = new Map<string, Product>();

  for (const product of products) {
    if (!productsById.has(product.productId)) {
      productsById.set(product.productId, product);
    } else if (product.selected_variant?.default_variant === true) {
      productsById.set(product.productId, product);
    }
  }

  return Array.from(productsById.values());
}
