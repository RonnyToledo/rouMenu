"use client";
import { MyContext } from "@/context/MyContext";
import React, { useContext } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import { CompraInterface } from "@/types/interfaces_Cart";
import { MapPin, User, MessageSquare, Check } from "lucide-react";
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
      <div className="bg-secondary/50 border border-border rounded-2xl p-4 space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-foreground" />
          </span>
          ¿Quién recibe el pedido?
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Nombre
            </Label>
            <Input
              className="w-full text-sm text-foreground border-border bg-background rounded-xl"
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
      <div className="bg-secondary/50 border border-border rounded-2xl p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 text-foreground" />
          </span>
          ¿Dónde la entregamos?
        </h3>
        <div className="space-y-1.5">
          {[
            ...(store.local || store.envios?.length == 0
              ? [{ lugar: "Local", precio: 0 } as Sends]
              : []),
            ...(store.envios ?? []),
          ].map((obj, index) => {
            const isSelected = compra.lugar === obj.lugar;
            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setCompra({
                    ...compra,
                    shipping: obj.precio,
                    lugar: obj.lugar,
                  })
                }
                className={`w-full flex items-center gap-3 p-3 border rounded-2xl transition-all text-left active:scale-[0.99] ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {obj.lugar}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {smartRound(obj.precio).toFixed(2)}{" "}
                    {store.moneda.find((m) => m.defecto)?.nombre || ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {compra.lugar !== "Local" && (
        <>
          <div className="bg-secondary/50 border border-border rounded-2xl p-4 space-y-2">
            <Label className="text-xs font-semibold text-foreground block">
              Tu dirección exacta
            </Label>
            <Textarea
              className="w-full min-h-20 text-xs border-border bg-background text-foreground placeholder:text-muted-foreground resize-none rounded-xl"
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

          <div className="bg-secondary/50 border border-border rounded-2xl p-4 space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                <MessageSquare className="w-3 h-3 text-foreground" />
              </span>
              ¿Quieres aclararnos algo?
            </h3>
            <Textarea
              className="w-full min-h-20 text-xs border-border bg-background text-foreground placeholder:text-muted-foreground resize-none rounded-xl"
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
