"use client";

import { MapPin, Mail, Tag, Phone, Info } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import Image from "next/image";
import React, { useContext, useState, useMemo, useCallback, memo } from "react";
import { logoAdmin } from "@/lib/image";
import { Map, Marker } from "pigeon-maps";
import Link from "next/link";
import { Star, ChevronRight, Clock } from "lucide-react";
import { ScheduleInterface } from "@/types/InitialStatus";
import { Separator } from "@/components/ui/separator";
import { format } from "@formkit/tempo";
import PreviewRatingGeneral from "../General/PreviewRatingGeneral";
import { useAuth } from "@/context/AppContext";
import { IconSelect, SelectUser } from "../General/Footer";
import HeroGlobal from "../home/Hero/HeroGlobal";

export default function AboutPage() {
  const { store } = useContext(MyContext);
  const { requireAuth } = useAuth();
  const [ratingSelect, setRatingSelect] = useState<number>(0);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleStarClick = useCallback(
    async (rating: number) => {
      setRatingSelect(rating);
      const isAuthenticated = await requireAuth(
        "Debes iniciar sesión para dejar una reseña",
      );
      if (!isAuthenticated) return;
      setReviewOpen(true);
    },
    [requireAuth],
  );

  const handleCloseReview = useCallback(() => setReviewOpen(false), []);

  const groupedHorarios = useMemo(
    () => agruparHorarios(store.horario || []),
    [store.horario],
  );

  const mapCenter = useMemo(
    () =>
      store.ubicacion?.latitude && store.ubicacion?.longitude
        ? ([store.ubicacion.latitude, store.ubicacion.longitude] as [
            number,
            number,
          ])
        : null,
    [store.ubicacion],
  );

  const activeStar = ratingHover || ratingSelect;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* ── HERO ── */}
      <HeroGlobal expand />

      {/* ── INFO CARDS ── */}
      <section className="px-6 pb-10 space-y-3">
        {/* Store name */}
        <LabeledCard
          icon={<Info className="w-4 h-4 text-muted-foreground mt-0.5" />}
          label="Nombre de la tienda"
          value={store.name}
        />

        {/* History */}
        {store.history && (
          <LabeledCard
            icon={<Info className="w-4 h-4 text-muted-foreground mt-0.5" />}
            label="Sobre nosotros"
            value={store.history}
            clamp
          />
        )}

        {/* Map */}
        {mapCenter && (
          <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="rounded-xl overflow-hidden">
                  <Map
                    height={220}
                    defaultCenter={mapCenter}
                    mouseEvents={false}
                    touchEvents={false}
                    defaultZoom={15}
                  >
                    <Marker width={50} anchor={mapCenter} />
                  </Map>
                </div>
                <p className="text-sm text-foreground">{store?.direccion}</p>
                <p className="text-xs text-muted-foreground">
                  {store.municipio}, {store.Provincia}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <HorariosComponent
                groupedHorarios={groupedHorarios}
                horario={store.horario || []}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Horario comercial
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        {store.email && (
          <LabeledCard
            icon={<Mail className="w-4 h-4 text-muted-foreground mt-0.5" />}
            label="Correo electrónico"
            value={store.email}
            isLink={`mailto:${store.email}`}
          />
        )}

        {/* Phone */}
        <LabeledCard
          icon={<Phone className="w-4 h-4 text-muted-foreground mt-0.5" />}
          label="Número de teléfono"
          value={`+${store.cell}`}
          isLink={`tel:+${store.cell}`}
        />

        {/* Category */}
        {store.tipo && (
          <LabeledCard
            icon={<Tag className="w-4 h-4 text-muted-foreground mt-0.5" />}
            label="Categoría"
            value={store.tipo}
          />
        )}
      </section>

      {/* ── REVIEWS ── */}
      <section className="px-6 py-12 bg-secondary/30">
        {/* Header */}
        <div className="mb-10 text-center">
          <h3 className="font-serif text-2xl mb-2 text-foreground">
            Experiencias de Clientes
          </h3>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-semibold text-amber-500">
              {store.comentTienda.promedio.toFixed(1)}
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(store.comentTienda.promedio)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Basado en {store.comentTienda.total} reseñas
          </p>
        </div>

        {/* Review list */}
        <div className="space-y-4 mb-8">
          {store.comentTienda.data.map((review) => (
            <div
              key={review.id}
              className="bg-background border border-border rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {review.user.name}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= review.star
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {format(review.created_at, "short")}
                </span>
              </div>
              {review.cmt && (
                <p className="text-xs italic text-muted-foreground leading-relaxed line-clamp-3 mt-2">
                  {`"${review.cmt}"`}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Ver todas */}
        <Link
          href={`/t/${store.sitioweb}/about/ratings`}
          className="w-full py-4 border border-border rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-background transition-colors flex items-center justify-center gap-2 text-foreground"
        >
          Ver todas las reseñas
          <ChevronRight className="w-4 h-4" />
        </Link>

        {/* Rate CTA */}
        <div className="mt-12 text-center">
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">
            ¿Te gusta nuestro catálogo?
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => setRatingHover(starValue)}
                onMouseLeave={() => setRatingHover(0)}
                className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                type="button"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    starValue <= activeStar
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── REDES SOCIALES ── */}
      {store.redes.length > 0 && (
        <section className="px-6 py-10">
          <h3 className="font-serif text-2xl mb-6 text-foreground">
            Redes Sociales
          </h3>
          <div className="space-y-3">
            {store.redes.map((red, idx) => (
              <div
                key={idx}
                className="bg-secondary/50 border border-border rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <IconSelect
                    iconName={red.tipo}
                    className="w-4 h-4 text-muted-foreground"
                  />
                </div>
                <Link
                  href={red.url}
                  className="text-sm text-primary hover:opacity-75 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SelectUser(red.tipo, red.user)}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACTO ── */}
      <section className="px-6 py-10">
        <h3 className="font-serif text-2xl mb-6 text-foreground">
          Información de Contacto
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {/* Ubicación */}
          <ContactRow
            icon={<MapPin className="w-5 h-5 opacity-60" />}
            label="Ubicación & Servicios"
            value={`${store.municipio}, ${store.Provincia}. Envíos a domicilio disponibles.`}
          />

          {/* Teléfono */}
          <ContactRow
            icon={<Phone className="w-5 h-5 opacity-60" />}
            label="Teléfono"
            value={`+${store.cell}`}
            href={`tel:+${store.cell}`}
          />

          {/* Email */}
          {store.email && (
            <ContactRow
              icon={<Mail className="w-5 h-5 opacity-60" />}
              label="Email"
              value={store.email}
              href={`mailto:${store.email}`}
            />
          )}
        </div>
      </section>

      <Separator className="bg-border" />

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 text-center bg-background border-t border-border">
        <div className="mb-6 flex justify-center">
          <div className="w-12 h-12 bg-foreground text-background rounded-lg flex items-center justify-center font-serif text-xl italic">
            {(store.name || "SP").slice(0, 2).toUpperCase()}
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-8">
          © {new Date().getFullYear()} {store.name}. Todos los derechos
          reservados.
        </p>
        <Link
          href="https://rouadmin.vercel.app"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex flex-col items-center gap-3"
        >
          <Image
            src={logoAdmin}
            alt={store.name || ""}
            width={48}
            height={48}
            className="rounded-full w-12 h-12 object-cover opacity-70"
          />
          Ir al panel de administración
        </Link>
        <div className="mt-8 flex justify-center items-center gap-2">
          <span className="text-[10px] text-muted-foreground/40">
            Powered by
          </span>
          <span className="font-bold text-xs tracking-tighter opacity-30">
            ROUMENU
          </span>
        </div>
      </footer>

      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={handleCloseReview}
        ratingSelect={ratingSelect}
      />
    </div>
  );
}

/* ── Sub-components ── */

const LabeledCard = memo(function LabeledCard({
  icon,
  label,
  value,
  clamp,
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  clamp?: boolean;
  isLink?: string;
}) {
  if (!value) return null;
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="shrink-0">{icon}</div>
        <div className="flex-1">
          {isLink ? (
            <a
              href={isLink}
              className={`text-sm text-primary hover:opacity-75 transition-opacity ${clamp ? "line-clamp-3" : ""}`}
            >
              {value}
            </a>
          ) : (
            <p
              className={`text-sm text-foreground ${clamp ? "line-clamp-3" : ""}`}
            >
              {value}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
});

const ContactRow = memo(function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-full shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-1">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    </div>
  );
});

/* ── Schedule helpers (sin cambios) ── */

interface TurnoHorario {
  id?: number | string;
  open: boolean;
  apertura?: string | null;
  cierre?: string | null;
  es_24h?: boolean;
  cruza_medianoche?: boolean;
}

interface HorarioGroup {
  dias: string[];
  turnos: TurnoHorario[];
}

function normalizarTurno(turno: TurnoHorario) {
  if (!turno.open) return "closed";
  if (turno.es_24h) return "24h";
  const ap = turno.apertura ?? "";
  const ci = turno.cierre ?? "";
  return `${ap}-${ci}-${turno.cruza_medianoche ? 1 : 0}`;
}

function agruparHorarios(horarios: ScheduleInterface[]): HorarioGroup[] {
  if (!horarios?.length) return [];
  const groups: HorarioGroup[] = [];
  let current: HorarioGroup | null = null;
  let currentKey = "";

  for (const dia of horarios) {
    const turnos = (dia.turnos ?? []).filter((t) => t.open);
    const key =
      turnos.length === 0 ? "closed" : turnos.map(normalizarTurno).join("|");

    if (current && key === currentKey) {
      current.dias.push(dia.dia);
    } else {
      if (current) groups.push(current);
      current = { dias: [dia.dia], turnos };
      currentKey = key;
    }
  }

  if (current) groups.push(current);
  return groups;
}

function formatearDias(dias: string[]): string {
  if (dias.length === 0) return "";
  if (dias.length === 1) return dias[0];
  return `De ${dias[0]} a ${dias[dias.length - 1]}`;
}

function formatearTurno(turno: TurnoHorario): string {
  if (!turno.open) return "Cerrado";
  if (turno.es_24h) return "24 horas";
  if (!turno.apertura || !turno.cierre) return "Sin horario";
  const ap = turno.apertura.slice(0, 5);
  const ci = turno.cierre.slice(0, 5);
  return `${ap} - ${ci}${turno.cruza_medianoche ? " (+1 día)" : ""}`;
}

const HorariosComponent = memo(function HorariosComponent({
  groupedHorarios,
  horario,
}: {
  groupedHorarios: HorarioGroup[];
  horario: ScheduleInterface[];
}) {
  if (!horario?.length) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs">Horarios no disponibles</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {groupedHorarios.map((group, index) => (
        <div key={index} className="flex justify-between items-start gap-3">
          <span className="text-sm text-foreground">
            {formatearDias(group.dias)}
          </span>
          <div className="text-xs text-muted-foreground text-right">
            {group.turnos.length > 0
              ? group.turnos.map(formatearTurno).join(" · ")
              : "Cerrado"}
          </div>
        </div>
      ))}
    </div>
  );
});
