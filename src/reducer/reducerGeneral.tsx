// reducerGeneral.ts
import { StarDistribution, AppState, Product } from "@/types/InitialStatus";
import { smartRound } from "@/functions/precios";
import { sileo } from "sileo";
import {
  convertQuantityDiscount,
  repriceVariantForQuantity,
} from "@/lib/discountUtils";
import { roundToNearestFive } from "@/lib/pricing/currency";

import { saveCartToIDB, clearCartFromIDB } from "@/lib/indexedDBCart";

// ─── Acciones tipadas ────────────────────────────────────────────────────────

export type AppAction =
  | { type: "Add"; payload: Partial<AppState> }
  | { type: "ChangeCurrent"; payload: number }
  | { type: "Clean" }
  | { type: "AddCart"; payload: string }
  | { type: "SetAfiliate"; payload: string }
  | { type: "AddComparar"; payload: string }
  | { type: "Loader"; payload: number }
  | { type: "Search"; payload: string }
  | { type: "Top"; payload: string }
  | { type: "animateCart"; payload: boolean }
  | { type: "balanceMode"; payload: boolean }
  | { type: "SetPurchaseUuid"; payload: string }
  | { type: "AddComent"; payload: { star: number } }
  | {
      type: "AddComentProduct";
      payload: { specific: string; data: { star: number } };
    }
  | { type: "HydrateCart"; payload: Product[] };

// ─── cartKey ────────────────────────────────────────────────────────────────
/**
 * Genera una clave única para identificar un item del carrito.
 * Si el producto tiene una variante NO-default seleccionada, la clave incluye
 * el id de la variante, permitiendo que el mismo producto con distintas
 * variantes coexista en el carrito como entradas separadas.
 *
 * Formato:
 *   - sin variante extra:           "productId"
 *   - con variante no-default:      "productId:variantId"
 */
/**
 * Determina si una variante es la "default" del producto.
 * Cubre todos los campos que el backend puede usar para indicarlo:
 *   - selected_variant.default === true
 *   - selected_variant.default_variant === true
 *   - selected_variant.attributes.es_default === true
 *   - selected_variant.attributes.tipo === "default"
 */
export function isDefaultVariant(
  sv: Product["selected_variant"] | undefined | null,
): boolean {
  if (!sv?.id) return true; // sin variante → default
  if (sv.default === true) return true;
  if (sv.default_variant === true) return true;

  type VariantAttributes = {
    attributes?: {
      es_default?: boolean;
      tipo?: string;
    };
  };

  const attrs = (sv as VariantAttributes).attributes;
  if (attrs?.es_default === true) return true;
  if (attrs?.tipo === "default") return true;
  return false;
}

export function cartKey(
  product: Pick<Product, "productId" | "selected_variant">,
): string {
  if (isDefaultVariant(product.selected_variant)) return product.productId;
  return `${product.productId}:${product.selected_variant!.id}`;
}

// ─── mergeCartDataWithProducts ───────────────────────────────────────────────
/**
 * Fusiona el carrito guardado (IDB) con el catálogo actual de productos.
 * Soporta variantes: si en el carrito hay un item con variantId, intenta
 * restaurar ese producto con esa variante seleccionada.
 */
function mergeCartDataWithProducts(
  products: Product[],
  savedCart: Product[],
): Product[] {
  if (!savedCart || !Array.isArray(savedCart) || savedCart.length === 0)
    return products;

  // Construir mapa: cartKey -> savedProduct para búsqueda rápida
  const savedMap = new Map<string, Product>();
  for (const saved of savedCart) {
    savedMap.set(cartKey(saved), saved);
  }

  const result: Product[] = [];

  for (const product of products) {
    // Buscar coincidencia exacta (productId sin variante extra)
    const baseKey = product.productId;
    const baseSaved = savedMap.get(baseKey);

    if (baseSaved) {
      const updatedProduct = { ...product };

      // ✅ Leer Cant desde top-level primero (así lo guarda persistCartIDB)
      const savedCant = baseSaved.selected_variant?.Cant ?? 0;
      if (savedCant > 0 && updatedProduct.selected_variant) {
        const mergedVariant = {
          ...updatedProduct.selected_variant,
          ...baseSaved.selected_variant,
          Cant:
            (product.selected_variant?.stock || 0) < savedCant
              ? product.selected_variant?.stock || 0
              : savedCant,
        };
        updatedProduct.selected_variant = repriceVariantForQuantity(
          mergedVariant,
          mergedVariant.Cant ?? 0,
        )!;
      }

      result.push(updatedProduct);
    } else {
      result.push(product);
    }

    // Buscar items de variantes no-default para este producto
    for (const [key, saved] of savedMap.entries()) {
      if (
        key.startsWith(`${product.productId}:`) &&
        saved.selected_variant &&
        !isDefaultVariant(saved.selected_variant)
      ) {
        // Reconstruir el producto con la variante guardada
        const variant = saved.selected_variant;
        const stock = variant.stock ?? product.selected_variant?.stock ?? 0;
        const restoredCant =
          stock < (saved.selected_variant?.Cant || 0)
            ? stock
            : saved.selected_variant?.Cant || 0;

        if (restoredCant > 0) {
          const restoredVariant = repriceVariantForQuantity(
            {
              ...variant,
              price: variant.price ?? 0,
              oldPrice: variant.oldPrice ?? 0,
              stock: variant.stock ?? 0,
              image: variant.image ?? "",
            },
            restoredCant,
          );

          result.push({
            ...product,
            // Datos de la variante
            selected_variant: restoredVariant!,
          });
        }
      }
    }
  }

  return result;
}

