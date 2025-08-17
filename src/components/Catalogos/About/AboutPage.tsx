"use client";
import { MyContext } from "@/context/MyContext";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { logoAdmin, logoApp } from "@/lib/image";
import { Map, Marker } from "pigeon-maps";
import { TbTruckDelivery } from "react-icons/tb";
import { FaLocationDot } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { GrSchedule } from "react-icons/gr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { isOpen, IsOpenStoreInteface } from "@/functions/time";
import OpenClose from "../General/OpenClose";
import { ScheduleInterface } from "@/context/InitialStatus";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { Separator } from "@/components/ui/separator";
import { Rating } from "./RatingModal";

export default function AboutPage() {
  const { store } = useContext(MyContext);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [isOpenStore, setIsOpenStore] = useState<IsOpenStoreInteface>();

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setIsModalOpen(true);
  };
  useEffect(() => {
    setIsOpenStore(isOpen((store.horario || []) as ScheduleInterface[]));
  }, [store.horario]);

  return (
    <div>
      <main className="bg-gray-50">
        <div className="bg-white shadow-sm text-center">
          <div
            className="h-48 bg-gradient-to-br from-rose-200 to-rose-300"
            style={{
              width: "100%",
              backgroundImage: `url(${
                store.banner || store.urlPoster || logoApp
              })`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />

          {/* Profile Content */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-3/4 flex flex-col items-center">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-rose-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={store.urlPoster || logoApp}
                  alt={store.name || "Shoes background"}
                  width={300}
                  height={300}
                  className="rounded-full h-36 w-36 object-cover mx-auto"
                />
              </div>
            </div>
          </div>

          <div className="shadow-md p-6 text-center mt-5">
            <h2 className="text-2xl font-bold mb-2">{store.name}</h2>
            <p className="text-blue-600 font-semibold mb-4">{store.tipo}</p>
            <p className="text-gray-600 mb-4 line-clamp-5">{store.parrrafo}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-2 mt-2">
            <Card id="ubicacion">
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start">
                  <FaLocationDot className="h-6 w-6" />
                  <div className="ml-4">
                    <p className="text-[var(--text-muted)]">
                      {store.municipio}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {store?.direccion}, {store.municipio}, {store.Provincia}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {store.domicilio && (
              <Card id="delivery">
                <CardHeader>
                  <CardTitle>Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start">
                    <TbTruckDelivery className="h-6 w-6" />
                    <div className="ml-4">
                      <p className="text-[var(--text-muted)]">
                        Entrega a domicilio disponible
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

                    <HorariosComponent
                      horario={store.horario || ([] as ScheduleInterface[])}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {(store.cell || store.email) && (
              <Card id="contacto">
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {store.cell && (
                    <Link
                      href={`https://wa.me/${store.cell}/`}
                      className="flex items-star gap-4"
                    >
                      <FaWhatsapp className="h-6 w-6" />
                      <p className="text-[var(--text-muted)]">+{store.cell}</p>
                    </Link>
                  )}

                  {store.email && (
                    <Link
                      href={`mailto:${store.email}?subject=Hola`}
                      className="flex items-star gap-4"
                    >
                      <MdOutlineAlternateEmail className="h-6 w-6" />
                      <p className="text-[var(--text-muted)]">{store.email}</p>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
            {store.ubicacion?.latitude && store.ubicacion?.longitude && (
              <Card id="mapa">
                <CardHeader>
                  <CardTitle>Encuéntranos</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
            <Card id="ratings">
              <CardHeader>
                <CardTitle>Calificaciones y opiniones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xl mx-auto p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="grid grid-cols-2 items-center gap-2 mb-8">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl font-light">
                        {store.comentTienda.promedio.toFixed(1)}
                      </div>
                      <div className="flex gap-1 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= store.comentTienda.promedio
                                ? "fill-yellow-600 text-yellow-600"
                                : "text-yellow-600"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Number(store.comentTienda.total).toLocaleString()}{" "}
                        reseñas
                      </div>
                    </div>

                    <StarSpecifications />
                  </div>
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
                <CardTitle>Deja tu comentario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="pt-6">
                  <h3 className="text-xl mb-2">Califica esta tienda online</h3>
                  <p className="text-gray-400 mb-4">
                    Comparte tu opinión con otros usuarios
                  </p>
                  <div className="flex gap-2 items-center justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleStarClick(rating)}
                        className="hover:scale-110 transition-transform "
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= selectedRating
                              ? "fill-gray-600 text-gray-600"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Rating
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  starsSelected={selectedRating}
                  userName={"Usuario"}
                  setIsModalOpen={setIsModalOpen}
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
function StarSpecifications() {
  const { store } = useContext(MyContext);

  const porEstrellas = store.comentTienda.porEstrellas || {
    "5": 0,
    "4": 0,
    "3": 0,
    "2": 0,
    "1": 0,
    "0": 0,
  };

  // 1️⃣ Calcula el total solo 1 vez
  const totalVotos = Object.values(porEstrellas).reduce(
    (sum, v) => (sum = (sum || 0) + (v || 0)),
    0
  );

  return (
    <div className="flex-1">
      {[5, 4, 3, 2, 1].map((item) => {
        const votos =
          porEstrellas[item.toString() as keyof typeof porEstrellas] || 0;
        // evita dividir por cero
        const porcentaje = totalVotos > 0 ? (votos * 100) / totalVotos : 0;
        return (
          <div key={item} className="flex items-center gap-2 mb-1">
            <span className="w-3">{item}</span>
            <div className="flex-1 h-2 bg-gray-400 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400"
                style={{
                  width: `${porcentaje}%`,
                }}
              />
            </div>
          </div>
        );
      })}
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
        aperturaDate.getHours() === 0 &&
        cierreDate.getHours() === 0 &&
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
    return "text-gray-600";
  };

  const groupedHorarios = agruparHorarios(horario);

  if (!horario || horario.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm">Horarios no disponibles</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-1"
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
          className="mt-3 ml-6 space-y-2 animate-in slide-in-from-top-2 duration-200"
        >
          {groupedHorarios.map((group, index) => {
            const horarioTexto = formatearHorario(group.apertura, group.cierre);
            const diasTexto = formatearDias(group.dias);
            const colorClass = getStatusColor(group.apertura, group.cierre);

            return (
              <div
                key={index}
                className="flex justify-between items-center py-1 text-sm border-b border-gray-100 last:border-b-0"
              >
                <span className="text-gray-700 font-medium min-w-0 flex-1">
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
