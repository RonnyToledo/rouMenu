"use client";

import { MapPin, Mail, Tag, Phone, Info, Share2 } from "lucide-react";
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
import { logoApp } from "@/lib/image";
import { IconSelect, SelectUser } from "../General/Footer";
import ShareButton from "@/components/myUI/buttonShare";

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
    <div>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="h-16" />
        <div className="container mx-auto px-4 py-6 max-w-4xl pb-8">
          {/* Profile Section */}
          <section className="mb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-border mb-3">
                <Image
                  height={160}
                  width={160}
                  src={store.urlPoster || logoApp}
                  alt={store.name || ""}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground">Perfil público.</p>
            </div>

            <InfoCard
              icon={<Info className="w-4 h-4 text-muted-foreground mt-0.5" />}
            >
              <p className="text-sm font-semibold text-foreground">
                {store.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Nombre de la tienda
              </p>
            </InfoCard>

            {store.history && (
              <InfoCard
                icon={<Info className="w-4 h-4 text-muted-foreground mt-0.5" />}
              >
                <p className="text-sm text-foreground mb-0.5 line-clamp-3">
                  {store.history}
                </p>
                <p className="text-xs text-muted-foreground">Sobre nosotros</p>
              </InfoCard>
            )}

            {mapCenter && (
              <InfoCard
                icon={
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                }
              >
                <div className="rounded-xl overflow-hidden mb-2">
                  <Map
                    height={280}
                    defaultCenter={mapCenter}
                    mouseEvents={false}
                    touchEvents={false}
                    defaultZoom={15}
                  >
                    <Marker width={50} anchor={mapCenter} />
                  </Map>
                </div>
                <p className="text-sm text-muted-foreground">
                  {store?.direccion},
                </p>
                <p className="text-xs text-muted-foreground">
                  {store.municipio}, {store.Provincia}
                </p>
              </InfoCard>
            )}

            <InfoCard
              icon={<Clock className="w-4 h-4 text-muted-foreground mt-0.5" />}
            >
              <div className="space-y-2 mb-1">
                <HorariosComponent
                  groupedHorarios={groupedHorarios}
                  horario={store.horario || []}
                />
              </div>
              <p className="text-xs text-muted-foreground">Horario comercial</p>
            </InfoCard>

            {store.email && (
              <InfoCard
                icon={<Mail className="w-4 h-4 text-muted-foreground mt-0.5" />}
              >
                <p className="text-sm text-primary hover:opacity-75 transition-opacity">
                  {store.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Correo electrónico
                </p>
              </InfoCard>
            )}

            {store.tipo && (
              <InfoCard
                icon={<Tag className="w-4 h-4 text-muted-foreground mt-0.5" />}
              >
                <p className="text-sm text-foreground mb-0.5">{store.tipo}</p>
                <p className="text-xs text-muted-foreground">Categoría</p>
              </InfoCard>
            )}

            <InfoCard
              icon={<Share2 className="w-4 h-4 text-muted-foreground mt-0.5" />}
            >
              <ShareButton
                title={store.name}
                text={store.parrrafo}
                url={`https://roumenu.vercel.app/t/${store.sitioweb}`}
                className="p-0 text-sm text-foreground"
              >
                Compartir Perfil
              </ShareButton>
            </InfoCard>
          </section>

          {/* Rating Section */}
          <section className="mb-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-serif text-base font-semibold text-foreground">
                Califica este catálogo
              </h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    onClick={() => handleStarClick(starValue)}
                    onMouseEnter={() => setRatingHover(starValue)}
                    onMouseLeave={() => setRatingHover(0)}
                    className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary/10 transition-colors group"
                    type="button"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        starValue <= activeStar
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40 group-hover:text-amber-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="mb-6">
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-foreground">
                  Reseñas
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border border-border">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">
                    {store.comentTienda.promedio.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({store.comentTienda.total})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {store.comentTienda.data.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-border last:border-0 pb-3 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {review.user.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(review.created_at, "short")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.cmt && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {review.cmt}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <Link
                href={`/t/${store.sitioweb}/about/ratings`}
                className="w-full py-2.5 rounded-xl border border-border bg-background hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground"
              >
                <span>Ver todas las reseñas</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Social Media */}
          {store.redes.length > 0 && (
            <section className="mb-6">
              <h3 className="font-serif text-base font-semibold text-foreground mb-3 px-1">
                Facebook e Instagram
              </h3>
              <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                <div className="flex flex-col gap-3">
                  {store.redes.map((red, idx) => (
                    <div className="flex items-center gap-3" key={idx}>
                      <IconSelect
                        iconName={red.tipo}
                        className="w-4 h-4 text-muted-foreground"
                      />
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
              </div>
            </section>
          )}

          {/* Contact Info */}
          <section className="mb-6">
            <h3 className="font-serif text-base font-semibold text-foreground mb-3 px-1">
              Info. y número de teléfono
            </h3>
            <div className="space-y-2">
              <InfoCard
                icon={<Info className="w-4 h-4 text-muted-foreground mt-0.5" />}
              >
                <p className="text-sm text-foreground mb-0.5 line-clamp-5">
                  {store.parrrafo || "..."}
                </p>
                <p className="text-xs text-muted-foreground">Información</p>
              </InfoCard>
              <InfoCard
                icon={
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                }
              >
                <p className="text-sm text-foreground mb-0.5">+{store.cell}</p>
                <p className="text-xs text-muted-foreground">
                  Número de teléfono
                </p>
              </InfoCard>
            </div>
          </section>
        </div>

        <Separator className="bg-border" />
        <footer className="p-4 border-t border-border">
          <Link
            className="text-sm text-muted-foreground flex flex-col justify-center items-center gap-2"
            href="https://rouadmin.vercel.app"
          >
            <Image
              src={logoAdmin}
              alt={store.name || ""}
              width={120}
              height={120}
              className="rounded-full w-24 h-24 object-cover opacity-80"
            />
            Ir al panel de administración
          </Link>
        </footer>
        <Separator className="bg-border" />
      </div>

      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={handleCloseReview}
        ratingSelect={ratingSelect}
      />
    </div>
  );
}

const InfoCard = memo(function InfoCard({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-secondary/50 border border-border rounded-xl p-3.5 mb-2">
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
});

interface HorarioGroup {
  dias: string[];
  apertura: string;
  cierre: string;
}

function agruparHorarios(horarios: ScheduleInterface[]): HorarioGroup[] {
  if (!horarios || horarios.length === 0) return [];
  const grouped: HorarioGroup[] = [];
  let currentGroup: HorarioGroup = {
    dias: [horarios[0].dia],
    apertura: horarios[0].apertura,
    cierre: horarios[0].cierre,
  };
  for (let i = 1; i < horarios.length; i++) {
    const hor = horarios[i];
    const prev = horarios[i - 1];
    if (hor.apertura === prev.apertura && hor.cierre === prev.cierre) {
      currentGroup.dias.push(hor.dia);
    } else {
      grouped.push(currentGroup);
      currentGroup = {
        dias: [hor.dia],
        apertura: hor.apertura,
        cierre: hor.cierre,
      };
    }
  }
  grouped.push(currentGroup);
  return grouped;
}

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

function formatearHorario(apertura: string, cierre: string): string {
  try {
    const aperturaDate = new Date(apertura);
    const cierreDate = new Date(cierre);
    const isAbierto24h =
      (aperturaDate.getHours() === 0 && cierreDate.getHours() === 0) ||
      aperturaDate.getDate() + 1 === cierreDate.getDate();
    if (isAbierto24h) return "Abierto 24 horas";
    const isCerrado =
      aperturaDate.getHours() === cierreDate.getHours() &&
      aperturaDate.getDate() === cierreDate.getDate();
    if (isCerrado) return "Cerrado";
    const aperturaStr = aperturaDate
      .toLocaleTimeString("es-ES", TIME_OPTIONS)
      .toLowerCase();
    const cierreStr = cierreDate
      .toLocaleTimeString("es-ES", TIME_OPTIONS)
      .toLowerCase();
    return `${aperturaStr} – ${cierreStr}`;
  } catch {
    return "Horario no disponible";
  }
}

function formatearDias(dias: string[]): string {
  if (dias.length === 0) return "";
  if (dias.length === 1) return dias[0];
  return `De ${dias[0]} a ${dias[dias.length - 1]}`;
}

const HorariosComponent = memo(function HorariosComponent({
  groupedHorarios,
  horario,
}: {
  groupedHorarios: HorarioGroup[];
  horario: ScheduleInterface[];
}) {
  if (!horario || horario.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs">Horarios no disponibles</span>
      </div>
    );
  }
  return (
    <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
      {groupedHorarios.map((group, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-foreground">
            {formatearDias(group.dias)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatearHorario(group.apertura, group.cierre)}
          </span>
        </div>
      ))}
    </div>
  );
});
