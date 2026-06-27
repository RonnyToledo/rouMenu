"use client";
import { MyContext } from "@/context/MyContext";
import React, { useContext } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import { CompraInterface } from "@/types/interfaces_Cart";
import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import style from "./style.module.css";
import { smartRound } from "@/functions/precios";
import { Sends } from "@/types/InitialStatus";

export type Props = {
  compra: CompraInterface;
  setCompra: React.Dispatch<React.SetStateAction<CompraInterface>>;
};

export default function Details({ compra, setCompra }: Props) {
  const { store } = useContext(MyContext);

  return (
    <div className="space-y-2">
      {/* Destinatario */}
      <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          ¿Quién recibe el pedido?
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Nombre
            </Label>
            <Input
              className="w-full text-sm text-foreground border-border bg-background"
              value={compra.people}
              onChange={(e) => setCompra({ ...compra, people: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              El nombre de la persona que recibe el pedido.
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Teléfono
            </Label>
            <PhoneInput
              placeholder="Teléfono"
              containerStyle={{ width: "100%" }}
              country="cu"
              value={compra.phonenumber}
              onChange={(e) => setCompra({ ...compra, phonenumber: e })}
              dropdownClass={style.dropdownClass}
              inputClass={style.inputClass}
              buttonClass={style.ButtonClass}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              El número de teléfono de la persona que recibe el pedido.
            </p>
          </div>
        </div>
      </div>

      {/* Zona de entrega */}
      <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          ¿Dónde la entregamos?
        </h3>
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Selecciona la zona de tu dirección
          </Label>
          <div className="space-y-1.5">
            {[
              ...(store.local || store.envios?.length == 0
                ? [{ lugar: "Local", precio: 0 } as Sends]
                : []),
              ...(store.envios ?? []),
            ].map((obj, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  compra.lugar === obj.lugar
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-secondary"
                }`}
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
                  className="accent-primary"
                />
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {obj.lugar}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {smartRound(obj.precio).toFixed(2)}{" "}
                    {store.moneda.find((m) => m.defecto)?.nombre || ""}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {compra.lugar !== "Local" && (
        <>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground block">
              Tu dirección exacta
            </Label>
            <Textarea
              className="w-full min-h-20 text-xs border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="Escribe tu dirección completa..."
              value={compra.direccion}
              onChange={(e) =>
                setCompra({ ...compra, direccion: e.target.value })
              }
            />
            <p className="text-[10px] text-muted-foreground">
              La dirección donde se entregará el pedido.
            </p>
          </div>

          <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              ¿Quieres aclararnos algo?
            </h3>
            <Textarea
              className="w-full min-h-20 text-xs border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="Ej: Toque el timbre varias veces..."
              value={compra.descripcion}
              onChange={(e) =>
                setCompra({ ...compra, descripcion: e.target.value })
              }
            />
            <p className="text-[10px] text-muted-foreground">
              Información adicional sobre tu pedido o dirección.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
