import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { logoApp } from "@/lib/image";
import { FaMapMarkerAlt, FaTools, FaMedrt } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import {
  MdVerified,
  MdLocalShipping,
  MdDevices,
  MdOutlineCoffeeMaker,
  MdOutlineRestaurantMenu,
  MdMonetizationOn,
} from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import { GiClothes } from "react-icons/gi";

interface ProvinciaPageProps {
  params: Promise<{ location: string }>;
}

interface SitioItem {
  UUID: string;
  name: string;
  sitioweb: string;
  urlPoster?: string;
  banner?: string;
  municipio?: string;
  Provincia?: string;
  tipo?: string;
  domicilio?: boolean;
  plan?: string;
}

const TIPO_ICON: Record<string, React.ElementType> = {
  Maquillaje: IoColorPaletteOutline,
  Cafetería: MdOutlineCoffeeMaker,
  Restaurante: MdOutlineRestaurantMenu,
  Farmacia: FaMedrt,
  Ferretería: FaTools,
  Remesas: FaMoneyBillTransfer,
  Ropa: GiClothes,
  Tecnología: MdDevices,
};
const iconFor = (tipo?: string) => TIPO_ICON[tipo ?? ""] ?? MdMonetizationOn;

export default async function ProvinciaPage({ params }: ProvinciaPageProps) {
  const { location } = await params;
  const municipio = decodeURIComponent(location);

  const { data: sitios, error } = await supabase
    .from("Sitios")
    .select(
      "UUID, name, sitioweb, urlPoster, banner, municipio, Provincia, tipo, domicilio, plan",
    )
    .eq("municipio", municipio)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching sitios for municipio:", error);
    return (
      <main className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#E7E0D6] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#1A1613] mb-2">
            {municipio}
          </h1>
          <p className="text-sm text-[#6B5F56]">
            No se pudieron cargar los negocios. Intenta de nuevo más tarde.
          </p>
        </div>
      </main>
    );
  }

  const list = (sitios ?? []) as SitioItem[];

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />

      <main className="min-h-screen bg-white">
        {/* ── HERO (mismo lenguaje visual que CatalogsPage) ── */}
        <div className="relative overflow-hidden border-b border-[#E7E0D6] pt-14 pb-8 px-3">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(#EFE8DE 1px, transparent 1px), linear-gradient(90deg, #EFE8DE 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 520,
              height: 520,
              top: -240,
              left: "50%",
              transform: "translateX(-50%)",
              background:
                "radial-gradient(circle, rgba(200,75,49,0.12) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: "rgba(200,75,49,0.08)",
                border: "1px solid rgba(200,75,49,0.28)",
              }}
            >
              <FaMapMarkerAlt className="text-[11px] text-[#C84B31]" />
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#C84B31]">
                {list.length > 0
                  ? `${list.length} ${list.length === 1 ? "negocio" : "negocios"}`
                  : "Territorio"}
              </span>
            </div>

            <h1
              className="font-serif font-bold leading-[0.92] mb-3"
              style={{ fontSize: "clamp(2.4rem, 8vw, 4rem)", color: "#1A1613" }}
            >
              Negocios en
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #C84B31 0%, #E07840 45%, #E8A838 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {municipio}
              </span>
            </h1>

            <p className="text-sm font-light leading-relaxed max-w-xs text-[#6B5F56]">
              Descubre los catálogos con presencia en este municipio. Toca
              cualquiera para verlo completo.
            </p>
          </div>
        </div>

        {/* ── GRID ── */}
        <section className="max-w-2xl mx-auto px-3 py-8">
          {list.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#6B5F56]">
              No se encontraron negocios en {municipio}.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {list.map((sitio) => {
                const Icon = iconFor(sitio.tipo);
                return (
                  <Link
                    key={sitio.UUID}
                    href={`/t/${sitio.sitioweb}`}
                    className="group overflow-hidden rounded-2xl border border-[#E7E0D6] bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-[#F6F2EC]">
                      <Image
                        src={sitio.banner || sitio.urlPoster || logoApp}
                        alt={sitio.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {sitio.plan && (
                        <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#9C6A16] shadow-sm">
                          {sitio.plan === "pro"
                            ? "⭐ Pro"
                            : sitio.plan === "basico"
                              ? "✓ Básico"
                              : "Trial"}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5">
                      <div className="mb-1 flex items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-[#1A1613]">
                          {sitio.name}
                        </p>
                        {(sitio.plan === "pro" || sitio.plan === "basico") && (
                          <MdVerified className="shrink-0 text-[13px] text-[#C84B31]" />
                        )}
                      </div>

                      <p className="mb-3 flex items-center gap-1 text-[11px] text-[#6B5F56]">
                        <FaMapMarkerAlt className="text-[9px]" />
                        {sitio.municipio ? `${sitio.municipio}, ` : ""}
                        {sitio.Provincia}
                        {sitio.domicilio && (
                          <MdLocalShipping className="ml-1 text-[12px] text-[#6B5F56]" />
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 border-t border-[#F0EBE3] pt-2">
                        {sitio.tipo && (
                          <span className="flex items-center gap-1 rounded-full border border-[#E7E0D6] bg-[#F6F2EC] px-2 py-1 text-[10px] font-semibold text-[#6B5F56]">
                            <Icon className="text-[11px]" />
                            {sitio.tipo}
                          </span>
                        )}
                        <span className="rounded-full bg-[#FEF3E2] px-2 py-1 text-[10px] font-semibold text-[#9C6A16]">
                          Ver catálogo →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
