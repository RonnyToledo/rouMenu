"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { useAuth } from "@/context/AppContext";
import { useParams, useSearchParams } from "next/navigation";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { logoApp } from "@/lib/image";
import { Store, Truck } from "lucide-react";

export default function HeroNew() {
  const { store, dispatchStore } = useContext(MyContext);
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const effectRan = useRef(false);

  console.log(user);

  const [loginState, setLoginState] = useState({
    showLogin: false,
    loginMessage: "",
    redirectTo: "",
  });

  const shopName = params.shop as string;

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    // Verificar si debe mostrar el login
    const shouldShowLogin = searchParams.get("showLogin") === "true";
    const message = searchParams.get("message");
    const redirect = searchParams.get("redirectTo");

    if (shouldShowLogin && !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoginState({
        showLogin: true,
        loginMessage: message || "Debes iniciar sesión para continuar",
        redirectTo: redirect || `/t/${shopName}/carrito`,
      });

      // Limpiar los parámetros de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("showLogin");
      url.searchParams.delete("message");
      url.searchParams.delete("redirectTo");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, shopName, user]);

  return (
    <div className="bg-background">
      {/* Banner - compact 16/9 aspect ratio */}
      <div className="relative">
        <div className="relative overflow-hidden">
          <Image
            src={store?.banner || logoApp}
            alt={store?.name || "Store"}
            width={800}
            height={450}
            className="w-full aspect-[16/9] object-cover"
            priority
            onError={() => {
              dispatchStore({
                type: "Add",
                payload: {
                  ...store,
                  banner: "",
                },
              });
            }}
          />
          {/* Gradient overlay for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>

      {/* Info card - overlapping the banner */}
      <div className="px-4 -mt-10 relative z-10 pb-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          {/* Ratings and currency */}
          <Link
            href={`/t/${store.sitioweb}/about/ratings`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">
              {store?.comentTienda.promedio.toFixed(1)}
            </span>
            <span>({store?.comentTienda.total})</span>
            <span className="text-border">|</span>
            <span>
              {store.moneda.find((m) => m.defecto)?.nombre || ""}
            </span>
          </Link>

          {/* Location */}
          <Link
            href={`/t/${store?.sitioweb}/about#ubicacion`}
            className="flex items-center gap-1.5 text-muted-foreground mt-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm">
              {store?.municipio}, {store?.Provincia}
            </span>
          </Link>

          {/* Description */}
          {store?.parrrafo && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mt-2">
              {store.parrrafo}
            </p>
          )}

          {/* Delivery options */}
          {(store.domicilio || store.local) && (
            <div className="flex gap-2 mt-3">
              {store.domicilio && (
                <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 flex-1">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    Delivery
                  </span>
                </div>
              )}
              {store.local && (
                <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2 flex-1">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    Tienda
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Popover de Login */}
      <LoginPopover
        isOpen={loginState.showLogin}
        onClose={() => setLoginState({ ...loginState, showLogin: false })}
        redirectTo={loginState.redirectTo || `/t/${shopName}/carrito`}
        message={loginState.loginMessage}
      />
    </div>
  );
}
