"use client";
import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import { FaWhatsapp, FaSquareXTwitter } from "react-icons/fa6";
import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaSignal,
  FaPhone,
} from "react-icons/fa";
import { GoMail } from "react-icons/go";
import { Plus } from "lucide-react";
import Link from "next/link";
import Footer from "./FooterDesc";
import { MyContext } from "@/context/MyContext";

export function CatalogFooter() {
  const { store } = useContext(MyContext);

  return (
    <footer className="bg-primary/80 mt-auto transition-colors duration-300">
      <div className="px-4 py-8 space-y-4">
        <Footer />

        <div className="mb-6">
          {/* Contactos */}
          {[
            { tipo: "wa", url: String(store?.cell) },
            { tipo: "mail", url: store?.email },
            ...store?.contacto,
          ].length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2">
              <div className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">
                Contacto
              </div>
              {[
                { tipo: "wa", url: String(store?.cell) },
                { tipo: "mail", url: store?.email },
                ...store?.contacto,
              ].map((obj, index) => (
                <Link
                  href={UrlContact(obj.tipo, obj.url || "")}
                  key={index}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm"
                >
                  <IconSelect iconName={obj.tipo} className="w-4 h-4" />
                  <span className="line-clamp-1 text-xs">
                    {userContact(obj.tipo, obj.url || "")}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Redes Sociales */}
          {store?.redes.length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2">
              <div className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">
                Redes Sociales
              </div>
              {store?.redes.map((obj, index) => (
                <Link
                  href={obj.url}
                  key={index}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <IconSelect iconName={obj.tipo} className="w-4 h-4" />
                  <span className="truncate text-xs">
                    {SelectUser(obj.tipo, obj.user)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          asChild
          className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 gap-2 transition-colors"
        >
          <Link href="https://rouadmin.vercel.app/createAccount">
            <Plus className="w-3.5 h-3.5" />
            Registra tu catálogo
          </Link>
        </Button>

        <div className="mt-4 text-center text-[10px] text-white/60">
          <p>
            © {new Date().getFullYear()} {store?.name}. Todos los derechos
            reservados.
          </p>
          <p className="mt-0.5">
            Diseñado por{" "}
            <a
              className="text-white/80 hover:text-white transition-colors underline"
              href="#"
            >
              rou-dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SelectUser(iconName: string, name: string) {
  if (iconName == "insta" || iconName == "twitter")
    return name.includes("@") ? name : `@${name}`;
  return name;
}

export function IconSelect({
  iconName,
  className = "w-6 h-6",
}: {
  iconName: string;
  className?: string;
}) {
  if (iconName == "insta") return <FaInstagram className={className} />;
  if (iconName == "face") return <FaFacebook className={className} />;
  if (iconName == "twitter") return <FaSquareXTwitter className={className} />;
  if (iconName == "linkenid") return <FaLinkedin className={className} />;
  if (iconName == "wa") return <FaWhatsapp className={className} />;
  if (iconName == "cell") return <FaPhone className={className} />;
  if (iconName == "mail") return <GoMail className={className} />;
  return <FaSignal className={className} />;
}

function UrlContact(tipo: string, url: string): string {
  if (tipo == "wa")
    return url.startsWith("http") ? url : `https://wa.me/${url}/`;
  if (tipo == "cell") return `tel:+${url}/`;
  if (tipo == "mail") return `mailto:${url}?subject=Hola`;
  return "#";
}

function userContact(tipo: string, url: string): string {
  if (tipo == "wa" || tipo == "cell")
    return url.includes("http") ? "Grupo de WhatsApp" : `+${url}`;
  if (tipo == "mail") return url;
  return "...";
}
