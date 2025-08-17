"use client";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "@/context/MyContext";
import { Product, Sends } from "@/context/InitialStatus";

import { toast } from "sonner";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useRouter } from "next/navigation";
import { UploadPedido } from "./UploadPedido";
import Details from "./Details";
import Resumen from "./Resumen";
import CodeDiscount from "./CodeDiscount";
import CartItems from "./CartItems";
import { v4 as uuidv4 } from "uuid";
import { Rating } from "../About/RatingModal";
import { smartRound } from "@/functions/precios";

export interface CompraInterface {
  envio: string;
  pago: string;
  pedido: Product[];
  total: number;
  provincia: string;
  phonenumber: string;
  municipio: string;
  shipping: number;
  descripcion: string;
  code: { discount: number; name: string };
  people: string;
}
export interface UploadCompraInterface {
  UUID_Shop: string;
  events: string;
  date: string;
  desc: string;
  descripcion: string;
  uid: string;
  nombre: string;
  phonenumber: string;
}
const initialState = {
  envio: "pickup",
  pago: "cash",
  pedido: [],
  total: 0,
  provincia: "",
  phonenumber: "",
  descripcion: "",
  municipio: "",
  shipping: 0,
  code: { discount: 0, name: "" },
  people: "",
};
export default function CarritoPage() {
  const newUID = uuidv4();
  const { store, dispatchStore } = useContext(MyContext);
  const router = useRouter();
  const [count, setCount] = useState<number>(3);
  const [downloading, setDownloading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [compra, setCompra] = useState<CompraInterface>(initialState);

  useEffect(() => {
    setCompra((prevCompra) => ({
      ...prevCompra,
      provincia:
        prevCompra.provincia == ""
          ? (store.envios || ([] as Sends[]))[0]?.nombre
          : prevCompra.provincia,
      pedido: store.products.filter((obj) => obj.Cant > 0),
      total: store.products.reduce(
        (total, item) => total + (item.price || 0) * item.Cant,
        0
      ),
    }));
  }, [store.envios, store.products]);

  //Detectar si no  hay productos en el carrito
  useEffect(() => {
    if (compra.pedido.length === 0 && store.sitioweb) {
      // Iniciar el contador regresivo
      const interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      // Redirigir después de 3 segundos
      const timeout = setTimeout(() => {
        router.push(`/t/${store.sitioweb}`);
      }, 3000);

      // Limpiar intervalos y timeouts al desmontar
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [compra.pedido.length, store.sitioweb, router]);

  const handleOrderClick = async () => {
    if (isValidPhoneNumber(`+${compra.phonenumber}`) === false) {
      toast("Error", {
        description: "El numero proporcionado es incorrecto",
      });
      return;
    }
    if (compra.total === 0) {
      toast("Error", {
        description: "No hay productos en su carrito",
      });
      return;
    }
    if (compra.people === "") {
      toast("Error", {
        description: "Tiene que introducir un encargado de su compra",
      });
      return;
    }
    if (
      compra.envio === "pickup" ||
      (compra.envio === "delivery" && compra.provincia && compra.municipio)
    ) {
      if (store.sitioweb) {
        // Inicializa Analytics
        try {
          setDownloading(true);
          await UploadPedido({
            UUID_Shop: store.UUID,
            events: "compra",
            descripcion: compra.descripcion,
            date: getLocalISOString(),
            desc: JSON.stringify(compra),
            uid: newUID,
            nombre: compra.people,
            phonenumber: compra.phonenumber,
          });

          // Pausa para calificar la tienda
          const saved = window.localStorage.getItem(
            `${store.sitioweb}-userRating`
          );
          if (saved !== null) {
            sendToWhatsapp();
          } else {
            setShowRatingModal(true);
          }
          // Muestra una alerta con la calificación o realiza alguna acción
        } catch (error) {
          toast(`Error`, {
            description: `No ha declarado la ubicación de su domicilio ${error}`,
          });
        } finally {
          setDownloading(false);
        }
      }
    } else {
      toast(`Error `, {
        description: "Ha ocurrido un error inesperado",
      });
    }
  };

  const sendToWhatsapp = () => {
    // Abrir WhatsApp

    let mensaje = `Hola, Quiero realizar este pedido:\n- Metodo de envio: ${
      compra.envio === "pickup" ? "Recoger en Tienda" : "Envío a Domicilio"
    }\n- Tipo de Pago: ${
      compra.pago === "cash" ? "Efectivo" : "Transferencia"
    }\n${
      compra.envio !== "pickup"
        ? `- Provincia: ${compra.provincia}\n- Municipio: ${compra.municipio}\n`
        : ""
    }- ID de Venta: ${newUID}\n\n- Productos:\n`;

    compra.pedido.forEach((producto, index) => {
      if (producto.Cant > 0) {
        mensaje += `   ${index + 1}. ${producto.title} x${producto.Cant}: ${(
          producto.Cant *
          producto.price *
          (1 / store.moneda_default.valor)
        ).toFixed(2)}\n`;
      }
    });
    const discountTotal =
      smartRound(compra.total) * (1 - compra.code.discount / 100);

    mensaje += `- Total de la orden: ${discountTotal} ${store.moneda_default.moneda}\n`;
    if (compra.envio !== "pickup") {
      mensaje += `- Domicilio: $${compra.shipping}`;
    }
    if (compra.code.name) {
      mensaje += `- Codigo de Descuento: ${compra.code.name}\n`;
    }
    mensaje += `- Identificador ${newUID}\n`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${store.cell}?text=${mensajeCodificado}`;
    dispatchStore({ type: "Clean" });
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <div>
      <main className="p-4 space-y-4">
        {/* Items de la Compra*/}
        <CartItems count={count} />

        {/* Detalles de la compra*/}
        <Details compra={compra} setCompra={setCompra} />
        {/* Codigo Descuento */}
        {store.marketing && store.codeDiscount && (
          <CodeDiscount compra={compra} setCompra={setCompra} />
        )}
        {/* Order Summary */}
        <Resumen
          compra={compra}
          handleOrderClick={handleOrderClick}
          downloading={downloading}
        />

        <Rating
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            sendToWhatsapp();
          }}
          sendToWhatsapp={sendToWhatsapp}
          starsSelected={0}
          userName="User"
          setIsModalOpen={setShowRatingModal}
        />
      </main>
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

        @keyframes slideOutRight {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 19);
};
