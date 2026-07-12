import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { isValidPhoneNumber } from "libphonenumber-js";
// TODO: ajustar la ruta según dónde quede UploadPedido.tsx respecto a este hook
import { UploadPedido } from "../components/catalogo_UI/Carrito/UploadPedido";
import { buildWhatsAppOrderMessage } from "../components/catalogo_UI/Carrito/WhatsappMessage";
import { openWhatsAppLink } from "../components/catalogo_UI/Carrito/WhatsappLink ";
import type { CompraInterface } from "@/types/interfaces_Cart";
import { AppState } from "@/types/InitialStatus";

type PendingOrder = {
  snapshot: CompraInterface;
  uid: string;
  eventId?: number;
};

type UseOrderSubmissionArgs = {
  purchase: CompraInterface;
  store: AppState;
  userId?: string;
  newUID: string;
  onOrderSent: () => void; // ej: dispatchStore({ type: "Clean" })
};

const FALLBACK_USER_ID = "ac645d7e-af66-47fd-befc-46300a2daeb4";

export function useOrderSubmission({
  purchase,
  store,
  userId,
  newUID,
  onOrderSent,
}: UseOrderSubmissionArgs) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const pendingOrderRef = useRef<PendingOrder | null>(null);
  const hasSentWhatsappRef = useRef(false);
  const isUploadingRef = useRef(false);

  const moneda = store.moneda.find((m) => m.defecto)?.nombre || "";

  const goBackAfterOrder = useCallback(() => {
    if (store.compraUUID) router.push("/user");
    else router.back();
  }, [router, store.compraUUID]);

  const sendWhatsAppOnce = useCallback(
    (eventId: number) => {
      const pending = pendingOrderRef.current;
      if (!pending || hasSentWhatsappRef.current) return;

      const mensaje = buildWhatsAppOrderMessage(pending.snapshot, eventId, {
        moneda,
        isModification: !!store.compraUUID,
        isAfiliateCode: !!store.afiliate,
        adminOrderUid: pending.uid,
      });

      hasSentWhatsappRef.current = true;
      openWhatsAppLink(store.cell, mensaje);
      onOrderSent();
    },
    [moneda, store.compraUUID, store.afiliate, store.cell, onOrderSent],
  );

  const handleOrderClick = useCallback(async () => {
    if (isUploadingRef.current || hasSentWhatsappRef.current) return;

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

    isUploadingRef.current = true;
    setDownloading(true);

    const snapshot = structuredClone(purchase);
    const uid = store.compraUUID || newUID;
    pendingOrderRef.current = { snapshot, uid };

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
        user_id: userId || FALLBACK_USER_ID,
      });

      if (pendingOrderRef.current) {
        pendingOrderRef.current.eventId = data.event_id;
      }

      const alreadyRated =
        window.localStorage.getItem(`${store.sitioweb}-userRating`) !== null;

      if (alreadyRated) {
        sendWhatsAppOnce(data.event_id);
        goBackAfterOrder();
      } else {
        setShowRatingModal(true);
      }
    } catch (err) {
      console.error(err);
      sileo.error({
        title: "Error al enviar el pedido",
        description: "No se pudo completar la solicitud. Intente nuevamente.",
      });
    } finally {
      isUploadingRef.current = false;
      setDownloading(false);
    }
  }, [purchase, store, newUID, userId, sendWhatsAppOnce, goBackAfterOrder]);

  const handleCloseRating = useCallback(() => {
    setShowRatingModal(false);

    const pending = pendingOrderRef.current;
    if (!pending?.eventId) {
      goBackAfterOrder();
      return;
    }

    sendWhatsAppOnce(pending.eventId);
    goBackAfterOrder();
  }, [sendWhatsAppOnce, goBackAfterOrder]);

  return {
    downloading,
    showRatingModal,
    handleOrderClick,
    handleCloseRating,
  };
}

const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 19);
};
