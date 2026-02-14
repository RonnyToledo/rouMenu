// reducerGeneral.ts
import {
  StarDistribution,
  AppState,
  Product,
  AgregadosInterface,
} from "@/context/InitialStatus";
import { smartRound } from "@/functions/precios";
import { toast } from "sonner";

import { saveCartToIDB, clearCartFromIDB } from "@/lib/indexedDBCart"; // <-- import IDB utils

// Acciones tipadas
export type AppAction =
  | { type: "Add"; payload: Partial<AppState> }
  | { type: "ChangeCurrent"; payload: number } // JSON de Current
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
  | { type: "HydrateCart"; payload: Product[] }; // <-- nueva accion

/* Helper local para fusionar productos en el reducer */
function mergeCartDataWithProducts(
  products: Product[],
  savedCart: Product[],
): Product[] {
  if (!savedCart || !Array.isArray(savedCart) || savedCart.length === 0)
    return products;
  return products.map((product) => {
    const savedProduct = savedCart.find(
      (saved) => saved.productId === product.productId,
    );

    if (savedProduct) {
      const updatedProduct = { ...product };

      // Restaurar cantidad del producto (respetando stock)
      if (savedProduct.Cant) {
        updatedProduct.Cant =
          (product?.stock || 0) < savedProduct.Cant
            ? product?.stock || 0
            : savedProduct.Cant || 0;
      }

      // Restaurar cantidades de agregados
      if (savedProduct.agregados && product.agregados) {
        updatedProduct.agregados = product.agregados.map((agregado) => {
          const savedAgregado = savedProduct.agregados.find(
            (saved) => saved.id === agregado.id,
          );

          return savedAgregado
            ? { ...agregado, cant: savedAgregado.cant }
            : agregado;
        });
      }

      return updatedProduct;
    }

    return product;
  });
}

// Función helper para guardar en IndexedDB con clave dinámica (fire-and-forget)
export function persistCartIDB(
  shopName: string,
  products: Product[],
  purchaseUuid?: string,
) {
  try {
    const cartKey = `cart_${shopName}`;
    // Filtrar productos a guardar (mismo criterio que tenías)
    const productsToSave = products
      .filter((product) => {
        const hasProductQuantity = product.Cant && product.Cant > 0;
        const hasAgregadosWithQuantity =
          product.agregados &&
          product.agregados.some(
            (agregado: AgregadosInterface) =>
              agregado.cant && agregado.cant > 0,
          );

        return hasProductQuantity || hasAgregadosWithQuantity;
      })
      .map((product) => {
        const productToSave: {
          productId: string;
          Cant?: number;
          agregados?: AgregadosInterface[];
        } = {
          productId: product.productId,
        };

        if (product.Cant && product.Cant > 0) {
          productToSave.Cant = product.Cant;
        }

        if (product.agregados && product.agregados.length > 0) {
          const agregadosWithQuantity = product.agregados
            .filter(
              (agregado: AgregadosInterface) =>
                agregado.cant && agregado.cant > 0,
            )
            .map((agregado: AgregadosInterface) => ({
              id: agregado.id,
              cant: agregado.cant,
              price: agregado.price,
              name: agregado.name,
            }));

          if (agregadosWithQuantity.length > 0) {
            productToSave.agregados = agregadosWithQuantity;
          }
        }

        return productToSave;
      });

    if (productsToSave.length > 0) {
      // no await aquí: el reducer no debe ser async. Fire-and-forget.
      saveCartToIDB(
        cartKey.replace(/^cart_/, "" /* pasamos solo shopName */),
        productsToSave,
        purchaseUuid,
      ).catch((err) => console.error("Error persisting cart to IDB:", err));
    } else {
      // eliminar la clave si no hay productos
      clearCartFromIDB(cartKey.replace(/^cart_/, "")).catch((err) =>
        console.error("Error clearing cart from IDB:", err),
      );
    }
  } catch (error) {
    console.error("Error preparing persistCartIDB:", error);
  }
}

