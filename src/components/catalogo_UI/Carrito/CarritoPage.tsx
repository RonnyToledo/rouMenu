"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { smartRound } from "@/functions/precios";
import CartClean from "./CartClean";
import { useApp, useAuth } from "@/context/AppContext";
import PreviewRatingGeneral from "../General/PreviewRatingGeneral";
import { motion, AnimatePresence } from "framer-motion";
import Details from "./Details";
import Resumen from "./Resumen";
import CodeDiscount from "./CodeDiscount";
import CartItems from "./CartItems";
import CartDock from "../../cart/CartDock";
import StepIndicator from "../../cart/StepIndicator";
import { useSyncPurchaseWithStore } from "@/hooks/useSyncPurchaseWithStore";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { useOrderSubmission } from "@/hooks/useOrderSubmission";
import {
  loadStoredCartContact,
  saveStoredCartContact,
} from "../../cart/CartContactStorage";
import type { CompraInterface } from "@/types/interfaces_Cart";

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

const stepVariants = {
  enter: (step: number) => ({ opacity: 0, x: step === 1 ? -24 : 24 }),
  center: { opacity: 1, x: 0 },
  exit: (step: number) => ({ opacity: 0, x: step === 1 ? 24 : -24 }),
};

export default function CartPage() {
  const router = useRouter();
  const { generalData } = useApp();
  const { user, loading } = useAuth();
  const { store, dispatchStore } = useContext(MyContext);

  const newUID = useMemo(() => uuidv4(), []);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [count, setCount] = useState(3);

  const persistedContact = useMemo(
    () => loadStoredCartContact(store.sitioweb || ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [purchase, setPurchase] = useState<CompraInterface>({
    ...INITIAL_PURCHASE,
    people: persistedContact.nombre,
    phonenumber: persistedContact.phone.startsWith("+")
      ? persistedContact.phone.slice(1)
      : persistedContact.phone,
    lugar: persistedContact.lugar || "Local",
    direccion: persistedContact.direccion || "",
    descripcion: persistedContact.descripcion || "",
  });

  const { sentinelRef, isStuck } = useStickyHeader();

  useSyncPurchaseWithStore(store, setPurchase);

  const { downloading, showRatingModal, handleOrderClick, handleCloseRating } =
    useOrderSubmission({
      purchase,
      store,
      userId: user?.id,
      newUID,
      onOrderSent: () => dispatchStore({ type: "Clean" }),
    });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Redirige al home si el carrito quedó vacío (ej: tras enviar el pedido)
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

  // Persiste los datos de contacto/entrega para la próxima visita
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

  const totalItems = useMemo(
    () =>
      purchase.pedido.reduce(
        (total, item) => total + (item.selected_variant?.Cant || 0),
        0,
      ),
    [purchase.pedido],
  );

  const discountAmount = useMemo(
    () => smartRound((purchase.total * purchase.code.discount) / 100),
    [purchase.total, purchase.code.discount],
  );

  const grandTotal = useMemo(
    () => purchase.total + smartRound(purchase.shipping) - discountAmount,
    [purchase.total, purchase.shipping, discountAmount],
  );

  const moneda = store.moneda.find((m) => m.defecto)?.nombre || "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (purchase.pedido.length === 0) return <CartClean count={count} />;
  return (
    <div className="bg-background min-h-screen pb-28">
      <div ref={sentinelRef} className="h-px" />

      <div
        className={
          "sticky top-12 p-2 z-20 bg-background/80 backdrop-blur-lg border-b border-border/60 transition-transform duration-30"
        }
        style={{
          transform: !(isStuck && generalData.top_hidden)
            ? "translateY(0)"
            : "translateY(-48px)",
        }}
      >
        <StepIndicator
          currentStep={currentStep}
          setCurrentStep={(s) => setCurrentStep(s as 1 | 2)}
        />
      </div>

      <div className="px-4 pt-4 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={currentStep}>
          {currentStep === 1 ? (
            <motion.div
              key="step-1"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-2"
            >
              <CartItems compra={purchase} setCompra={setPurchase} />
              {store.marketing && store.codeDiscount && !store.afiliate && (
                <CodeDiscount compra={purchase} setCompra={setPurchase} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              custom={2}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-2"
            >
              <Details compra={purchase} setCompra={setPurchase} />
              <Resumen compra={purchase} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CartDock
        currentStep={currentStep}
        totalItems={totalItems}
        stepTotal={currentStep === 1 ? purchase.total : grandTotal}
        moneda={moneda}
        downloading={downloading}
        isModification={!!store.compraUUID}
        onContinue={() => setCurrentStep(2)}
        onSubmitOrder={handleOrderClick}
      />

      <PreviewRatingGeneral
        reviewOpen={showRatingModal}
        onClose={handleCloseRating}
      />
    </div>
  );
}
