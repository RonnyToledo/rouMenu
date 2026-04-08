// reducerGeneral.ts
import {
  StarDistribution,
  AppState,
  Product,
  AgregadosInterface,
} from "@/types/InitialStatus";
import { smartRound } from "@/functions/precios";
import { sileo } from "sileo";

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
export function cartKey(
  product: Pick<Product, "productId" | "selected_variant">,
): string {
  const variantId = product.selected_variant?.id;
  const isDefault = !variantId || product.selected_variant?.default === true;
  if (isDefault) return product.productId;
  return `${product.productId}:${variantId}`;
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

      // Restaurar cantidad respetando stock
      if (baseSaved.Cant) {
        updatedProduct.Cant =
          (product.stock || 0) < baseSaved.Cant
            ? product.stock || 0
            : baseSaved.Cant;
      }

      // Restaurar cantidades de agregados
      if (baseSaved.agregados && product.agregados) {
        updatedProduct.agregados = product.agregados.map((agregado) => {
          const savedAgregado = baseSaved.agregados.find(
            (saved) => saved.id === agregado.id,
          );
          return savedAgregado
            ? { ...agregado, cant: savedAgregado.cant }
            : agregado;
        });
      }

      result.push(updatedProduct);
    } else {
      result.push(product);
    }

    // Buscar items de variantes no-default para este producto
    // (entries cuya key tiene formato "productId:variantId")
    for (const [key, saved] of savedMap.entries()) {
      if (
        key.startsWith(`${product.productId}:`) &&
        saved.selected_variant &&
        !saved.selected_variant.default
      ) {
        // Reconstruir el producto con la variante guardada
        const variant = saved.selected_variant;
        const stock = variant.stock ?? product.stock ?? 0;
        const restoredCant =
          stock < (saved.Cant || 0) ? stock : saved.Cant || 0;

        if (restoredCant > 0) {
          result.push({
            ...product,
            // Datos de la variante
            price: variant.price ?? product.price,
            oldPrice: variant.oldPrice ?? product.oldPrice,
            stock: variant.stock ?? product.stock,
            image: variant.image ?? product.image,
            selected_variant: variant,
            Cant: restoredCant,
            // Limpiar agregados para la entrada de variante
            agregados: product.agregados.map((a) => ({ ...a, cant: 0 })),
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
        const hasProductQuantity = product.Cant && product.Cant > 0;
        const hasAgregadosWithQuantity = product.agregados?.some(
          (a: AgregadosInterface) => a.cant && a.cant > 0,
        );
        return hasProductQuantity || hasAgregadosWithQuantity;
      })
      .map((product) => {
        const productToSave: {
          productId: string;
          Cant?: number;
          agregados?: AgregadosInterface[];
          variantId?: string;
          selected_variant?: Product["selected_variant"];
        } = {
          productId: product.productId,
        };

        if (product.Cant && product.Cant > 0) {
          productToSave.Cant = product.Cant;
        }

        // Guardar info de variante si existe y no es la default
        if (product.selected_variant?.id && !product.selected_variant.default) {
          productToSave.variantId = product.selected_variant.id;
          productToSave.selected_variant = product.selected_variant;
        }

        if (product.agregados?.length) {
          const agregadosWithQuantity = product.agregados
            .filter((a: AgregadosInterface) => a.cant && a.cant > 0)
            .map((a: AgregadosInterface) => ({
              id: a.id,
              cant: a.cant,
              price: a.price,
              name: a.name,
            }));

          if (agregadosWithQuantity.length > 0) {
            productToSave.agregados = agregadosWithQuantity;
          }
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
  console.info(action.type);
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
        const isNonDefaultVariant =
          p.selected_variant && !p.selected_variant.default;
        if (isNonDefaultVariant && (p.Cant ?? 0) <= 0) return false;
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
          precio: smartRound(
            redondearAMultiploDe5((env.precio ?? 0) * envFactor),
          ),
        })),
        moneda: (state.moneda || []).map((obj) => ({
          ...obj,
          defecto: obj.id === id,
        })),
        products: (state.products || []).map((p) => {
          const monedaOrigen = monedaMap[p.default_moneda] ?? oldDefault;
          const valorOrigen = Number(monedaOrigen?.valor ?? 1) || 1;
          const factor = valorOrigen / valorNew;

          // También convertir el precio de selected_variant si existe
          const updatedVariant = p.selected_variant
            ? {
                ...p.selected_variant,
                price:
                  p.selected_variant.price != null
                    ? smartRound(
                        redondearAMultiploDe5(
                          (p.selected_variant.price ?? 0) * factor,
                        ),
                      )
                    : undefined,
                oldPrice:
                  p.selected_variant.oldPrice != null
                    ? smartRound(
                        redondearAMultiploDe5(
                          (p.selected_variant.oldPrice ?? 0) * factor,
                        ),
                      )
                    : undefined,
              }
            : p.selected_variant;

          return {
            ...p,
            price: smartRound(redondearAMultiploDe5((p.price ?? 0) * factor)),
            embalaje: smartRound(
              redondearAMultiploDe5((p.embalaje ?? 0) * factor),
            ),
            default_moneda: newDefault.id,
            selected_variant: updatedVariant,
            agregados: (p.agregados ?? []).map((obj) => ({
              ...obj,
              price: smartRound(
                redondearAMultiploDe5((obj.price ?? 0) * factor),
              ),
            })),
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
          .filter(
            (p) => !p.selected_variant || p.selected_variant.default === true,
          )
          .map((p) => ({
            ...p,
            stock:
              (p.stock || 0) -
              p.Cant -
              p.agregados.reduce((sum, agg) => sum + agg.cant, 0),
            Cant: 0,
            agregados: p.agregados.map((agg) => ({ ...agg, cant: 0 })),
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

export function redondearAMultiploDe5(valor: number): number {
  if (valor < 5) {
    return parseFloat(valor.toFixed(6));
  } else {
    return Math.round(valor / 5) * 5;
  }
}
