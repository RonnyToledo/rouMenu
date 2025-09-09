// reducerGeneral.ts
import { StarDistribution, AppState, Current } from "@/context/InitialStatus";
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

export function reducerStore(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "Add":
      console.log("aaa");
      return { ...state, ...action.payload };

    case "ChangeCurrent": {
      const newDefault = JSON.parse(action.payload) as Current;
      return {
        ...state,
        // actualiza todas las monedas de cada sitio
        moneda_default: newDefault,
        envios:
          state.envios?.map((env) => ({
            ...env,
            price: redondearAMultiploDe5(env.price / newDefault.valor),
          })) ?? [],

        moneda: (state?.moneda || []).map((obj) => {
          return {
            ...obj,
            valor: redondearAMultiploDe5(obj.valor / newDefault.valor),
          };
        }),
        // re-calcula precios globales
        products: state.products.map((p) => ({
          ...p,
          price: redondearAMultiploDe5((p.price ?? 0) / newDefault.valor),
          agregados: p.agregados.map((obj) => ({
            ...obj,
            price: redondearAMultiploDe5((obj.price ?? 0) / newDefault.valor),
          })),
        })),
      };
    }

    case "AddCart":
      console.log("e");

      const newDefault = JSON.parse(action.payload);
      return {
        ...state,
        products: state.products.map((p) =>
          p.productId === newDefault.productId ? newDefault : p
        ),
      };
    case "AddComparar":
      const newComprar = JSON.parse(action.payload);
      const newProduct = state.products.map((p) =>
        p.productId === newComprar.productId
          ? { ...newComprar, comparar: !newComprar.comparar }
          : p
      );
      if (
        newProduct.reduce((sum, item) => sum + (item.comparar ? 1 : 0), 0) > 2
      ) {
        toast("Error", {
          description: "Solo se permiten dos productos",
        });
        return state;
      }
      return {
        ...state,
        products: newProduct,
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
            [key]: value, // ✅ actualiza solo la estrella correspondiente
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