// ─── persistCartIDB ──────────────────────────────────────────────────────────
/**
 * Persiste el carrito completo (incluyendo variantes) en IndexedDB.
 * Fire-and-forget: no debe usarse con await en el reducer.
 */
export function persistCartIDB(
  shopName: string,
  products: Product[],
  purchaseUuid?: string,
) {
  try {
    const productsToSave = products
      .filter((product) => {
        const hasProductQuantity =
          product.selected_variant?.Cant && product.selected_variant.Cant > 0;

        return hasProductQuantity;
      })
      .map((product) => {
        const productToSave: {
          productId: string;
          Cant?: number;
          variantId?: string;
          selected_variant?: Product["selected_variant"];
        } = {
          productId: product.productId,
        };

        if (
          product.selected_variant?.Cant &&
          product.selected_variant.Cant > 0
        ) {
          productToSave.Cant = product.selected_variant.Cant;
          // ✅ Siempre guardar selected_variant completo para poder restaurar Cant
          productToSave.selected_variant = product.selected_variant;
        }

        if (
          product.selected_variant?.id &&
          !isDefaultVariant(product.selected_variant)
        ) {
          productToSave.variantId = product.selected_variant.id;
          // selected_variant ya fue asignado arriba
        }

        return productToSave;
      });

    if (productsToSave.length > 0) {
      saveCartToIDB(shopName, productsToSave, purchaseUuid).catch((err) =>
        console.error("Error persisting cart to IDB:", err),
      );
    } else {
      clearCartFromIDB(shopName).catch((err) =>
        console.error("Error clearing cart from IDB:", err),
      );
    }
  } catch (error) {
    console.error("Error preparing persistCartIDB:", error);
  }
}

// ─── reducerStore ────────────────────────────────────────────────────────────

