"use client";

import { MapPin, Mail, Tag, Phone, Info, Share2 } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import Image from "next/image";
import React, { useContext, useState, useMemo, useCallback, memo } from "react";
import { logoAdmin } from "@/lib/image";
import { Map, Marker } from "pigeon-maps";
import Link from "next/link";
import { Star, ChevronRight, Clock } from "lucide-react";
import { ScheduleInterface } from "@/context/InitialStatus";
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
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-primary/30 dark:from-slate-900 dark:to-slate-800">
        <div className="h-16" />
        <div className="container dark:bg-slate-900 mx-auto px-4 py-6 max-w-4xl pb-8">
          {/* Profile Section */}
          <section className="mb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-full bg-linear-to-br from-primary/60 to-primary/70 overflow-hidden border-4 border-primary/20 dark:border-primary/10">
                  <Image
                    height={160}
                    width={160}
                    src={store.urlPoster || logoApp}
                    alt={store.name || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-400 text-sm">
                Perfil público.
              </p>
            </div>

            <InfoCard
              icon={
                <Info className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
              }
            >
              <h2 className="text-slate-900 dark:text-slate-100 font-semibold text-lg mb-1">
                {store.name}
              </h2>
              <p className="text-slate-700 dark:text-slate-400 text-sm">
                Nombre de la tienda
              </p>
            </InfoCard>

            {store.history && (
              <InfoCard
                icon={
                  <Info className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
                }
              >
                <p className="text-slate-900 dark:text-slate-200 mb-1 line-clamp-3">
                  {store.history}
                </p>
                <p className="text-slate-700 dark:text-slate-400 text-sm">
                  Sobre nosotros
                </p>
              </InfoCard>
            )}

            {mapCenter && (
              <InfoCard
                icon={
                  <MapPin className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
                }
              >
                <div className="rounded-xl overflow-hidden mb-2">
                  <Map
                    height={300}
                    defaultCenter={mapCenter}
                    mouseEvents={false}
                    touchEvents={false}
                    defaultZoom={15}
                  >
                    <Marker width={50} anchor={mapCenter} />
                  </Map>
                </div>
                <div className="ml-4">
                  <p className="text-(--text-muted) dark:text-slate-400">
                    {store?.direccion},
                  </p>
                  <p className="text-sm text-(--text-muted) dark:text-slate-500">
                    {store.municipio}, {store.Provincia}
                  </p>
                </div>
              </InfoCard>
            )}

            <InfoCard
              icon={
                <Clock className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
              }
            >
              <div className="space-y-2 mb-2">
                <HorariosComponent
                  groupedHorarios={groupedHorarios}
                  horario={store.horario || []}
                />
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                Horario comercial
              </p>
            </InfoCard>

            {store.email && (
              <InfoCard
                icon={
                  <Mail className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
                }
              >
                <div className="text-cyan-800 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors text-left">
                  {store.email}
                </div>
                <p className="text-slate-700 dark:text-slate-400 text-sm">
                  Correo electrónico
                </p>
              </InfoCard>
            )}

            {store.tipo && (
              <InfoCard
                icon={
                  <Tag className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
                }
              >
                <p className="text-slate-900 dark:text-slate-100 mb-1">
                  {store.tipo}
                </p>
                <p className="text-slate-700 dark:text-slate-400 text-sm">
                  Categoría
                </p>
              </InfoCard>
            )}

            <InfoCard
              icon={
                <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
              }
            >
              <ShareButton
                title={store.name}
                text={store.parrrafo}
                url={`https://roumenu.vercel.app/t/${store.sitioweb}`}
                className="p-0 text-base dark:text-slate-300"
              >
                Compartir Perfil
              </ShareButton>
            </InfoCard>
          </section>

          {/* Rating Section */}
          <section className="mb-6">
            <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-xl p-6">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg mb-4">
                Califica este catálogo
              </h3>
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      onClick={() => handleStarClick(starValue)}
                      onMouseEnter={() => setRatingHover(starValue)}
                      onMouseLeave={() => setRatingHover(0)}
                      className="transition-transform hover:scale-110"
                      type="button"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          starValue <= activeStar
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-primary/60 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="mb-6">
            <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg">
                  Reseñas
                </h3>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    {store.comentTienda.promedio.toFixed(1)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-400 text-sm">
                    ({store.comentTienda.total})
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {store.comentTienda.data.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-slate-300 dark:border-slate-700 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-slate-900 dark:text-slate-100 font-medium">
                          {review.user.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.star
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-slate-600 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-700 dark:text-slate-400 text-xs">
                            {format(review.created_at, "short")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                      {review.cmt}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href={`/t/${store.sitioweb}/about/ratings`}
                className="w-full mt-6 py-3 bg-primary/50 dark:bg-primary/30 hover:bg-primary/70 dark:hover:bg-primary/50 text-slate-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Ver todas las reseñas</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Social Media */}
          {store.redes.length > 0 && (
            <section className="mb-6">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg mb-3 px-1">
                Facebook e Instagram
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-xl p-4">
                <div className="flex flex-col gap-3">
                  {store.redes.map((red, idx) => (
                    <div className="flex items-center gap-3" key={idx}>
                      <IconSelect
                        iconName={red.tipo}
                        className="w-5 h-5 text-slate-700 dark:text-slate-400"
                      />
                      <Link
                        href={red.url}
                        className="text-cyan-800 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
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
            <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-lg mb-3 px-1">
              Info. y número de teléfono
            </h3>
            <div className="space-y-3">
              <InfoCard
                icon={
                  <Info className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
                }
              >
                <p className="text-slate-900 dark:text-slate-200 mb-1 line-clamp-5">
                  {store.parrrafo || "..."}
                </p>
                <p className="text-slate-700 dark:text-slate-400 text-sm">
                  Información
                </p>
              </InfoCard>
              <InfoCard
                icon={
                  <Phone className="w-5 h-5 text-slate-700 dark:text-slate-400 mt-0.5" />
                }
              >
                <p className="text-slate-900 dark:text-slate-100 mb-1">
                  +{store.cell}
                </p>
                <p className="text-slate-700 dark:text-slate-400 text-sm">
                  Número de teléfono
                </p>
              </InfoCard>
            </div>
          </section>
        </div>

        <Separator className="dark:bg-slate-700" />
        <footer className="p-4 border-t dark:border-slate-700">
          <Link
            className="text-lg text-(--text-muted) dark:text-slate-400 flex flex-col justify-center items-center h-full"
            href="https://rouadmin.vercel.app"
          >
            <Image
              src={logoAdmin}
              alt={store.name || ""}
              width={300}
              height={300}
              className="rounded-full w-40 h-40 object-cover"
            />
            Ir al panel de administración
          </Link>
        </footer>
        <Separator className="dark:bg-slate-700" />
      </div>

      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={handleCloseReview}
        ratingSelect={ratingSelect}
      />
    </div>
  );
}

// Componente reutilizable para tarjetas de info
const InfoCard = memo(function InfoCard({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-xl p-4 mb-3">
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
});

// --- Horarios ---

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
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Horarios no disponibles</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
      {groupedHorarios.map((group, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-slate-800 dark:text-slate-200 text-sm">
            {formatearDias(group.dias)}
          </span>
          <span className="text-slate-700 dark:text-slate-400 text-sm">
            {formatearHorario(group.apertura, group.cierre)}
          </span>
        </div>
      ))}
    </div>
  );
});
