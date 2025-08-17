"use client";
import { MyContext } from "@/context/MyContext";
import { Sends } from "@/context/InitialStatus";

import React, { useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import { CompraInterface } from "./CarritoPage";
import { MapPin, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { smartRound } from "@/functions/precios";

export type Props = {
  compra: CompraInterface;
  setCompra: React.Dispatch<React.SetStateAction<CompraInterface>>;
};
export default function Details({ compra, setCompra }: Props) {
  const { store } = useContext(MyContext);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 space-y-5">
        {/* Recipient Info */}
        <div className="space-y-4">
          <div className="relative w-full">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Nombre del destinatario"
              className="pl-10 border-gray-200 focus:border-blue-500"
              value={compra.people}
              onChange={(e) =>
                setCompra({
                  ...compra,
                  people: e.target.value,
                })
              }
            />
          </div>

          <div className="relative w-full overflow-hidden rounded-sm border border-gray-300">
            <PhoneInput
              placeholder=" Teléfono"
              containerStyle={{ width: "100%" }}
              country={"cu"}
              value={compra.phonenumber}
              onChange={(e) =>
                setCompra({
                  ...compra,
                  phonenumber: e,
                })
              }
              inputClass="pl-10 border-gray-200 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Location */}
        {(store.envios || []).length > 0 && (
          <div className="space-y-4">
            <div className="text-gray-500 flex items-center justify-between">
              <div className="flex items-center justify-start gap-2">
                <MapPin className="size-4" />
                Domicilio
              </div>
              <Switch
                checked={compra.envio === "delivery"}
                onCheckedChange={(checked: boolean) =>
                  setCompra((prev) => ({
                    ...prev,
                    envio: checked ? "delivery" : "pickup",
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                required={compra.envio === "delivery"}
                disabled={compra.envio !== "delivery"}
                value={compra.provincia}
                onValueChange={(value) => {
                  const auxVal =
                    (store.envios || ([] as Sends[])).find(
                      (obj) => obj.nombre === value
                    )?.municipios || [];
                  setCompra({
                    ...compra,
                    provincia: value,
                    shipping: auxVal[0]?.price || 0,
                    municipio: auxVal[0]?.name || "",
                  });
                }}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 w-full truncate">
                  <SelectValue placeholder="Provincia" />
                </SelectTrigger>
                <SelectContent className="w-full truncate">
                  {(store.envios || ([] as Sends[])).map((obj, ind) => (
                    <SelectItem key={ind} value={obj.nombre}>
                      {obj.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                required={compra.envio === "delivery"}
                disabled={compra.envio !== "delivery" || !compra.provincia}
                onValueChange={(value) => {
                  const auxVal = (
                    (store.envios || ([] as Sends[])).find(
                      (obj) => obj.nombre === compra.provincia
                    )?.municipios || []
                  ).find((municipio) => municipio.name.includes(value));

                  setCompra((prev) => ({
                    ...prev,
                    municipio: value,
                    shipping: auxVal?.price || 0,
                  }));
                }}
                value={compra.municipio}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 w-full truncate">
                  <SelectValue placeholder="Municipio" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {(store.envios || ([] as Sends[]))
                    .find((obj) => obj.nombre === compra.provincia)
                    ?.municipios.map((obj, ind) => (
                      <SelectItem key={ind} value={obj.name}>
                        {obj.name}- ${smartRound(obj.price)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <Textarea
          placeholder="Instrucciones especiales (opcional)"
          className="border-gray-200 focus:border-blue-500 resize-none h-20"
          value={compra.descripcion}
          onChange={(e) =>
            setCompra({
              ...compra,
              descripcion: e.target.value,
            })
          }
        />

        {/* Warning */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 text-xs">
            Algunas características específicas en su pedido que no pudo ser
            reflejada...
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