export function reducerStore(state: AppState, action: AppAction): AppState {
  console.log(action.type);
  switch (action.type) {
    case "Add":
      return {
        ...state,
        ...action.payload,
      };
    case "SetAfiliate":
      return { ...state, afiliate: action.payload };
    case "AddCart": {
      const newProduct = JSON.parse(action.payload);
      const updatedProducts = state.products.map((p) =>
        p.productId === newProduct.productId ? newProduct : p,
      );

      // Guardar en IndexedDB (fire and forget)
      persistCartIDB(state.sitioweb || "", updatedProducts);

      return {
        ...state,
        products: updatedProducts,
      };
    }

    case "AddComparar":
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
        toast("Error", {
          description: "Solo se permiten dos productos",
        });
        return state;
      }
      return {
        ...state,
        products: newProductComparar,
      };

    case "AddComent": {
      const key = String(action.payload.star) as keyof StarDistribution;
      const value = state.comentTienda.porEstrellas[key] + 1;

      return {
        ...state,
        comentTienda: {
          ...state.comentTienda,
          porEstrellas: {
            ...state.comentTienda.porEstrellas,
            [key]: value,
          },
        },
      };
    }
    case "SetPurchaseUuid": {
      return {
        ...state,
        compraUUID: action.payload,
      };
    }

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
                porEstrellas: {
                  ...p.coment?.porEstrellas,
                  [key]: value,
                },
              },
            };
          }
          return p;
        }),
      };

    case "ChangeCurrent": {
      const id = action.payload as number;
      // moneda destino
      const newDefault = state.moneda.find((m) => m.id === id);
      if (!newDefault) return state; // id inválido

      // moneda que estaba marcada como defecto antes del cambio (si existe)
      const oldDefault = state.moneda.find((m) => m.defecto) ?? { valor: 1 };

      const valorNew = Number(newDefault.valor ?? 1) || 1;
      const valorOld = Number(oldDefault.valor ?? 1) || 1;

      // mapa id -> moneda (para resolver origenes de cada producto)
      const monedaMap = (state.moneda || []).reduce<
        Record<number, (typeof state.moneda)[0]>
      >((acc, m) => {
        acc[m.id] = m;
        return acc;
      }, {});

      // factor general para envios (asumimos env.precio estaba en la moneda que se estaba mostrando: oldDefault)
      const envFactor = valorOld / valorNew;

      return {
        ...state,

        // envios: rebase desde la moneda visible previa -> nueva moneda
        envios: (state.envios ?? []).map((env) => ({
          ...env,
          precio: smartRound(
            redondearAMultiploDe5((env.precio ?? 0) * envFactor),
          ),
        })),

        // moneda: sólo actualizar el flag defecto; recomendamos NO sobrescribir valores absolutos
        moneda: (state.moneda || []).map((obj) => ({
          ...obj,
          defecto: obj.id === id,
          // si quieres rebasear valores aquí, coméntalo y usa la variante abajo (opcional)
          // valor: smartRound(redondearAMultiploDe5(obj.valor / valorNew))
        })),

        // products: convertir cada product desde su moneda origen (product.default_moneda) -> newDefault
        products: (state.products || []).map((p) => {
          // determinar valor origen: si product tiene default_moneda y existe en el mapa, usarlo;
          // si no, asumimos que estaba en la moneda visible anterior (oldDefault)
          const monedaOrigen = monedaMap[p.default_moneda] ?? oldDefault;
          const valorOrigen = Number(monedaOrigen?.valor ?? 1) || 1;

          const factor = valorOrigen / valorNew;

          return {
            ...p,
            price: smartRound(redondearAMultiploDe5((p.price ?? 0) * factor)),
            embalaje: smartRound(
              redondearAMultiploDe5((p.embalaje ?? 0) * factor),
            ),
            // Si quieres indicar que ahora el producto se muestra en la moneda destino,
            // asigna default_moneda = newDefault.id; si prefieres conservar el id origen, no lo cambies.
            default_moneda: newDefault.id,
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

    case "Clean":
      try {
        // Limpiar también en IDB
        clearCartFromIDB(state.sitioweb || "").catch((err) =>
          console.error("Error clearing cart in IDB:", err),
        );

        const updatedProducts = state.products.map((p) => ({
          ...p,
          stock:
            (p.stock || 0) -
            p.Cant -
            p.agregados.reduce((sum, agg) => sum + agg.cant, 0),
          Cant: 0,
          agregados: p.agregados.map((agg) => ({ ...agg, cant: 0 })),
        }));

        return {
          ...state,
          products: updatedProducts,
        };
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
      return state;

    case "HydrateCart": {
      // payload = Product[] guardado en la DB (solo propiedades esenciales)
      const savedCart = action.payload;
      const mergedProducts = mergeCartDataWithProducts(
        state.products,
        savedCart,
      );
      return {
        ...state,
        products: mergedProducts,
      };
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
