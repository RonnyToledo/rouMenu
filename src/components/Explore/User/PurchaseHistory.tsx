"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseEventDesc, formatCurrency } from "@/utils/purchaseParser";

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

interface PurchaseHistoryProps {
  events: EventRow[];
  selectedFilter?: PurchaseStatus | "all";
  onFilterChange?: (filter: PurchaseStatus | "all") => void;
}

export function PurchaseHistory({
  events,
  selectedFilter = "all",
  onFilterChange,
}: PurchaseHistoryProps) {
  const router = useRouter();

  const { purchases, filteredPurchases } = useMemo(() => {
    const allPurchases = (events ?? []).map(eventToPurchase);

    const filtered =
      selectedFilter === "all"
        ? allPurchases
        : allPurchases.filter((p) => p.status === selectedFilter);

    return { purchases: allPurchases, filteredPurchases: filtered };
  }, [events, selectedFilter]);

  const handleFilterClick = (filter: (typeof FILTERS)[number]) => {
    onFilterChange?.(filter);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-light tracking-tight text-foreground mb-2">
            Historial de Compras
          </h2>
          <p className="text-muted-foreground">
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
            className="capitalize"
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
              onEdit={() => router.push(`/user/order/${purchase.id}`)}
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
  );
}

interface PurchaseCardProps {
  purchase: Purchase;
  onView: () => void;
  onEdit: () => void;
}

function PurchaseCard({ purchase, onView, onEdit }: PurchaseCardProps) {
  const status = STATUS_CONFIG[purchase.status];

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-6 flex-col ">
        <div className="flex-1 w-full">
          <div className="mb-3 flex items-start justify-between gap-2 flex-col">
            <div>
              <h3 className="text-xl font-medium text-foreground mb-1">
                {purchase.catalogName}
              </h3>
              {purchase.catalogType && (
                <p className="text-sm text-muted-foreground">
                  {purchase.catalogType}
                </p>
              )}
            </div>
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
          <p className="text-2xl font-light tracking-tight text-foreground">
            {purchase.total}
          </p>
          <div className="flex gap-2  w-full flex-col">
            {purchase.status === "shipped" ? (
              <div className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant={"destructive"}
                  size="sm"
                  className="gap-2 w-full"
                  onClick={onView}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full"
                onClick={onView}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
