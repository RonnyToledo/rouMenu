"use client";
import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "@/context/MyContext";
import { FaWhatsapp, FaSquareXTwitter } from "react-icons/fa6";
import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaSignal,
  FaPhone,
} from "react-icons/fa";
import { GoMail } from "react-icons/go";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
const prevRuta = [
  {
    url: "",
    name: "Inicio",
  },
  {
    url: "/about",
    name: "Acerca de",
  },
  {
    url: "/category",
    name: "Categorias",
  },
  {
    url: "/search",
    name: "Buscar",
  },
  {
    url: "/comparar",
    name: "Comparar",
  },
];
export default function Footer() {
  const { store } = useContext(MyContext);
  const [ruta, setRuta] = useState(prevRuta);
  const pathname = usePathname();
  useEffect(() => {
    if (store?.sitioweb) {
      const startRuta = `/t/${store?.sitioweb}`;
      setRuta(
        prevRuta.map((obj) => ({ ...obj, url: startRuta.concat(obj.url) }))
      );
    }
  }, [store?.sitioweb]);

  return (
    <footer className="bg-gray-100 border-t-2 border-[var(--border-gold)] p-6">
      <div className="text-center">
        <h3 className="text-2xl font-cinzel text-[var(--text-dark)] tracking-wider uppercase">
          {store?.name}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-5">
          {store?.parrrafo || "..."}
        </p>
      </div>
      {/*Rutas */}
      <div className="flex flex-col items-start mt-4 space-y-2 ">
        <div className="text-gray-800 uppercase text font-cinzel">
          Otras rutas
        </div>
        {ruta
          .filter((item) => pathname !== item.url)
          .map((obj, index) => (
            <Link
              href={obj.url}
              key={index}
              className="flex items-center gap-2 text-gray-700 text-base"
            >
              <div className="line-clamp-1 text-sm">{obj.name}</div>
            </Link>
          ))}
      </div>
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
      <Separator className="my-2" />
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
    </footer>
  );
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
function SelectUser(iconName: string, name: string) {
  if (iconName == "insta" || iconName == "twitter") {
    return name.includes("@") ? name : `@${name}`;
  }
  if (iconName == "face" || iconName == "linkenid") {
    return name;
  }
  return name;
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
