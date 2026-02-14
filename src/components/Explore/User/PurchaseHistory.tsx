"use client";

import React, { useMemo, useContext, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseEventDesc, formatCurrency } from "@/utils/purchaseParser";
import { persistCartIDB } from "@/reducer/reducerGeneral";
import { userContext } from "@/context/userContext";
import { Link as LinkRef } from "lucide-react";
import Link from "next/link";

type EventRow = {
  event_id: number;
  events_text: string | null;
  event_desc: string | null;
  uid_sitio: string | null;
  uid_venta: string | null;
  visto: boolean | null;
  nombre_event: string | null;
  created_at: string | null;
  phonenumber: number | null;
  descripcion: string | null;
  user_id: string | null;
  sitio_uuid: string | null;
  sitio_sitioweb: string | null;
  sitio_name: string | null;
};

type PurchaseStatus = "completed" | "shipped";
type FilterType = "all" | "completed" | "shipped";

interface Purchase {
  id: string;
  catalogName: string;
  catalogType: string;
  items: number;
  total: string;
  rawTotalValue: number;
  currency?: string;
  date: string;
  status: PurchaseStatus;
  location: string;
  phone?: string;
  paymentMethod?: string;
  discountCode?: string | null;
  rawEvent: EventRow;
  detailUrl: string;
}

const STATUS_CONFIG: Record<
  PurchaseStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "Completado",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },

  shipped: {
    label: "Enviado",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

const FILTERS = ["all", "completed", "shipped"] as const;

function inferPurchaseStatus(event: EventRow): PurchaseStatus {
  if (event.visto === true) {
    return "completed";
  }
  return "shipped";
}

function eventToPurchase(event: EventRow): Purchase {
  const parsed = parseEventDesc(event.event_desc);

  const date = event.created_at
    ? new Date(event.created_at).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const catalogName =
    event.sitio_name ?? event.nombre_event ?? event.events_text ?? "Evento";
  const catalogType = event.sitio_sitioweb ?? "";
  const location =
    parsed.address ?? event.sitio_sitioweb ?? event.descripcion ?? "";

  const status = inferPurchaseStatus(event);
  const formattedTotal = formatCurrency(parsed.total, parsed.currency);
  const detailUrl = event.uid_venta
    ? `/checkout/${event.uid_venta}`
    : `/events/${event.event_id}`;

  return {
    id: String(event.event_id),
    catalogName,
    catalogType,
    items: parsed.items,
    total: formattedTotal,
    rawTotalValue: parsed.total,
    currency: parsed.currency,
    date,
    status,
    location,
    phone: parsed.phone,
    paymentMethod: parsed.paymentMethod,
    discountCode: parsed.discountCode,
    rawEvent: event,
    detailUrl,
  };
}

export function PurchaseHistory() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const { events } = useContext(userContext);

  const { purchases, filteredPurchases } = useMemo(() => {
    const allPurchases = (events ?? []).map(eventToPurchase);

    const filtered =
      selectedFilter === "all"
        ? allPurchases
        : allPurchases.filter((p) => p.status === selectedFilter);

    return { purchases: allPurchases, filteredPurchases: filtered };
  }, [events, selectedFilter]);

  const handleFilterClick = (filter: (typeof FILTERS)[number]) => {
    setSelectedFilter?.(filter);
  };

  const EditarComprar = (idCompra: string) => {
    const e = events.find((e) => e.event_id === Number(idCompra));
    if (!e) return;
    persistCartIDB(
      e.sitio_sitioweb || "",
      JSON.parse(e.event_desc || "{}").pedido,
      e.uid_venta || ""
    );
    router.push(`/t/${e.sitio_sitioweb}`);
  };
  return (
    <div>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-light tracking-tight text-slate-800 mb-2 ">
              Historial de Compras
            </h2>
            <p className="text-slate-700">
              Revisa todas tus compras ({purchases.length} total)
            </p>
          </div>
        </div>
        <div className="mb-6 flex gap-2 flex-wrap">
          {FILTERS.map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterClick(filter)}
              className="bg-transparent border-slate-800 text-slate-700 hover:bg-slate-900/70 hover:text-slate-300 rounded-full px-6 h-10"
            >
              {filter === "all"
                ? "Todos"
                : (STATUS_CONFIG[filter as PurchaseStatus]?.label ?? filter)}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredPurchases.length > 0 ? (
            filteredPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onView={() => router.push(`/user/order/${purchase.id}`)}
                onEdit={() => EditarComprar(purchase.id)}
                onDelete={() => console.log("Delete", purchase.id)}
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No se encontraron compras con este filtro
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface PurchaseCardProps {
  purchase: Purchase;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PurchaseCard({
  purchase,
  onView,
  onEdit,
  onDelete,
}: PurchaseCardProps) {
  const status = STATUS_CONFIG[purchase.status];

  return (
    <div
      key={purchase.id}
      className="bg-slate-200/50 backdrop-blur-sm border border-slate-500 rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-6 flex-col ">
        <div className="flex-1 w-full">
          <h3 className="text-xl font-medium text-slate-800 mb-1">
            {purchase.catalogName}
          </h3>
          <div className="mb-3 flex items-start justify-between gap-2 ">
            {purchase.catalogType && (
              <Link
                href={`/t/${purchase.catalogType}`}
                className="text-sm text-slate-700 flex items-center justify-start gap-2 "
              >
                <p className="text-sm text-slate-700">{purchase.catalogType}</p>
                <LinkRef className="size-4" />
              </Link>
            )}
            <Badge variant="secondary" className={status.className}>
              {status.label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{purchase.date}</span>
            </div>
            {purchase.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{purchase.location}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-foreground">
                {purchase.items}
              </span>{" "}
              articulos
            </div>
          </div>

          {(purchase.phone ||
            purchase.paymentMethod ||
            purchase.discountCode) && (
            <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
              {purchase.phone && (
                <div>
                  <strong>Tel:</strong> {purchase.phone}
                </div>
              )}
              {purchase.paymentMethod && (
                <div>
                  <strong>Pago:</strong> {purchase.paymentMethod}
                </div>
              )}
              {purchase.discountCode && (
                <div>
                  <strong>Cupón:</strong> {purchase.discountCode}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          <div className="text-center py-4 mb-4 border-t border-b border-slate-400 w-full">
            <p className="text-3xl font-bold text-slate-700">
              {" "}
              {purchase.total}
            </p>
          </div>
          <div className="flex gap-2  w-full flex-col">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-slate-700 hover:bg-slate-300 text-white border-0 h-11 rounded-xl"
              onClick={onView}
            >
              <Eye className="h-4 w-4" />
              Ver
            </Button>
            {purchase.status === "shipped" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-slate-700 hover:bg-slate-300 text-white border-0 h-11 rounded-xl"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant={"outline"}
                  size="sm"
                  className="w-full border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 h-11 rounded-xl bg-transparent"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
