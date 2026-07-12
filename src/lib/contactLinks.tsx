import {
  FaWhatsapp,
  FaSquareXTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaSignal,
  FaPhone,
} from "react-icons/fa6";
import { GoMail } from "react-icons/go";

export function socialHandleLabel(iconName: string, name: string): string {
  if (iconName === "insta" || iconName === "twitter") {
    return name.includes("@") ? name : `@${name}`;
  }
  return name;
}

export function ContactIcon({
  iconName,
  className = "w-6 h-6",
}: {
  iconName: string;
  className?: string;
}) {
  if (iconName === "insta") return <FaInstagram className={className} />;
  if (iconName === "face") return <FaFacebook className={className} />;
  if (iconName === "twitter") return <FaSquareXTwitter className={className} />;
  if (iconName === "linkenid") return <FaLinkedin className={className} />;
  if (iconName === "wa") return <FaWhatsapp className={className} />;
  if (iconName === "cell") return <FaPhone className={className} />;
  if (iconName === "mail") return <GoMail className={className} />;
  return <FaSignal className={className} />;
}

export function buildContactUrl(tipo: string, url: string): string {
  if (tipo === "wa")
    return url.startsWith("http") ? url : `https://wa.me/${url}/`;
  if (tipo === "cell") return `tel:+${url}/`;
  if (tipo === "mail") return `mailto:${url}?subject=Hola`;
  return "#";
}

export function contactDisplayLabel(tipo: string, url: string): string {
  if (tipo === "wa" || tipo === "cell") {
    return url.includes("http") ? "Grupo de WhatsApp" : `+${url}`;
  }
  if (tipo === "mail") return url;
  return "...";
}