export function reducerStore(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "Add":
      return { ...state, ...action.payload };

    case "SetAfiliate":
      return { ...state, afiliate: action.payload };

    case "AddCart": {
      const newProduct: Product = JSON.parse(action.payload);
      const incomingKey = cartKey(newProduct);

      // Buscar si ya existe una entrada con esa clave en el carrito
      const existingIndex = state.products.findIndex(
        (p) => cartKey(p) === incomingKey,
      );

      let updatedProducts: Product[];

      if (existingIndex >= 0) {
        // Actualizar la entrada existente
        updatedProducts = state.products.map((p) =>
          cartKey(p) === incomingKey ? newProduct : p,
        );
      } else {
        // Es una variante nueva — insertar después del producto base
        const baseIndex = state.products.findIndex(
          (p) =>
            p.productId === newProduct.productId && p.selected_variant?.default,
        );
        if (baseIndex >= 0) {
          updatedProducts = [
            ...state.products.slice(0, baseIndex + 1),
            newProduct,
            ...state.products.slice(baseIndex + 1),
          ];
        } else {
          updatedProducts = [...state.products, newProduct];
        }
      }

      // Si la cantidad llega a 0 y es una variante no-default, eliminar la entrada
      updatedProducts = updatedProducts.filter((p) => {
        if (
          !isDefaultVariant(p.selected_variant) &&
          (p.selected_variant?.Cant ?? 0) <= 0
        )
          return false;
        return true;
      });

      persistCartIDB(state.sitioweb || "", updatedProducts);

      return { ...state, products: updatedProducts };
    }

    case "AddComparar": {
      const newComprar = JSON.parse(action.payload);
      const newProductComparar = state.products.map((p) =>
        p.productId === newComprar.productId
          ? { ...newComprar, comparar: !newComprar.comparar }
          : p,
      );
      if (
        newProductComparar.reduce(
          (sum, item) => sum + (item.comparar ? 1 : 0),
          0,
        ) > 2
      ) {
        sileo.error({
          title: "Error",
          description: "Solo se permiten dos productos",
        });
        return state;
      }
      return { ...state, products: newProductComparar };
    }

    case "AddComent": {
      const key = String(action.payload.star) as keyof StarDistribution;
      const value = state.comentTienda.porEstrellas[key] + 1;
      return {
        ...state,
        comentTienda: {
          ...state.comentTienda,
          porEstrellas: { ...state.comentTienda.porEstrellas, [key]: value },
        },
      };
    }

    case "SetPurchaseUuid":
      return { ...state, compraUUID: action.payload };

    case "AddComentProduct":
      return {
        ...state,
        products: state.products.map((p) => {
          if (p.productId === action.payload.specific) {
            const key = String(
              action.payload.data.star,
            ) as keyof StarDistribution;
            const value = p.coment?.porEstrellas[key] + 1 || 0;
            return {
              ...p,
              coment: {
                ...p.coment,
                porEstrellas: { ...p.coment?.porEstrellas, [key]: value },
              },
            };
          }
          return p;
        }),
      };

    case "ChangeCurrent": {
      const id = action.payload as number;
      const newDefault = state.moneda.find((m) => m.id === id);
      if (!newDefault) return state;

      const oldDefault = state.moneda.find((m) => m.defecto) ?? { valor: 1 };
      const valorNew = Number(newDefault.valor ?? 1) || 1;
      const valorOld = Number(oldDefault.valor ?? 1) || 1;

      const monedaMap = (state.moneda || []).reduce<
        Record<number, (typeof state.moneda)[0]>
      >((acc, m) => {
        acc[m.id] = m;
        return acc;
      }, {});

      const envFactor = valorOld / valorNew;

      return {
        ...state,
        envios: (state.envios ?? []).map((env) => ({
          ...env,
          precio: smartRound(roundToNearestFive((env.precio ?? 0) * envFactor)),
        })),
        moneda: (state.moneda || []).map((obj) => ({
          ...obj,
          defecto: obj.id === id,
        })),
        products: (state.products || []).map((p) => {
          const monedaOrigen = monedaMap[p.default_moneda] ?? oldDefault;
          const valorOrigen = Number(monedaOrigen?.valor ?? 1) || 1;
          const factor = valorOrigen / valorNew;
          const convertVariant = (variant: Product["selected_variant"]) =>
            variant
              ? {
                  ...variant,
                  basePrice:
                    variant.basePrice != null
                      ? smartRound(
                          roundToNearestFive(
                            (variant.basePrice ?? 0) * factor,
                          ),
                        )
                      : undefined,
                  price:
                    variant.price != null
                      ? smartRound(
                          roundToNearestFive((variant.price ?? 0) * factor),
                        )
                      : undefined,
                  oldPrice:
                    variant.oldPrice != null
                      ? smartRound(
                          roundToNearestFive(
                            (variant.oldPrice ?? 0) * factor,
                          ),
                        )
                      : undefined,
                  priceCompra:
                    variant.priceCompra != null
                      ? smartRound(
                          roundToNearestFive(
                            (variant.priceCompra ?? 0) * factor,
                          ),
                        )
                      : undefined,
                  embalaje:
                    variant.embalaje != null
                      ? smartRound(
                          roundToNearestFive(
                            (variant.embalaje ?? 0) * factor,
                          ),
                        )
                      : 0,
                  quantity_discounts:
                    variant.quantity_discounts?.map((rule) =>
                      convertQuantityDiscount(rule, factor),
                    ) ?? [],
                }
              : variant;

          const updatedVariant = convertVariant(p.selected_variant);

          return {
            ...p,
            default_moneda: newDefault.id,
            variants: (p.variants || []).map((variant) => convertVariant(variant)!),
            selected_variant: updatedVariant,
          };
        }),
      };
    }

    case "Clean": {
      try {
        clearCartFromIDB(state.sitioweb || "").catch((err) =>
          console.error("Error clearing cart in IDB:", err),
        );

        // Eliminar entradas de variantes no-default; restablecer Cant en todas
        const updatedProducts = state.products
          .filter((p) => isDefaultVariant(p.selected_variant))
          .map((p) => ({
            ...p,
            selected_variant: p.selected_variant
              ? { ...p.selected_variant, Cant: 0 }
              : p.selected_variant,
            Cant: 0,
          }));

        return { ...state, products: updatedProducts };
      } catch (error) {
        console.error("Error clearing cart:", error);
        return state;
      }
    }

    case "HydrateCart": {
      const savedCart = action.payload;
      const mergedProducts = mergeCartDataWithProducts(
        state.products,
        savedCart,
      );
      return { ...state, products: mergedProducts };
    }

    default:
      return state;
  }
}

export const redondearAMultiploDe5 = roundToNearestFive;
