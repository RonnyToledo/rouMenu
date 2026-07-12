"use client";
import React, { useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Footer from "./FooterDesc";
import { MyContext } from "@/context/MyContext";
import {
  ContactIcon,
  buildContactUrl,
  contactDisplayLabel,
  socialHandleLabel,
} from "@/lib/contactLinks";

export function CatalogFooter() {
  const { store } = useContext(MyContext);

  const contacts = useMemo(
    () =>
      [
        { tipo: "wa", url: String(store?.cell) },
        { tipo: "mail", url: store?.email },
        ...(store?.contacto ?? []),
      ].filter((c) => c.url),
    [store?.cell, store?.email, store?.contacto],
  );

  const redes = store?.redes ?? [];

  return (
    <footer className="bg-primary/80 mt-auto transition-colors duration-300">
      <div className="px-4 py-8 space-y-4">
        <Footer />

        <div className="mb-6">
          {contacts.length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2">
              <div className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">
                Contacto
              </div>
              {contacts.map((obj, index) => (
                <Link
                  href={buildContactUrl(obj.tipo, obj.url || "")}
                  key={index}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm"
                >
                  <ContactIcon iconName={obj.tipo} className="w-4 h-4" />
                  <span className="line-clamp-1 text-xs">
                    {contactDisplayLabel(obj.tipo, obj.url || "")}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {redes.length > 0 && (
            <div className="flex flex-col items-start mt-4 space-y-2">
              <div className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">
                Redes Sociales
              </div>
              {redes.map((obj, index) => (
                <Link
                  href={obj.url}
                  key={index}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <ContactIcon iconName={obj.tipo} className="w-4 h-4" />
                  <span className="truncate text-xs">
                    {socialHandleLabel(obj.tipo, obj.user)}
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
