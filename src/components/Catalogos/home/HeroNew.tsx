"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Truck, Store as StoreIcon } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { useAuth } from "@/context/AppContext";
import { useParams, useSearchParams } from "next/navigation";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { logoApp } from "@/lib/image";
import { Current } from "@/context/InitialStatus";

export default function HeroNew() {
  const { store, dispatchStore } = useContext(MyContext);
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const effectRan = useRef(false);
  const [loginState, setLoginState] = useState({
    showLogin: false,
    loginMessage: "",
    redirectTo: "",
  });

  const shopName = params.shop as string;

  useEffect(() => {
    if (effectRan.current) return;
    const shouldShowLogin = searchParams.get("showLogin") === "true";
    const message = searchParams.get("message");
    const redirect = searchParams.get("redirectTo");
    if (shouldShowLogin && !user) {
      effectRan.current = true;
      queueMicrotask(() => {
        setLoginState({
          showLogin: true,
          loginMessage: message || "Debes iniciar sesión para continuar",
          redirectTo: redirect || `/t/${shopName}/carrito`,
        });
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("showLogin");
      url.searchParams.delete("message");
      url.searchParams.delete("redirectTo");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, shopName, user]);

  return (
    <div className="bg-background transition-colors duration-300">
      {/* Banner */}
      <div className="relative rounded-b-3xl overflow-hidden aspect-square">
        <Image
          src={store?.banner || logoApp}
          alt={store?.name || "Store"}
          width={400}
          height={400}
          className="w-full h-full object-cover"
          onError={() => {
            dispatchStore({ type: "Add", payload: { ...store, banner: "" } });
          }}
        />
        {/* Overlay gradiente — nombre de la tienda sobre el banner */}
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-12 pointer-events-none">
          <p className="text-white/60 text-[10px] font-medium tracking-widest uppercase mb-0.5">
            {store.tipo}
          </p>
          <h1 className="font-serif text-2xl font-bold text-white leading-tight drop-shadow-sm">
            {store.name}
          </h1>
        </div>
      </div>

      {/* Info card — flota sobre el banner */}
      <div className="px-4 -mt-6 relative z-10 pb-3">
        <div className="bg-background/85 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-sm space-y-2.5">
          {/* Rating + ubicación + moneda */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Link
              href={`/t/${store?.sitioweb}/about#ubicacion`}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">
                {store?.municipio}, {store?.Provincia}
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {store.moneda.find((m: Current) => m.defecto)?.nombre || ""}
              </span>
              <Link
                href={`/t/${store.sitioweb}/about/ratings`}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary border border-border hover:bg-muted transition-colors"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-foreground">
                  {store?.comentTienda.promedio.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({store?.comentTienda.total} reseñas)
                </span>
              </Link>
            </div>
          </div>

          {/* Descripción */}
          {store?.parrrafo && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {store.parrrafo}
            </p>
          )}

          {/* Delivery badges */}
          {(store.domicilio || store.local) && (
            <div className="flex gap-2 flex-wrap">
              {store.domicilio && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/8 border border-primary/15">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground leading-none">
                      Delivery
                    </p>
                    {(store.envios || []).length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                        {(store.envios || []).length} zona
                        {(store.envios || []).length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {store.local && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/8 border border-primary/15">
                  <StoreIcon className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-medium text-foreground">
                    Tienda local
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LoginPopover
        isOpen={loginState.showLogin}
        onClose={() => setLoginState({ ...loginState, showLogin: false })}
        redirectTo={loginState.redirectTo || `/t/${shopName}/carrito`}
        message={loginState.loginMessage}
      />
    </div>
  );
}
