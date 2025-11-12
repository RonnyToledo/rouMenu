"use client";

import { MapPin, Mail, Globe, Tag, LinkIcon, Phone, Info } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import Image from "next/image";
import React, { useContext, useState } from "react";
import { logoAdmin } from "@/lib/image";
import { Map, Marker } from "pigeon-maps";
import Link from "next/link";
import { Star, ChevronRight, Clock } from "lucide-react";
import { ScheduleInterface } from "@/context/InitialStatus";
import { Separator } from "@/components/ui/separator";
import { format } from "@formkit/tempo";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { usePathname } from "next/navigation";
import PreviewRatingGeneral from "../General/PreviewRatingGeneral";
import { useAuth } from "@/context/AppContext";
import { logoApp } from "@/lib/image";
import { IconSelect, SelectUser } from "../General/Footer";

export default function AboutPage() {
  const { store } = useContext(MyContext);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [ratingSelect, setRatingSelect] = useState<number>(0);
  // nuevo: control del popover de login y del modal de reseña
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false); // controla modal de reseña

  const handleStarClick = (rating: number) => {
    setRatingSelect(rating);

    if (user && loading === false) {
      setReviewOpen(true);
      return;
    }

    // Si no está logueado -> marcar pending y abrir LoginPopover
    setIsLoginOpen(true);
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-300">
        <div className="container mx-auto px-4 py-6 max-w-4xl pb-8">
          {/* Profile Section */}
          <section className="mb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 overflow-hidden border-4 border-slate-300">
                  <Image
                    height={160}
                    width={160}
                    src={store.urlPoster || logoApp}
                    alt={store.name || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="text-slate-700 text-sm">
                Perfil público.{" "}
                <button className="text-cyan-600 hover:text-cyan-800 transition-colors">
                  Más información
                </button>
              </p>
            </div>

            {/* Business Name */}
            <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-700 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-slate-900 font-semibold text-lg mb-1">
                    {store.name}
                  </h2>
                  <p className="text-slate-700 text-sm">Nombre de la tienda</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {store.history ? (
              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-900 mb-1 line-clamp-3">
                      {store.history || "..."}
                    </p>
                    <p className="text-slate-700 text-sm">Sobre nosotros</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Address */}
            {store.ubicacion?.latitude && store.ubicacion?.longitude ? (
              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <div className="rounded-xl overflow-hidden">
                      <Map
                        height={300}
                        defaultCenter={[
                          store.ubicacion?.latitude || 0,
                          store.ubicacion?.longitude || 0,
                        ]}
                        mouseEvents={false}
                        touchEvents={false}
                        defaultZoom={15}
                      >
                        <Marker
                          width={50}
                          anchor={[
                            store.ubicacion?.latitude || 0,
                            store.ubicacion?.longitude || 0,
                          ]}
                        />
                      </Map>
                    </div>
                    <div className="ml-4">
                      <p className="text-[var(--text-muted)]">
                        {store?.direccion},
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {store.municipio}, {store.Provincia}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Business Hours */}
            <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-700 mt-0.5" />
                <div className="flex-1">
                  <div className="space-y-2 mb-2">
                    <HorariosComponent
                      horario={store.horario || ([] as ScheduleInterface[])}
                      className="w-full"
                    />
                  </div>
                  <p className="text-slate-400 text-xs">Horario comercial</p>
                </div>
              </div>
            </div>

            {/* Email */}
            {store.email ? (
              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-cyan-800 hover:text-cyan-600 transition-colors text-left">
                      {store.email}
                    </div>
                    <p className="text-slate-700 text-sm">Correo electrónico</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Website */}
            {false ? (
              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-900 mb-1">
                      https://roudev.vercel.app
                    </p>
                    <p className="text-slate-700 text-sm mb-3">Sitio web</p>
                    <button className="text-cyan-800 hover:text-cyan-600 transition-colors text-sm">
                      Añadir otro sitio web
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Category */}
            {store.tipo ? (
              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-3">
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-900 mb-1">{store.tipo}</p>
                    <p className="text-slate-700 text-sm">Categoría</p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {/* Rating Section */}
          <section className="mb-6">
            <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-6">
              <h3 className="text-slate-900 font-semibold text-lg mb-4">
                Califica este catálogo
              </h3>
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      key={starValue}
                      onClick={() => handleStarClick(starValue)}
                      onMouseEnter={() => handleStarClick(starValue)}
                      onMouseLeave={() => handleStarClick(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          starValue <= ratingSelect
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-slate-600"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="mb-6">
            <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-900 font-semibold text-lg">
                  Reseñas
                </h3>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-slate-900 font-semibold">
                    {store.comentTienda.promedio.toFixed(1)}
                  </span>
                  <span className="text-slate-700 text-sm">
                    ({store.comentTienda.total})
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {store.comentTienda.data.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-slate-300 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-slate-900 font-medium">
                          {review.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.star
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-slate-700 text-xs">
                            {format(review.created_at, "short")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm mb-3">{review.cmt}</p>
                  </div>
                ))}
              </div>

              <Link
                href={`/t/${store.sitioweb}/about/ratings`}
                className="w-full mt-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Ver todas las reseñas</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Social Media */}
          <section className="mb-6">
            <h3 className="text-slate-900 font-semibold text-lg mb-3 px-1">
              Facebook e Instagram
            </h3>
            <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4">
              {store.redes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {store.redes.map((red, idx) => (
                    <div className="flex items-center gap-3" key={idx}>
                      <IconSelect
                        iconName={red.tipo}
                        className="w-5 h-5 text-slate-700"
                      />
                      <Link
                        href={red.url}
                        className="text-cyan-800 hover:text-cyan-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {SelectUser(red.tipo, red.user)}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-slate-700" />
                  <Link
                    href="#"
                    className="text-cyan-800 hover:text-cyan-600 transition-colors"
                  >
                    Añadir cuentas
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Contact Info */}
          <section className="mb-6">
            <h3 className="text-slate-900 font-semibold text-lg mb-3 px-1">
              Info. y número de teléfono
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-900 mb-1 line-clamp-5">
                      {store.parrrafo || "..."}
                    </p>
                    <p className="text-slate-700 text-sm">Información</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 backdrop-blur-sm border border-slate-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-slate-900 mb-1">+{store.cell}</p>
                    <p className="text-slate-700 text-sm">Número de teléfono</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Separator />
        <footer className="p-4 border-t ">
          <Link
            className="text-lg text-[var(--text-muted)] flex flex-col justify-center items-center h-full"
            href="https://rouadmin.vercel.app"
          >
            {" "}
            <Image
              src={logoAdmin}
              alt={store.name || "Shoes background"}
              width={300}
              height={300}
              className="rounded-full w-40 h-40 object-cover"
            />
            Ir al panel de administración
          </Link>
        </footer>
        <Separator />
      </div>
      <LoginPopover
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          // Si el usuario cerró el popover sin loguearse, desistimos de la intención
        }}
        redirectTo={pathname} // Ruta dinámica
      />
      {/* Modal de reseña: ajusta props/import si tu componente es distinto */}
      <PreviewRatingGeneral
        reviewOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        ratingSelect={ratingSelect}
      />
    </div>
  );
}

interface HorarioGroup {
  dias: string[];
  apertura: string;
  cierre: string;
}

interface HorariosComponentProps {
  horario: ScheduleInterface[];
  className?: string;
}

const HorariosComponent: React.FC<HorariosComponentProps> = ({
  horario = [],
  className = "",
}) => {
  // Lógica para agrupar horarios consecutivos (tu lógica original mejorada)
  const agruparHorarios = (horarios: ScheduleInterface[]): HorarioGroup[] => {
    if (!horarios || horarios.length === 0) return [];

    const groupedHorarios: HorarioGroup[] = [];
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
        groupedHorarios.push(currentGroup);
        currentGroup = {
          dias: [hor.dia],
          apertura: hor.apertura,
          cierre: hor.cierre,
        };
      }
    }
    groupedHorarios.push(currentGroup);
    return groupedHorarios;
  };

  const opciones: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const formatearHorario = (apertura: string, cierre: string): string => {
    try {
      const aperturaDate = new Date(apertura);
      const cierreDate = new Date(cierre);

      // Verificar si está abierto 24 horas
      const isAbierto24h =
        (aperturaDate.getHours() === 0 && cierreDate.getHours() === 0) ||
        aperturaDate.getDate() + 1 === cierreDate.getDate();

      if (isAbierto24h) {
        return "Abierto 24 horas";
      }

      // Verificar si está cerrado
      const isCerrado =
        aperturaDate.getHours() === cierreDate.getHours() &&
        aperturaDate.getDate() === cierreDate.getDate();

      if (isCerrado) {
        return "Cerrado";
      }

      // Formatear horario normal
      const aperturaStr = aperturaDate
        .toLocaleTimeString("es-ES", opciones)
        .toLowerCase();
      const cierreStr = cierreDate
        .toLocaleTimeString("es-ES", opciones)
        .toLowerCase();

      return `${aperturaStr} – ${cierreStr}`;
    } catch (error) {
      console.error("Error al formatear horario:", error);
      return "Horario no disponible";
    }
  };

  const formatearDias = (dias: string[]): string => {
    if (dias.length === 0) return "";
    if (dias.length === 1) return dias[0];
    return `De ${dias[0]} a ${dias[dias.length - 1]}`;
  };

  const groupedHorarios = agruparHorarios(horario);

  if (!horario || horario.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-slate-500 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm">Horarios no disponibles</span>
      </div>
    );
  }

  return (
    <div className={`${className} `}>
      <div
        id="horarios-content"
        className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200"
      >
        {groupedHorarios.map((group, index) => {
          const horarioTexto = formatearHorario(group.apertura, group.cierre);
          const diasTexto = formatearDias(group.dias);

          return (
            <div key={index} className="flex justify-between items-center">
              <span className="text-slate-800 text-sm">{diasTexto}</span>
              <span className="text-slate-700 text-sm">{horarioTexto}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
