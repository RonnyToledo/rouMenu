"use client";

import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import { MyContext } from "@/context/MyContext";
import { sileo } from "sileo";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useRouter } from "next/navigation";
import { UploadPedido } from "./UploadPedido";
import Details from "./Details";
import Resumen from "./Resumen";
import CodeDiscount from "./CodeDiscount";
import CartItems from "./CartItems";
import { v4 as uuidv4 } from "uuid";
import { smartRound } from "@/functions/precios";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartClean from "./CartClean";
import { useAuth } from "@/context/AppContext";
import PreviewRatingGeneral from "../General/PreviewRatingGeneral";
import {
  discountLabel,
  getApplicableDiscount,
  getVariantBasePrice,
} from "@/lib/discountUtils";
import { buildCartTitle } from "@/lib/variantUtils";
import { convertAndRoundCurrency } from "@/lib/pricing/currency";
import type { CompraInterface, StoredContact } from "@/types/interfaces_Cart";

const INITIAL_PURCHASE: CompraInterface = {
  pago: "cash",
  pedido: [],
  total: 0,
  lugar: "Local",
  phonenumber: "",
  descripcion: "",
  direccion: "",
  shipping: 0,
  code: { discount: 0, name: "" },
  people: "",
  moneda: "",
};

type PendingOrderRef = {
  snapshot: CompraInterface;
  uid: string;
  eventId?: number;
};

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const newUID = useMemo(() => uuidv4(), []);
  const [currentStep, setCurrentStep] = useState(1);
  const { store, dispatchStore } = useContext(MyContext);
  const [count, setCount] = useState<number>(3);
  const [downloading, setDownloading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  console.log(store);
  const pendingOrderRef = useRef<PendingOrderRef | null>(null);
  const hasSentWhatsappRef = useRef(false);
  const isUploadingRef = useRef(false);
  // Ref para guardar la ventana abierta antes del await
  const waWindowRef = useRef<Window | null>(null);

  const persistedCustomerInfo = useMemo(
    () => loadStoredCartContact(store.sitioweb || ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [purchase, setPurchase] = useState<CompraInterface>({
    ...INITIAL_PURCHASE,
    people: persistedCustomerInfo.nombre,
    phonenumber: persistedCustomerInfo.phone.startsWith("+")
      ? persistedCustomerInfo.phone.slice(1)
      : persistedCustomerInfo.phone,
    lugar: persistedCustomerInfo.lugar || "Local",
    direccion: persistedCustomerInfo.direccion || "",
    descripcion: persistedCustomerInfo.descripcion || "",
  });
  console.log(purchase);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    const afiliateCode = store.afiliate
      ? store.codeDiscount.find((c) => c.code === store.afiliate)
      : undefined;

    const code = afiliateCode
      ? { discount: afiliateCode.discount || 0, name: afiliateCode.code || "" }
      : { discount: 0, name: "" };

    setPurchase((previousPurchase) => {
      const targetCurrency = store.moneda.find((m) => m.defecto) ?? {
        id: 0,
        valor: 1,
        nombre: "",
      };
      const targetRate = targetCurrency.valor ?? 1;
      const targetCurrencyName = targetCurrency.nombre ?? "";

      const orderItems = store.products
        .filter((p) => (p.selected_variant?.Cant ?? 0) > 0)
        .map((p) => {
          const sourceCurrency =
            store.moneda.find((m) => m.id === p.default_moneda) ??
            targetCurrency;
          const sourceRate = sourceCurrency?.valor ?? 1;

          const selectedVariant = p.selected_variant
            ? {
                ...p.selected_variant,
                basePrice: convertAndRoundCurrency(
                  getVariantBasePrice(p.selected_variant),
                  sourceRate,
                  targetRate,
                ),
                price: convertAndRoundCurrency(
                  p.selected_variant?.price ?? 0,
                  sourceRate,
                  targetRate,
                ),
                embalaje: convertAndRoundCurrency(
                  p.selected_variant?.embalaje ?? 0,
                  sourceRate,
                  targetRate,
                ),
                priceCompra: convertAndRoundCurrency(
                  p.selected_variant?.priceCompra ?? 0,
                  sourceRate,
                  targetRate,
                ),
                quantity_discounts:
                  p.selected_variant.quantity_discounts?.map((rule) => ({
                    ...rule,
                    value:
                      rule.type === "percentage"
                        ? rule.value
                        : convertAndRoundCurrency(
                            rule.value,
                            sourceRate,
                            targetRate,
                          ),
                  })) ?? [],
              }
            : p.selected_variant;

          return {
            ...p,
            default_moneda: targetCurrency.id ?? 0,
            selected_variant: selectedVariant,
          };
        });

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
        moneda: targetCurrencyName,
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
  ]);

  useEffect(() => {
    if (purchase.pedido.length === 0 && store.sitioweb) {
      const interval = setInterval(() => setCount((prev) => prev - 1), 1000);
      const timeout = setTimeout(
        () => router.push(`/t/${store.sitioweb}`),
        3000,
      );
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [purchase.pedido.length, store.sitioweb, router]);

  useEffect(() => {
    if (!store.sitioweb) return;
    saveStoredCartContact(store.sitioweb, {
      nombre: purchase.people,
      phone: purchase.phonenumber,
      lugar: purchase.lugar,
      direccion: purchase.direccion,
      descripcion: purchase.descripcion,
    });
  }, [
    purchase.people,
    purchase.phonenumber,
    purchase.lugar,
    purchase.direccion,
    purchase.descripcion,
    store.sitioweb,
  ]);

  const buildWhatsAppMessage = useCallback(
    (order: CompraInterface, id: number, uid?: string) => {
      const moneda = store.moneda.find((m) => m.defecto)?.nombre || "";
      const subtotalPedido = smartRound(order.total);
      const codeDiscountAmount = smartRound(
        subtotalPedido * (order.code.discount / 100),
      );
      const orderTotal = smartRound(
        subtotalPedido - codeDiscountAmount + smartRound(order.shipping),
      );

      let mensaje = `🛒 *SOLICITUD DE ${store.compraUUID ? "MODIFICACIÓN" : "NUEVO"} DE PEDIDO*\n`;
      mensaje += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      mensaje += `📋 *Información del Pedido*\n`;
      mensaje += `• ID de Venta: *#${id}*\n`;
      mensaje += `• Cliente: ${order.people}\n`;
      mensaje += `• Método de envío: ${order.lugar}\n`;
      if (order.direccion) mensaje += `• Dirección: ${order.direccion}\n`;
      if (order.descripcion) mensaje += `• Aclaración: ${order.descripcion}\n`;

      mensaje += `\n📦 *Productos*\n`;
      mensaje += `──────────────────────\n`;

      order.pedido.forEach((producto, index) => {
        const quantity = producto.selected_variant?.Cant || 0;
        if (quantity <= 0) return;

        const unitPrice = producto.selected_variant?.price || 0;
        const packaging = producto.selected_variant?.embalaje || 0;
        const subtotal = ((unitPrice + packaging) * quantity).toFixed(2);
        const activeDiscount = getApplicableDiscount(
          producto.selected_variant,
          quantity,
        );
        const baseUnitPrice = getVariantBasePrice(producto.selected_variant);

        mensaje += `${index + 1}. ${buildCartTitle(
          producto.title,
          producto.selected_variant,
        )}\n`;
        mensaje += `   Cantidad: x${quantity} — Precio unitario: ${unitPrice.toFixed(2)} ${moneda}\n`;

        if (activeDiscount) {
          mensaje += `   Descuento aplicado: ${discountLabel(activeDiscount)}\n`;
        } else if (baseUnitPrice > unitPrice) {
          mensaje += `   Precio base: ${baseUnitPrice.toFixed(2)} ${moneda}\n`;
        }

        if (packaging > 0) {
          mensaje += `   Embalaje: ${packaging.toFixed(2)} ${moneda} por unidad\n`;
        }

        mensaje += `   Subtotal: ${subtotal} ${moneda}\n`;
      });

      mensaje += `──────────────────────\n`;
      mensaje += `\n💰 *Resumen de Pago*\n`;
      mensaje += `• Subtotal: *${subtotalPedido.toFixed(2)} ${moneda}*\n`;
      if (order.code.discount > 0) {
        mensaje += `• Descuento: *-${codeDiscountAmount.toFixed(2)} ${moneda}*\n`;
      }
      if (order.lugar !== "Local") {
        mensaje += `• Costo de domicilio: $${smartRound(order.shipping).toFixed(2)}\n`;
      }
      mensaje += `• Total de la orden: *${orderTotal.toFixed(2)} ${moneda}*\n`;
      mensaje += `• Moneda: ${order.moneda}\n`;
      if (order.code.name) {
        mensaje += `• Código de ${store.afiliate ? "Afiliado" : "Descuento"}: *${order.code.name}*\n`;
      }
      mensaje += `• Numero de telefono: *${order.phonenumber}*\n`;

      if (uid) {
        mensaje += `\n🔗 *Enlace del pedido:*\n`;
        mensaje += `https://rouadmin.vercel.app/orders/${uid}\n`;
      }

      mensaje += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
      mensaje += `_Gracias por confiar en nosotros._ 🙏`;

      return mensaje;
    },
    [store.afiliate, store.compraUUID, store.moneda],
  );

  // Abre WhatsApp usando la ventana pre-abierta (si existe) o con window.open como fallback
  const sendWhatsAppOnce = useCallback(
    (eventId: number) => {
      const pending = pendingOrderRef.current;
      if (!pending || hasSentWhatsappRef.current) return;

      const mensaje = buildWhatsAppMessage(
        pending.snapshot,
        eventId,
        pending.uid,
      );
      const url = `https://wa.me/${store.cell}?text=${encodeURIComponent(mensaje)}`;

      hasSentWhatsappRef.current = true;

      // Simular click en <a> evita el bloqueo de popup en la mayoría de navegadores
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      dispatchStore({ type: "Clean" });
    },
    [buildWhatsAppMessage, dispatchStore, store.cell],
  );

  const handleOrderClick = useCallback(async () => {
    if (isUploadingRef.current) return;
    if (hasSentWhatsappRef.current) return;

    if (purchase.people === "") {
      sileo.error({
        title: "Sin destinatario",
        description: "Ingrese un nombre para continuar con su pedido",
      });
      return;
    }

    if (!isValidPhoneNumber(`+${purchase.phonenumber}`)) {
      sileo.error({
        title: "Número de teléfono inválido",
        description: "Por favor, ingrese un número de teléfono válido",
      });
      return;
    }

    if (purchase.total === 0) {
      sileo.error({
        title: "No hay productos en su carrito",
        description: "Agregue productos a su carrito antes de continuar",
      });
      return;
    }

    if (!store.sitioweb) return;

    // ✅ Abrimos la ventana AQUÍ, en el contexto directo del click del usuario,
    // antes de cualquier await. Esto evita que el navegador la bloquee como popup.

    isUploadingRef.current = true;
    setDownloading(true);

    const snapshot = structuredClone(purchase);
    const uid = store.compraUUID || newUID;

    pendingOrderRef.current = {
      snapshot,
      uid,
    };

    try {
      const data = await UploadPedido({
        UUID_Shop: store.UUID,
        events: "compra",
        descripcion: snapshot.descripcion,
        date: getLocalISOString(),
        desc: snapshot,
        uid,
        nombre: snapshot.people,
        phonenumber: snapshot.phonenumber,
        user_id: user?.id || "ac645d7e-af66-47fd-befc-46300a2daeb4",
      });

      if (pendingOrderRef.current) {
        pendingOrderRef.current.eventId = data.event_id;
      }

      const saved = window.localStorage.getItem(`${store.sitioweb}-userRating`);

      if (saved !== null) {
        sendWhatsAppOnce(data.event_id);
        if (store.compraUUID) router.push("/user");
        else router.back();
      } else {
        // Guardamos el event_id en el ref del pedido y mostramos el modal de rating.
        // La ventana waWindowRef queda guardada para usarla en handleCloseRating.
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error(err);
      // Si hubo error, cerramos la ventana vacía que abrimos para no dejar tabs huérfanos
      if (waWindowRef.current && !waWindowRef.current.closed) {
        waWindowRef.current.close();
        waWindowRef.current = null;
      }
      sileo.error({
        title: "Error al enviar el pedido",
        description: "No se pudo completar la solicitud. Intente nuevamente.",
      });
    } finally {
      isUploadingRef.current = false;
      setDownloading(false);
    }
  }, [purchase, store, newUID, user, router, sendWhatsAppOnce]);

  const handleCloseRating = useCallback(() => {
    setShowRatingModal(false);

    const pending = pendingOrderRef.current;
    if (!pending?.eventId) {
      if (store.compraUUID) router.push("/user");
      else router.back();
      return;
    }

    sendWhatsAppOnce(pending.eventId);

    if (store.compraUUID) router.push("/user");
    else router.back();
  }, [router, sendWhatsAppOnce, store.compraUUID]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (purchase.pedido.length === 0) return <CartClean count={count} />;

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4">
        <StepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />

        {currentStep === 1 && (
          <>
            <div className="min-h-screen space-y-2">
              <CartItems compra={purchase} setCompra={setPurchase} />
              {store.marketing && store.codeDiscount && !store.afiliate && (
                <CodeDiscount compra={purchase} setCompra={setPurchase} />
              )}
            </div>

            <div className="sticky bottom-0 flex justify-between items-center py-3 px-0 bg-background/80 backdrop-blur-lg">
              <Button
                onClick={() => setCurrentStep(2)}
                className="h-12 rounded-full w-full font-semibold gap-2 active:scale-[0.98] transition-all"
              >
                {purchase.pedido.length === 0
                  ? "Explorar Productos"
                  : "Continuar"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-2">
            <Details compra={purchase} setCompra={setPurchase} />
            <Resumen
              compra={purchase}
              handleOrderClick={handleOrderClick}
              downloading={downloading}
            />
          </div>
        )}

        <PreviewRatingGeneral
          reviewOpen={showRatingModal}
          onClose={handleCloseRating}
        />
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          50% {
            transform: translateY(-10%);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

const StepIndicator = memo(function StepIndicator({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (s: number) => void;
}) {
  return (
    <div className="flex items-center justify-center mb-3 sticky top-12 backdrop-blur-lg z-10 bg-background/70 py-2">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setCurrentStep(1)}
          className={`w-9 h-9 rounded-full text-xs font-semibold transition-all duration-300 ${
            currentStep >= 1
              ? "bg-foreground text-background shadow-sm"
              : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          1
        </Button>

        <div
          className={`w-16 h-0.5 transition-colors duration-300 rounded-full ${
            currentStep >= 2 ? "bg-foreground" : "bg-border"
          }`}
        />

        <Button
          onClick={() => setCurrentStep(2)}
          className={`w-9 h-9 rounded-full text-xs font-semibold transition-all duration-300 ${
            currentStep >= 2
              ? "bg-foreground text-background shadow-sm"
              : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          2
        </Button>
      </div>
    </div>
  );
});

const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 19);
};

function saveStoredCartContact(sitioweb: string, data: StoredContact) {
  try {
    window.localStorage.setItem(
      `${sitioweb}-informationCart`,
      JSON.stringify(data),
    );
  } catch {}
}

function loadStoredCartContact(sitioweb: string): StoredContact {
  try {
    const saved = localStorage.getItem(`${sitioweb}-informationCart`);
    return saved ? JSON.parse(saved) : { nombre: "", phone: "" };
  } catch {
    return { nombre: "", phone: "" };
  }
}
