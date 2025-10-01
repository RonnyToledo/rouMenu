// reducerGeneral.ts
import {
  StarDistribution,
  AppState,
  Current,
  Product,
  AgregadosInterface,
} from "@/context/InitialStatus";
import { smartRound } from "@/functions/precios";
import { toast } from "sonner";

// Acciones tipadas
export type AppAction =
  | { type: "Add"; payload: Partial<AppState> }
  | { type: "ChangeCurrent"; payload: string } // JSON de Current
  | { type: "Clean" }
  | { type: "AddCart"; payload: string }
  | { type: "AddComparar"; payload: string }
  | { type: "Loader"; payload: number }
  | { type: "Search"; payload: string }
  | { type: "Top"; payload: string }
  | { type: "animateCart"; payload: boolean }
  | { type: "balanceMode"; payload: boolean }
  | { type: "AddComent"; payload: { star: number } }
  | {
      type: "AddComentProduct";
      payload: { specific: string; data: { star: number } };
    };

// Función helper para obtener el nombre de la tienda actual

// Función para guardar en localStorage con clave dinámica
function saveCartToLocalStorage(shopName: string, products: Product[]) {
  try {
    const cartKey = `cart_${shopName}`;
    // Filtrar productos que tienen cantidad > 0 o agregados con cantidad > 0
    const productsToSave = products
      .filter((product) => {
        // Verificar si el producto tiene cantidad > 0
        const hasProductQuantity = product.Cant && product.Cant > 0;

        // Verificar si tiene agregados con cantidad > 0
        const hasAgregadosWithQuantity =
          product.agregados &&
          product.agregados.some(
            (agregado: AgregadosInterface) => agregado.cant && agregado.cant > 0
          );

        return hasProductQuantity || hasAgregadosWithQuantity;
      })
      .map((product) => {
        // Solo incluir los datos necesarios para el carrito
        const productToSave: {
          productId: string;
          Cant?: number;

          agregados?: AgregadosInterface[];
        } = {
          productId: product.productId,
        };

        // Incluir cantidad del producto si > 0
        if (product.Cant && product.Cant > 0) {
          productToSave.Cant = product.Cant;
        }

        // Incluir solo agregados con cantidad > 0
        if (product.agregados && product.agregados.length > 0) {
          const agregadosWithQuantity = product.agregados
            .filter(
              (agregado: AgregadosInterface) =>
                agregado.cant && agregado.cant > 0
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
    // Solo guardar si hay productos válidos
    if (productsToSave.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(productsToSave));
    } else {
      // Limpiar localStorage si no hay productos en el carrito
      localStorage.removeItem(cartKey);
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

// Función para cargar del localStorage

export function reducerStore(state: AppState, action: AppAction): AppState {
  console.log(action.type);
  switch (action.type) {
    case "AddCart":
      const newProduct = JSON.parse(action.payload);
      const updatedProducts = state.products.map((p) =>
        p.productId === newProduct.productId ? newProduct : p
      );

      // Guardar en localStorage después de actualizar
      saveCartToLocalStorage(state.sitioweb || "", updatedProducts);

      return {
        ...state,
        products: updatedProducts,
      };

    case "AddComparar":
      const newComprar = JSON.parse(action.payload);
      const newProductComparar = state.products.map((p) =>
        p.productId === newComprar.productId
          ? { ...newComprar, comparar: !newComprar.comparar }
          : p
      );
      if (
        newProductComparar.reduce(
          (sum, item) => sum + (item.comparar ? 1 : 0),
          0
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

    case "AddComentProduct":
      return {
        ...state,
        products: state.products.map((p) => {
          if (p.productId === action.payload.specific) {
            const key = String(
              action.payload.data.star
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
      const newDefault = JSON.parse(action.payload) as Current;
      return {
        ...state,
        moneda_default: newDefault,
        envios:
          state.envios?.map((env) => ({
            ...env,
            precio: smartRound(
              redondearAMultiploDe5(env.precio / newDefault.valor)
            ),
          })) ?? [],

        moneda: (state?.moneda || []).map((obj) => {
          return {
            ...obj,
            valor: smartRound(
              redondearAMultiploDe5(obj.valor / newDefault.valor)
            ),
          };
        }),
        products: state.products.map((p) => ({
          ...p,
          price: smartRound(
            redondearAMultiploDe5((p.price ?? 0) / newDefault.valor)
          ),
          embalaje: smartRound(
            redondearAMultiploDe5((p.embalaje ?? 0) / newDefault.valor)
          ),
          agregados: p.agregados.map((obj) => ({
            ...obj,
            price: smartRound(
              redondearAMultiploDe5((obj.price ?? 0) / newDefault.valor)
            ),
          })),
        })),
      };
    }

    case "Clean":
      // Limpiar también el localStorage al limpiar el estado
      try {
        const cartKey = `cart_${state.sitioweb}`;
        localStorage.removeItem(cartKey);
        const updatedProducts = state.products.map((p) => ({
          ...p,
          stock:
            (p.stock || 0) -
            p.Cant -
            p.agregados.reduce((sum, agg) => sum + agg.cant, 0),
          Cant: 0,
          agregados: p.agregados.map((agg) => ({ ...agg, cant: 0 })),
        }));

        // Guardar en localStorage después de actualizar

        return {
          ...state,
          products: updatedProducts,
        };
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
      return state;

    default:
      return state;
  }
}

function redondearAMultiploDe5(valor: number): number {
  if (valor < 5) {
    return parseFloat(valor.toFixed(6));
  } else {
    return Math.round(valor / 5) * 5;
  }
}
