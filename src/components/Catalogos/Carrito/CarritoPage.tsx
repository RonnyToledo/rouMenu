"use client";
import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { MyContext } from "@/context/MyContext";
import { Product } from "@/context/InitialStatus";
import { sileo } from "sileo";
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

const COMPRA_INITIAL: CompraInterface = {
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
  const newUID = useRef(uuidv4()).current;

  const [currentStep, setCurrentStep] = useState(1);
  const [iDCompra, setIDCompra] = useState<number>(1);
  const { store, dispatchStore } = useContext(MyContext);
  const [count, setCount] = useState<number>(3);
  const [downloading, setDownloading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const savedData = useMemo(
    () => GetInformationCart(store.sitioweb || ""),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [compra, setCompra] = useState<CompraInterface>({
    ...COMPRA_INITIAL,
    people: savedData.nombre,
    phonenumber: savedData.phone.startsWith("+")
      ? savedData.phone.slice(1)
      : savedData.phone,
  });

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

    setCompra((prevCompra) => {
      const monedaDestino = store.moneda.find((m) => m.defecto) ?? {
        id: 0,
        valor: 1,
        nombre: "",
      };
      const valorDestino = monedaDestino.valor ?? 1;
      const nombreDestino = monedaDestino.nombre ?? "";

      const pedido = store.products
        .filter(
          (obj) => obj.Cant > 0 || obj.agregados.some((agg) => agg.cant > 0),
        )
        .map((p) => {
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
          const agregados = (p.agregados ?? []).map((a) => ({
            ...a,
            price: convertirYRedondear(a.price ?? 0, valorOrigen, valorDestino),
          }));
          return {
            ...p,
            price: convertedPrice,
            embalaje: convertedEmbalaje,
            priceCompra: convertedPriceCompra,
            default_moneda: monedaDestino.id ?? 0,
            agregados,
          };
        });

      const total = pedido.reduce((acc, item) => {
        const qty = item.Cant ?? 0;
        const productLine = ((item.price ?? 0) + (item.embalaje ?? 0)) * qty;
        const agregadosSum =
          (item.agregados ?? []).reduce(
            (sum, agg) =>
              sum + ((agg.price ?? 0) + (item.embalaje ?? 0)) * (agg.cant ?? 0),
            0,
          ) || 0;
        return acc + productLine + agregadosSum;
      }, 0);

      return {
        ...prevCompra,
        code,
        moneda: nombreDestino,
        pedido,
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
    if (compra.pedido.length === 0 && store.sitioweb) {
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
  }, [compra.pedido.length, store.sitioweb, router]);

  const sendToWhatsapp = useCallback(
    async (id: number) => {
      let mensaje = `Hola, Quiero modificar este pedido:\n- Metodo de envio: ${compra.lugar}\nA nombre de:${compra.people}\n`;
      mensaje += `- ID de Venta: ${id}\n`;
      if (compra.direccion) mensaje += `- Direccion: ${compra.direccion}\n`;
      if (compra.descripcion)
        mensaje += `- Aclaración: ${compra.descripcion}\n`;
      mensaje += `\n- Productos:\n`;
      compra.pedido.forEach((producto, index) => {
        if (producto.Cant > 0) {
          mensaje += `   ${index + 1}. ${producto.title} x${producto.Cant}: ${(producto.Cant * producto.price).toFixed(2)} - ${producto.embalaje > 0 ? `Embalaje:${producto.embalaje}` : ""}\n`;
        }
        producto.agregados
          .filter((o) => o.cant > 0)
          .forEach((obj) => {
            mensaje += `   ${index + 1}. ${producto.title}-${obj.name} x${obj.cant}: ${(obj.cant * obj.price).toFixed(2)} - ${producto.embalaje > 0 ? `Embalaje:${producto.embalaje}` : ""}\n`;
          });
      });
      const discountTotal =
        smartRound(compra.total) * (1 - compra.code.discount / 100);
      mensaje += `- Total de la orden: ${discountTotal} ${store.moneda.find((m) => m.defecto)?.nombre || ""}\n`;
      if (compra.lugar !== "Local")
        mensaje += `- Domicilio: $${compra.shipping}\n`;
      mensaje += `- Moneda: $${compra.moneda}\n`;
      if (compra.code.name)
        mensaje += `- Codigo de ${store.afiliate ? "Afiliado" : "Descuento"}: ${compra.code.name}\n`;
      SavedInformationCart(
        store.sitioweb || "",
        compra.people,
        compra.phonenumber,
      );
      const mensajeCodificado = encodeURIComponent(mensaje);
      dispatchStore({ type: "Clean" });
      window.open(
        `https://wa.me/${store.cell}?text=${mensajeCodificado}`,
        "_blank",
      );
    },
    [compra, store, dispatchStore],
  );

  const handleOrderClick = useCallback(async () => {
    if (compra.people === "") {
      sileo.error({
        title: "Sin destinatario",
        description: "Ingrese un nombre para continuar con su pedido",
      });
      return;
    }
    if (!isValidPhoneNumber(`+${compra.phonenumber}`)) {
      sileo.error({
        title: "Número de teléfono inválido",
        description: "Por favor, ingrese un número de teléfono válido",
      });
      return;
    }
    if (compra.total === 0) {
      sileo.error({
        title: "No hay productos en su carrito",
        description: "Agregue productos a su carrito antes de continuar",
      });
      return;
    }
    if (!store.sitioweb) return;

    setDownloading(true);

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
          user_id: user?.id || "ac645d7e-af66-47fd-befc-46300a2daeb4",
        });
        setIDCompra(data.event_id);
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
        return { name: compra.people || "Pedido" };
      } catch (err) {
        throw err;
      } finally {
        setDownloading(false);
      }
    };

    sileo.promise(uploadFlow(), {
      loading: { title: "Enviando pedido..." },
      success: (data) => ({
        title: `${data.name} – pedido enviado correctamente.`,
      }),
      error: (err) => ({
        title:
          String(err instanceof Error ? err.message : String(err)) ||
          "Error al enviar el pedido",
      }),
    });
  }, [compra, store, newUID, user, sendToWhatsapp, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (compra.pedido.length === 0) return <CartClean count={count} />;

  return (
    <div className="bg-background min-h-screen">
      <div className="h-16" />
      <div className="px-4">
        <StepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />

        {currentStep === 1 && (
          <>
            <div className="min-h-screen space-y-2">
              <CartItems compra={compra} setCompra={setCompra} />
              {store.marketing && store.codeDiscount && !store.afiliate && (
                <CodeDiscount compra={compra} setCompra={setCompra} />
              )}
            </div>
            <div className="sticky bottom-0 flex justify-between items-center py-3 px-0 bg-background/80 backdrop-blur-sm">
              <Button
                onClick={() => setCurrentStep(2)}
                className="h-12 rounded-full w-full font-semibold gap-2 active:scale-[0.98] transition-all"
              >
                {compra.pedido.length === 0
                  ? "Explorar Productos"
                  : "Continuar"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-2">
            <Details compra={compra} setCompra={setCompra} />
            <Resumen
              compra={compra}
              handleOrderClick={handleOrderClick}
              downloading={downloading}
            />
          </div>
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
    <div className="flex items-center justify-center mb-3 sticky top-14 backdrop-blur-lg z-10 bg-background/70 py-2">
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

function SavedInformationCart(sitioweb: string, nombre: string, phone: string) {
  try {
    window.localStorage.setItem(
      `${sitioweb}-informationCart`,
      JSON.stringify({ nombre, phone }),
    );
  } catch {}
}

function GetInformationCart(sitioweb: string): {
  nombre: string;
  phone: string;
} {
  try {
    const saved = localStorage.getItem(`${sitioweb}-informationCart`);
    return saved ? JSON.parse(saved) : { nombre: "", phone: "" };
  } catch {
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
  if (vd === 0) return smartRound(redondearAMultiploDe5(a * vs));
  return smartRound(redondearAMultiploDe5((a * vs) / vd));
}
