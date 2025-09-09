"use client";
import React, { useContext, useState, useEffect } from "react";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
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
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartClean from "./CartClean";

export interface CompraInterface {
  envio: string;
  pago: string;
  pedido: Product[];
  total: number;
  lugar: string;
  phonenumber: string;
  shipping: number;
  descripcion: string;
  direccion: string;
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
  lugar: "Local",
  phonenumber: "",
  descripcion: "",
  direccion: "",
  shipping: 0,
  code: { discount: 0, name: "" },
  people: "",
};
export default function CarritoPage() {
  const newUID = uuidv4();
  const [currentStep, setCurrentStep] = useState(1);
  const { store, dispatchStore } = useContext(MyContext);
  const router = useRouter();
  const [count, setCount] = useState<number>(3);
  const [downloading, setDownloading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [compra, setCompra] = useState<CompraInterface>(initialState);
  console.log(compra);
  useEffect(() => {
    setCompra((prevCompra) => ({
      ...prevCompra,
      lugar: "",
      pedido: store.products.filter((obj) => obj.Cant > 0),
      total: store.products.reduce(
        (total, item) =>
          total +
          ((item.price || 0) + (item.embalaje == 0 ? 1 : item.embalaje)) *
            item.Cant +
          (item?.agregados.reduce(
            (sum, agg) =>
              (sum =
                sum + (agg.price + (item.embalaje == 0 ? 1 : item.embalaje))) *
              agg.cant,
            0
          ) || 0),
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
      (compra.envio === "delivery" && compra.lugar)
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
      compra.lugar
    }\n- ID de Venta: ${newUID}\n
    - Direccion: ${compra.direccion}\n
    - Extra: ${compra.descripcion}\n
    \n- Productos:\n`;

    compra.pedido.forEach((producto, index) => {
      if (producto.Cant > 0) {
        mensaje += `   ${index + 1}. ${producto.title} x${producto.Cant}: ${(
          producto.Cant *
          (producto.price + producto.embalaje)
        ).toFixed(
          2
        )} - ${producto.embalaje > 0 && `Embalaje:${producto.embalaje}`}\n`;
      }
      producto.agregados
        .filter((o) => o.cant > 0)
        .map((obj) => {
          mensaje += `   ${index + 1}. ${producto.title}-${obj.name} x${obj.cant}: ${(
            obj.cant *
            (obj.price + producto.embalaje)
          ).toFixed(
            2
          )} - ${producto.embalaje > 0 && `Embalaje:${producto.embalaje}`}\n`;
        });
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

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-2">
      <div className="flex items-center rounded-full p-1">
        <div className="flex items-center">
          <Button
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 1
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-transparent text-gray-400"
            }`}
            onClick={() => setCurrentStep(1)}
          >
            1
          </Button>
          <div
            className={`w-20 h-0.5 mx-3 transition-colors duration-300 ${currentStep >= 2 ? "bg-gray-800" : "bg-gray-200"}`}
          ></div>
          <Button
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 2
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-transparent text-gray-400"
            }`}
          >
            2
          </Button>
        </div>
      </div>
    </div>
  );

  return compra.pedido.length > 0 ? (
    <div>
      <div className=" px-4 py-4">
        <StepIndicator />

        {/* Items de la Compra*/}
        {currentStep === 1 && (
          <>
            <div className="min-h-screen space-y-2">
              <CartItems />
              {store.marketing && store.codeDiscount && (
                <CodeDiscount compra={compra} setCompra={setCompra} />
              )}
            </div>
            <div className="sticky bottom-0 flex justify-between items-center p-2 ">
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-800 w-full hover:bg-gray-900 text-white py-4 rounded-full font-medium transition-all duration-200"
              >
                {compra.pedido.length === 0
                  ? "Explorar Productos"
                  : "Continuar"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Detalles de la compra*/}
            <Details compra={compra} setCompra={setCompra} />
            {/* Order Summary */}
            <Resumen
              compra={compra}
              handleOrderClick={handleOrderClick}
              downloading={downloading}
            />
          </>
        )}
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
  ) : (
    <CartClean count={count} />
  );
}
const getLocalISOString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 19);
};
