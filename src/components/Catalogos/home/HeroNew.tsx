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
    <div className=" space-y-3 bg-slate-50 ">
      <div className="">
        <div className="relative rounded-b-2xl overflow-hidden shadow-lg">
          <Image
            src={store?.banner || logoApp}
            alt={store?.name || "Store"}
            width={400}
            height={500}
            className="w-full aspect-square  object-cover"
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
        </div>
      </div>

      <div className="container mx-auto  px-6 -mt-12 relative z-10">
        <div className="bg-primary/5 backdrop-blur-3xl border border-primary/20 rounded-2xl p-3">
          <div className="flex flex-col  gap-2">
            <div className="flex-1 gap-1">
              <div className="flex flex-col gap-1">
                <Link
                  href={`/t/${store.sitioweb}/about/ratings`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Star className="w-4 h-4 fill-current text-slate-700" />
                  <span className="font-medium text-slate-900 ">
                    {store?.comentTienda.promedio.toFixed(1)}
                  </span>
                  <span>({store?.comentTienda.total} reseñas)</span>
                  <span className="text-slate-700">•</span>
                  <span>
                    $ {store.moneda.find((m) => m.defecto)?.nombre || ""}
                  </span>
                </Link>

                <Link
                  href={`/t/${store?.sitioweb}/about#ubicacion`}
                  className="flex items-center gap-2 text-slate-700 "
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {store?.municipio}, {store?.Provincia}
                  </span>
                </Link>
              </div>

              <p className="text-slate-700 text-sm line-clamp-2">
                {store?.parrrafo || "..."}
              </p>
            </div>

            <div className="flex flex-row gap-1 ">
              {store.domicilio && (
                <div className="flex items-center gap-2 bg-primary/15 rounded-xl p-2 flex-1">
                  <div className="p-2 bg-primary/15 rounded-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Entrega</p>
                    <p className="text-sm font-medium text-slate-800">
                      Delivery
                    </p>
                  </div>
                </div>
              )}

              {store.local && (
                <div className="flex items-center gap-2 bg-primary/15 rounded-xl p-2 flex-1">
                  <div className="p-2 bg-primary/15 rounded-lg">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Entrega</p>
                    <p className="text-sm font-medium text-slate-800">Tienda</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
