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
    <footer className="bg-linear-to-br from-primary/60 to-primary/90 mt-auto">
      <div className="px-4 py-8 space-y-4">
        <Footer />

        <div className="mb-8">
          {/*Contactos */}
          {[
            { tipo: "wa", url: String(store?.cell) },
            { tipo: "mail", url: store?.email },
            ...store?.contacto,
          ].length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2  w-12/12">
              <div className="text-slate-50 uppercase text font-cinzel">
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
                  className="line-clamp-1 w-full flex items-center gap-2 text-slate-100 text-base hover:text-slate-200 transition-all duration-500 hover:scale-105"
                >
                  <IconSelect iconName={obj.tipo} />
                  <div className="line-clamp-1 text-sm">
                    {userContact(obj.tipo, obj.url || "")}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/*Redes Sociales */}
          {store?.redes.length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2  w-12/12">
              <div className="text-slate-50 uppercase text font-cinzel">
                Redes Sociales
              </div>
              {store?.redes.map((obj, index) => (
                <Link
                  href={obj.url}
                  key={index}
                  className="flex truncate items-center gap-2 text-slate-100 text-base hover:text-slate-200 transition-all duration-500 hover:scale-105"
                >
                  <IconSelect iconName={obj.tipo} />
                  <div className="truncate text-sm">
                    {SelectUser(obj.tipo, obj.user)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <Button
            size="lg"
            asChild
            className="bg-linear-to-r from-primary/40 via-primary/50 to-primary/40 text-slate-50 hover:from-primary/80 hover:via-primary/90 hover:to-primary/80   px-8 transform  transition-all duration-500 shadow-lg "
          >
            <Link href={"https://rouadmin.vercel.app/createAccount"}>
              <Plus size={16} className="mr-2" />
              Registra tu catalogo
            </Link>
          </Button>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 text-center text-xs text-slate-50">
          <p>
            © {new Date().getFullYear()} {store?.name}. Todos los derechos
            reservados.
          </p>
          <p className="mt-1">
            Diseñado por{" "}
            <a className="text-(--text-gold) hover:underline" href="#">
              rou-dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
export function SelectUser(iconName: string, name: string) {
  if (iconName == "insta" || iconName == "twitter") {
    return name.includes("@") ? name : `@${name}`;
  }
  if (iconName == "face" || iconName == "linkenid") {
    return name;
  }
  return name;
}
export function IconSelect({
  iconName,
  className = "size-6",
}: {
  iconName: string;
  className?: string;
}) {
  if (iconName == "insta") {
    return <FaInstagram className={className} />;
  }
  if (iconName == "face") {
    return <FaFacebook className={className} />;
  }
  if (iconName == "twitter") {
    return <FaSquareXTwitter className={className} />;
  }
  if (iconName == "linkenid") {
    return <FaLinkedin className={className} />;
  }
  if (iconName == "wa") {
    return <FaWhatsapp className={className} />;
  }
  if (iconName == "cell") {
    return <FaPhone className={className} />;
  }
  if (iconName == "mail") {
    return <GoMail className={className} />;
  }
  return <FaSignal className={className} />;
}

function UrlContact(tipo: string, url: string): string {
  if (tipo == "wa") {
    if (url.startsWith("http")) {
      return url;
    } else {
      return `https://wa.me/${url}/`;
    }
  }
  if (tipo == "cell") {
    return `tel:+${url}/`;
  }
  if (tipo == "mail") {
    return `mailto:${url}?subject=Hola`;
  }

  return "#";
}
function userContact(tipo: string, url: string): string {
  if (tipo == "wa" || tipo == "cell") {
    if (url.includes("http")) {
      return "Grupo de WhatsApp";
    } else {
      return `+${url}`;
    }
  }
  if (tipo == "mail") {
    return url;
  }
  return "...";
}
