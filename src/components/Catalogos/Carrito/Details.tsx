"use client";
import { MyContext } from "@/context/MyContext";
import React, { useContext } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import { CompraInterface } from "./CarritoPage";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import style from "./style.module.css";
import { smartRound } from "@/functions/precios";
import { Sends } from "@/context/InitialStatus";

export type Props = {
  compra: CompraInterface;
  setCompra: React.Dispatch<React.SetStateAction<CompraInterface>>;
};
export default function Details({ compra, setCompra }: Props) {
  const { store } = useContext(MyContext);
  return (
    <div className="space-y-1">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
          ¿Quién recibe el pedido?
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
              Nombre
            </Label>
            <Input
              className="w-full text-slate-700 dark:text-slate-200 dark:bg-slate-900 dark:border-slate-600"
              value={compra.people}
              onChange={(e) =>
                setCompra({
                  ...compra,
                  people: e.target.value,
                })
              }
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              El nombre de la persona que recibe el pedido.
            </p>
          </div>
          <div>
            <Label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
              Teléfono
            </Label>
            <PhoneInput
              placeholder="Teléfono"
              containerStyle={{ width: "100%" }}
              country={"cu"}
              value={compra.phonenumber}
              onChange={(e) =>
                setCompra({
                  ...compra,
                  phonenumber: e,
                })
              }
              dropdownClass={style.dropdownClass}
              inputClass={style.inputClass}
              buttonClass={style.ButtonClass}
            />{" "}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              El número de teléfono de la persona que recibe el pedido.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
          ¿Dónde la entregamos?
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-slate-700 dark:text-slate-300 mb-2 block">
              Selecciona la zona de tu dirección
            </Label>
            <div className="space-y-2">
              {[
                ...(store.local || store.envios?.length == 0
                  ? [{ lugar: "Local", precio: 0 } as Sends]
                  : []),
                ...(store.envios ?? []),
              ].map((obj, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  <input
                    type="radio"
                    name="deliveryZone"
                    value={obj.lugar}
                    checked={compra.lugar === obj.lugar}
                    onChange={(e) =>
                      setCompra({
                        ...compra,
                        shipping: obj.precio,
                        lugar: e.target.value,
                      })
                    }
                    className="text-slate-800 dark:text-slate-300"
                  />
                  <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {obj.lugar}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {smartRound(obj.precio).toFixed(2)}{" "}
                      {store.moneda.find((m) => m.defecto)?.nombre || ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      {compra.lugar !== "Local" && (
        <>
          <div>
            <Label className="text-sm text-slate-700 dark:text-slate-300 mb-1 block">
              Tu dirección exacta
            </Label>
            <Textarea
              className="w-full min-h-20 text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
              placeholder="Escribe tu dirección completa..."
              value={compra.direccion}
              onChange={(e) =>
                setCompra({
                  ...compra,
                  direccion: e.target.value,
                })
              }
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              La dirección donde se entregará el pedido.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
              ¿Quieres aclararnos algo?
            </h3>
            <Textarea
              className="w-full min-h-20 text-xs dark:bg-slate-900 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
              placeholder="Ej: Toque el timbre varias veces..."
              value={compra.descripcion}
              onChange={(e) =>
                setCompra({
                  ...compra,
                  descripcion: e.target.value,
                })
              }
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Información adicional sobre tu pedido o dirección.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
