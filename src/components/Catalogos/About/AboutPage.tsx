"use client";
import { MyContext } from "@/context/MyContext";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { logoAdmin } from "@/lib/image";
import { Map, Marker } from "pigeon-maps";
import { FaLocationDot } from "react-icons/fa6";
import { GrSchedule } from "react-icons/gr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { isOpen, IsOpenStoreInteface } from "@/functions/time";
import OpenClose from "../General/OpenClose";
import { ScheduleInterface } from "@/context/InitialStatus";
import { Separator } from "@/components/ui/separator";
import AboutMePage from "./NewDesing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { format } from "@formkit/tempo";
import Autoplay from "embla-carousel-autoplay";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { usePathname } from "next/navigation";
import PreviewRatingGeneral from "../General/PreviewRatingGeneral";
import { useAuth } from "@/context/AppContext";

export default function AboutPage() {
  const { store } = useContext(MyContext);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isOpenStore, setIsOpenStore] = useState<IsOpenStoreInteface>();
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
  useEffect(() => {
    setIsOpenStore(isOpen((store.horario || []) as ScheduleInterface[]));
  }, [store.horario]);

  return (
    <div>
      <main className="bg-slate-50 min-h-screen ">
        <AboutMePage />

        <div className="p-4">
          <div className="space-y-2 mt-2">
            <Card id="horario">
              <CardHeader>
                <CardTitle>Horario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start">
                  <GrSchedule className="h-6 w-6" />
                  <div className="ml-4">
                    <p
                      className={`text-[var(--accent-red)] font-bold ${
                        isOpenStore?.open ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {isOpenStore?.open ? "ABIERTO AHORA" : "CERRADO AHORA"}
                    </p>
                    <div
                      className={`text-[var(--accent-red)] text-base font-bold ${
                        isOpenStore?.open ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      <OpenClose
                        open={isOpenStore as IsOpenStoreInteface}
                        newHorario={
                          store.horario || ([] as ScheduleInterface[])
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <HorariosComponent
                  horario={store.horario || ([] as ScheduleInterface[])}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {store.ubicacion?.latitude && store.ubicacion?.longitude && (
              <Card id="mapa">
                <CardHeader>
                  <CardTitle>Encuéntranos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="flex items-center">
                    <FaLocationDot className="h-6 w-6 text-slate-700" />
                    <div className="ml-4">
                      <p className="text-[var(--text-muted)]">
                        {store?.direccion},
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {store.municipio}, {store.Provincia}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Testimonials Section */}

            <Card id="ratings">
              <CardHeader>
                <CardTitle>Calificaciones y opiniones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl space-y-4">
                  <Carousel
                    plugins={[
                      Autoplay({
                        delay: 5000,
                      }),
                    ]}
                    className="w-full max-w-xs"
                  >
                    <CarouselContent className="gap-2">
                      {store.comentTienda.data.map((testimonial, index) => (
                        <CarouselItem
                          key={index}
                          className="basis-2/3 border rounded-2xl aspect-square p-0"
                        >
                          <div className="flex flex-col  items-center justify-between h-full p-4">
                            <div className="flex items-center justify-center gap-1 ">
                              {[...Array(testimonial.star)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-5 w-5 fill-slate-300 text-slate-200"
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground  italic leading-relaxed line-clamp-4 text-center">
                              {testimonial.cmt}
                            </p>
                            <div className="flex items-center justify-center gap-4">
                              <p className="font-heading text-sm font-semibold text-card-foreground line-clamp-1">
                                {testimonial.name}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {format(testimonial.created_at, "short")}
                              </span>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>

                  <Button asChild variant="ghost">
                    <Link
                      href={`/t/${store.sitioweb}/about/ratings`}
                      className="w-full flex justify-between"
                    >
                      <h2 className="text-lg ">Todos los comentarios</h2>
                      <div className="text-lg">→</div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card id="mapa">
              <CardHeader>
                <CardTitle>Califica esta tienda online</CardTitle>
                <CardDescription>
                  {" "}
                  Comparte tu opinión con otros usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-6">
                  <div className="flex gap-2 items-center justify-center">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        onClick={() => handleStarClick(starValue)}
                        className="hover:scale-110 transition-transform "
                      >
                        <Star
                          className={`w-8 h-8 ${
                            starValue <= ratingSelect
                              ? "fill-slate-600 text-slate-600"
                              : "text-slate-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
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
  const [isOpen, setIsOpen] = useState(false);

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

  const getStatusColor = (apertura: string, cierre: string): string => {
    const horario = formatearHorario(apertura, cierre);

    if (horario === "Abierto 24 horas") return "text-green-600";
    if (horario === "Cerrado") return "text-red-500";
    return "text-slate-600";
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-1"
        aria-expanded={isOpen}
        aria-controls="horarios-content"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <Clock className="w-4 h-4" />
        <span className="font-medium">Ver horario completo</span>
      </button>

      {isOpen && (
        <div
          id="horarios-content"
          className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200"
        >
          {groupedHorarios.map((group, index) => {
            const horarioTexto = formatearHorario(group.apertura, group.cierre);
            const diasTexto = formatearDias(group.dias);
            const colorClass = getStatusColor(group.apertura, group.cierre);

            return (
              <div
                key={index}
                className="flex justify-between items-center py-1 text-sm border-b border-slate-100 last:border-b-0"
              >
                <span className="text-slate-700 font-medium min-w-0 flex-1">
                  {diasTexto}:
                </span>
                <span className={`ml-3 ${colorClass} font-medium`}>
                  {horarioTexto}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
