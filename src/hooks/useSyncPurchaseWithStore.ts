import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CompraInterface } from "@/types/interfaces_Cart";
import type { AppState, Product, ProductVariant } from "@/types/InitialStatus";
import { smartRound } from "@/functions/precios";
import { getVariantBasePrice } from "@/lib/discountUtils";
import { convertAndRoundCurrency } from "@/lib/pricing/currency";

// TODO: reemplazar por el tipo real de `store` (el de MyContext) si ya existe
// uno exportado; lo dejo mínimo acá para no acoplar este hook a ese archivo.
type Moneda = { id: number; valor: number; nombre: string; defecto?: boolean };

/**
 * Reconstruye purchase.pedido/total/moneda/code cada vez que cambia el
 * store (productos en carrito, monedas, cupón de afiliado, etc).
 * Es un espejo derivado del store — el resto de `purchase` (datos del
 * cliente, dirección...) no lo toca.
 */
export function useSyncPurchaseWithStore(
  store: AppState,
  setPurchase: Dispatch<SetStateAction<CompraInterface>>,
) {
  useEffect(() => {
    const affiliateCoupon = store.afiliate
      ? store.codeDiscount.find((c) => c.code === store.afiliate)
      : undefined;

    const code = affiliateCoupon
      ? {
          discount: affiliateCoupon.discount || 0,
          name: affiliateCoupon.code || "",
        }
      : { discount: 0, name: "" };

    setPurchase((previousPurchase) => {
      const targetCurrency = store.moneda.find((m) => m.defecto) ?? {
        id: 0,
        valor: 1,
        nombre: "",
      };
      const targetRate = targetCurrency.valor ?? 1;

      const orderItems = store.products
        .filter((p) => (p.selected_variant?.Cant ?? 0) > 0)
        .map((p) =>
          convertProductToTargetCurrency(
            p,
            store.moneda,
            targetCurrency,
            targetRate,
          ),
        );

      const total = orderItems.reduce((acc, item) => {
        const qty = item.selected_variant?.Cant ?? 0;
        const productLine =
          ((item.selected_variant?.price ?? 0) +
            (item.selected_variant?.embalaje ?? 0)) *
          qty;
        return acc + productLine;
      }, 0);

      return {
        ...previousPurchase,
        code,
        moneda: targetCurrency.nombre ?? "",
        pedido: orderItems,
        total: smartRound(total),
      };
    });
  }, [
    store.envios,
    store.products,
    store.moneda,
    store.afiliate,
    store.codeDiscount,
    setPurchase,
  ]);
}

function convertProductToTargetCurrency(
  product: Product,
  monedas: Moneda[],
  targetCurrency: Moneda,
  targetRate: number,
): Product {
  if (!product.selected_variant) return product;

  const sourceCurrency =
    monedas.find((m) => m.id === product.default_moneda) ?? targetCurrency;
  const sourceRate = sourceCurrency?.valor ?? 1;

  const selectedVariant: ProductVariant = {
    ...product.selected_variant,
    basePrice: convertAndRoundCurrency(
      getVariantBasePrice(product.selected_variant),
      sourceRate,
      targetRate,
    ),
    price: convertAndRoundCurrency(
      product.selected_variant.price ?? 0,
      sourceRate,
      targetRate,
    ),
    embalaje: convertAndRoundCurrency(
      product.selected_variant.embalaje ?? 0,
      sourceRate,
      targetRate,
    ),
    priceCompra: convertAndRoundCurrency(
      product.selected_variant.priceCompra ?? 0,
      sourceRate,
      targetRate,
    ),
    quantity_discounts:
      product.selected_variant.quantity_discounts?.map((rule) => ({
        ...rule,
        value:
          rule.type === "percentage"
            ? rule.value
            : convertAndRoundCurrency(rule.value, sourceRate, targetRate),
      })) ?? [],
  };

  return {
    ...product,
    default_moneda: targetCurrency.id ?? 0,
    selected_variant: selectedVariant,
  };
}
