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
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="px-4 py-8 space-y-4">
        <Footer />

        <div className="mb-8">
          {/*Contactos */}
          {[
            { tipo: "wa", url: String(store?.cell) },
            { tipo: "mail", url: store?.email },
            ...store?.contacto,
          ].length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2 ">
              <div className="text-gray-800 uppercase text font-cinzel">
                Contacto
              </div>
              {[
                { tipo: "wa", url: String(store?.cell) },
                { tipo: "mail", url: store?.email },
                ...store?.contacto,
              ].map((obj, index) => (
                <Link
                  href={UrlContact(obj.url || "", obj.tipo)}
                  key={index}
                  className="flex items-center gap-2 text-gray-700 text-base"
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
            <div className="flex flex-col items-start mt-4 space-y-2 ">
              <div className="text-gray-800 uppercase text font-cinzel">
                Redes Sociales
              </div>
              {store?.redes.map((obj, index) => (
                <Link
                  href={obj.url}
                  key={index}
                  className="flex items-center gap-2 text-gray-700 text-base"
                >
                  <IconSelect iconName={obj.tipo} />
                  <div className="line-clamp-1 text-sm">
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
            className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 hover:from-gray-300 hover:via-gray-200 hover:to-gray-300 text-white hover:text-gray-800 px-8 transform hover:scale-105 transition-all duration-800 shadow-lg hover:shadow-xl hover:border"
          >
            <Link href={"https://rh-admin.vercel.app/createAccount"}>
              <Plus size={16} className="mr-2" />
              Registra tu catalogo
            </Link>
          </Button>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          <p>
            © {new Date().getFullYear()} {store?.name}. Todos los derechos
            reservados.
          </p>
          <p className="mt-1">
            Diseñado por{" "}
            <a className="text-[var(--text-gold)] hover:underline" href="#">
              rou-dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
function SelectUser(iconName: string, name: string) {
  if (iconName == "insta" || iconName == "twitter") {
    return name.includes("@") ? name : `@${name}`;
  }
  if (iconName == "face" || iconName == "linkenid") {
    return name;
  }
  return name;
}
function IconSelect({ iconName }: { iconName: string }) {
  const classStyle = "size-6";
  if (iconName == "insta") {
    return <FaInstagram className={classStyle} />;
  }
  if (iconName == "face") {
    return <FaFacebook className={classStyle} />;
  }
  if (iconName == "twitter") {
    return <FaSquareXTwitter className={classStyle} />;
  }
  if (iconName == "linkenid") {
    return <FaLinkedin className={classStyle} />;
  }
  if (iconName == "wa") {
    return <FaWhatsapp className={classStyle} />;
  }
  if (iconName == "cell") {
    return <FaPhone className={classStyle} />;
  }
  if (iconName == "mail") {
    return <GoMail className={classStyle} />;
  }
  return <FaSignal className={classStyle} />;
}

function UrlContact(tipo: string, url: string): string {
  if (tipo == "wa") {
    return `https://wa.me/${url}/`;
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
    return `+${url}`;
  }
  if (tipo == "mail") {
    return url;
  }
  return "...";
}
