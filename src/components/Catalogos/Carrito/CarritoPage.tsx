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
import { smartRound } from "@/functions/precios";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartClean from "./CartClean";
import { useAuth } from "@/context/AppContext";
import { redondearAMultiploDe5 } from "@/reducer/reducerGeneral";
import PreviewRatingGeneral from "../General/PreviewRatingGeneral";

export interface CompraInterface {
  pago: string;
  pedido: Product[];
  total: number;
  lugar: string;
  phonenumber: string;
  shipping: number;
  descripcion: string;
  direccion: string;
  code: { discount: number; name: string };

  moneda: string;
  people: string;
}
export interface UploadCompraInterface {
  UUID_Shop: string;
  events: string;
  date: string;
  desc: CompraInterface;
  descripcion: string;
  uid: string;
  nombre: string;
  phonenumber: string;
  user_id: string;
}
const initialState = {
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
export default function CarritoPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const newUID = uuidv4();
  const [currentStep, setCurrentStep] = useState(1);
  const [iDCompra, setIDCompra] = useState<number>(1);
  const { store, dispatchStore } = useContext(MyContext);
  const [count, setCount] = useState<number>(3);
  const [downloading, setDownloading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [data, setData] = useState(GetInformationCart(store.sitioweb || ""));
  const [compra, setCompra] = useState<CompraInterface>({
    ...initialState,
    people: data.nombre,
    phonenumber: data.phone.startsWith("+") ? data.phone.slice(1) : data.phone,
  });
  // Protección adicional en el cliente (por si el middleware falla)

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    const code = store.afiliate
      ? {
          discount:
            store.codeDiscount.find((code) => code.code === store.afiliate)
              ?.discount || 0,
          name:
            store.codeDiscount.find((code) => code.code === store.afiliate)
              ?.code || "",
        }
      : { discount: 0, name: "" };

    // Uso dentro de setCompra
    setCompra((prevCompra) => {
      // 1) moneda destino (la del store marcada como defecto)
      const monedaDestino = store.moneda.find((m) => m.defecto) ?? {
        id: 0,
        valor: 1,
        nombre: "",
      };
      const valorDestino = monedaDestino.valor ?? 1;
      const nombreDestino = monedaDestino.nombre ?? "";

      // 2) construir pedido convertido (usamos product.default_moneda como moneda origen si existe)
      const pedido = store.products
        .filter(
          (obj) => obj.Cant > 0 || obj.agregados.some((agg) => agg.cant > 0),
        )
        .map((p) => {
          // encontrar valor origen (si product tiene default_moneda)
          const monedaOrigen =
            store.moneda.find((m) => m.id === p.default_moneda) ??
            monedaDestino;
          const valorOrigen = monedaOrigen?.valor ?? 1;

          const convertedPrice = convertirYRedondear(
            p.price ?? 0,
            valorOrigen,
            valorDestino,
          );
          const convertedEmbalaje = convertirYRedondear(
            p.embalaje ?? 0,
            valorOrigen,
            valorDestino,
          );
          const convertedPriceCompra = convertirYRedondear(
            p.priceCompra ?? 0,
            valorOrigen,
            valorDestino,
          );

          const agregados = (p.agregados ?? []).map((a) => {
            const aPrice = convertirYRedondear(
              a.price ?? 0,
              valorOrigen,
              valorDestino,
            );
            return {
              ...a,
              price: aPrice,
            };
          });

          return {
            ...p,
            price: convertedPrice,
            embalaje: convertedEmbalaje,
            priceCompra: convertedPriceCompra,
            default_moneda: monedaDestino.id ?? 0, // ahora indicamos que mostramos en monedaDestino
            agregados,
          };
        });

      // 3) calcular total usando los valores convertidos
      const total = pedido.reduce((acc, item) => {
        const qty = item.Cant ?? 0;

        // total por producto: (precio + embalaje) * cantidad
        const productLine = ((item.price ?? 0) + (item.embalaje ?? 0)) * qty;

        // agregados: sumar (precio_agregado + embalaje_por_producto) * cantidad_agregado
        // Nota: conservo tu intención original de sumar embalaje por cada agregado; si no lo quieres, quita +(item.embalaje ?? 0)
        const agregadosSum =
          (item.agregados ?? []).reduce((sum, agg) => {
            const aggQty = agg.cant ?? 0;
            return sum + ((agg.price ?? 0) + (item.embalaje ?? 0)) * aggQty;
          }, 0) || 0;

        return acc + productLine + agregadosSum;
      }, 0);

      // opcional: redondear total final a moneda
      const totalRedondeado = smartRound(total);

      return {
        ...prevCompra,
        code,
        moneda: nombreDestino,
        pedido,
        total: totalRedondeado,
      };
    });
  }, [
    store.envios,
    store.products,
    store.moneda,
    store.afiliate,
    store.codeDiscount,
  ]);

  //Detectar si no  hay productos en el carrito
  useEffect(() => {
    if (store.sitioweb) {
      setData(GetInformationCart(store.sitioweb || ""));
    }
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
    setDownloading(true);

    if (compra.people === "") {
      toast.error("Tiene que introducir un encargado de su compra");
      return;
    }
    if (isValidPhoneNumber(`+${compra.phonenumber}`) === false) {
      toast.error("El numero proporcionado es incorrecto");
      return;
    }
    if (compra.total === 0) {
      toast.error("No hay productos en su carrito");
      return;
    }

    if (store.sitioweb) {
      // Inicializa Analytics
      const uploadFlow = async () => {
        try {
          const data = await UploadPedido({
            UUID_Shop: store.UUID,
            events: "compra",
            descripcion: compra.descripcion,
            date: getLocalISOString(),
            desc: compra,
            uid: store.compraUUID ?? newUID,
            nombre: compra.people,
            phonenumber: compra.phonenumber,
            user_id: user?.id || "ac645d7e-af66-47fd-befc-46300a2daeb4" || "",
          });
          setIDCompra(data.event_id);
          // Pausa para calificar la tienda (lógica después de subir)
          const saved = window.localStorage.getItem(
            `${store.sitioweb}-userRating`,
          );
          if (saved !== null) {
            await sendToWhatsapp(data.event_id);
            if (store.compraUUID) router.push("/user");
            else router.back();
          } else {
            setShowRatingModal(true);
          }

          // Devuelvo un objeto con info útil para el mensaje de éxito
          return { name: compra.people || "Pedido" };
        } catch (err) {
          // Vuelvo a lanzar para que toast.promise muestre el error
          throw err;
        } finally {
          setDownloading(false);
        }
      };

      toast.promise(uploadFlow(), {
        loading: "Enviando pedido...",
        success: (data) => `${data.name} — pedido enviado correctamente.`,
        error: (err) => {
          return err?.message || err;
        },
      });
    }
  };
  const sendToWhatsapp = async (id: number) => {
    // Abrir WhatsApp

    let mensaje = `Hola, Quiero modificar este pedido:\n- Metodo de envio: ${
      compra.lugar
    }\nA nombre de:${compra.people}\n`;

    mensaje += `- ID de Venta: ${id}\n`;
    if (compra.direccion) mensaje += `- Direccion: ${compra.direccion}\n`;
    if (compra.descripcion) mensaje += `- Aclaración: ${compra.descripcion}\n`;

    mensaje += `\n- Productos:\n`;
    compra.pedido.forEach((producto, index) => {
      if (producto.Cant > 0) {
        mensaje += `   ${index + 1}. ${producto.title} x${producto.Cant}: ${(
          producto.Cant * producto.price
        ).toFixed(
          2,
        )} - ${producto.embalaje > 0 ? `Embalaje:${producto.embalaje}` : ""}\n`;
      }
      producto.agregados
        .filter((o) => o.cant > 0)
        .map((obj) => {
          mensaje += `   ${index + 1}. ${producto.title}-${obj.name} x${obj.cant}: ${(
            obj.cant * obj.price
          ).toFixed(
            2,
          )} - ${producto.embalaje > 0 ? `Embalaje:${producto.embalaje}` : ""}\n`;
        });
    });
    const discountTotal =
      smartRound(compra.total) * (1 - compra.code.discount / 100);

    mensaje += `- Total de la orden: ${discountTotal} ${store.moneda.find((m) => m.defecto)?.nombre || ""}\n`;
    if (compra.lugar !== "Local") {
      mensaje += `- Domicilio: $${compra.shipping}\n`;
    }
    mensaje += `- Moneda: $${compra.moneda}\n`;
    if (compra.code.name) {
      mensaje += `- Codigo de ${store.afiliate ? "Afilado" : "Descuento"}: ${compra.code.name}\n`;
    }
    SavedInformationCart(
      store.sitioweb || "",
      compra.people,
      compra.phonenumber,
    );

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${store.cell}?text=${mensajeCodificado}`;
    dispatchStore({ type: "Clean" });
    window.open(urlWhatsApp, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-2 sticky top-14 backdrop-blur-lg z-10">
      <div className="flex items-center rounded-full p-1">
        <div className="flex items-center">
          <Button
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 1
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-transparent text-slate-400"
            }`}
            onClick={() => setCurrentStep(1)}
          >
            1
          </Button>
          <div
            className={`w-20 h-0.5 mx-3 transition-colors duration-300 ${currentStep >= 2 ? "bg-slate-800" : "bg-slate-200"}`}
          ></div>
          <Button
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
              currentStep >= 2
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-transparent text-slate-400"
            }`}
            onClick={() => setCurrentStep(2)}
          >
            2
          </Button>
        </div>
      </div>
    </div>
  );
  return compra.pedido.length > 0 ? (
    <div>
      <div className="h-16"></div>
      <div className=" px-4">
        <StepIndicator />

        {/* Items de la Compra*/}
        {currentStep === 1 && (
          <>
            <div className="min-h-screen space-y-2">
              <CartItems compra={compra} setCompra={setCompra} />
              {store.marketing && store.codeDiscount && !store.afiliate && (
                <CodeDiscount compra={compra} setCompra={setCompra} />
              )}
            </div>
            <div className="sticky bottom-0 flex justify-between items-center p-2 ">
              <Button
                onClick={() => setCurrentStep(2)}
                className="py-5 rounded-full w-full"
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
        <PreviewRatingGeneral
          reviewOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            sendToWhatsapp(iDCompra);
          }}
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
function SavedInformationCart(sitioweb: string, nombre: string, phone: string) {
  window.localStorage.setItem(
    `${sitioweb}-informationCart`,
    JSON.stringify({ nombre, phone }),
  );
}
function GetInformationCart(sitioweb: string): {
  nombre: string;
  phone: string;
} {
  const saved = localStorage.getItem(`${sitioweb}-informationCart`) || "";
  if (saved) {
    return JSON.parse(saved);
  } else {
    return { nombre: "", phone: "" };
  }
}
export function convertirYRedondear(
  amount: number,
  valorSrc: number,
  valorDst: number,
) {
  const a = Number(amount ?? 0);
  if (!isFinite(a)) return 0;
  const vs = Number(valorSrc ?? 1) || 1;
  const vd = Number(valorDst ?? 1) || 1;
  if (vd === 0) return smartRound(redondearAMultiploDe5(a * vs)); // fallback defensivo
  const converted = (a * vs) / vd;
  return smartRound(redondearAMultiploDe5(converted));
}
