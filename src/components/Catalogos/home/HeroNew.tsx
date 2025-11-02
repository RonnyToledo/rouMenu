"use client";
import React, { useContext, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { useAuth } from "@/context/AppContext";
import { useParams, useSearchParams } from "next/navigation";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { logoApp } from "@/lib/image";
import { Store, Truck } from "lucide-react";

export default function HeroNew({}) {
  const { store } = useContext(MyContext);
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [redirectTo, setRedirectTo] = useState("");

  const shopName = params.shop as string;

  useEffect(() => {
    // Verificar si debe mostrar el login
    const shouldShowLogin = searchParams.get("showLogin") === "true";
    const message = searchParams.get("message");
    const redirect = searchParams.get("redirectTo");

    if (shouldShowLogin && !user) {
      setShowLogin(true);
      setLoginMessage(message || "Debes iniciar sesión para continuar");
      setRedirectTo(redirect || `/t/${shopName}/carrito`);

      // Limpiar los parámetros de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("showLogin");
      url.searchParams.delete("message");
      url.searchParams.delete("redirectTo");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, user, shopName]);

  return (
    <div className="p-3 space-y-3">
      <div className="">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={store?.banner || logoApp}
            alt={store?.name || "Store"}
            width={400}
            height={500}
            className="w-full aspect-square md:aspect-video lg:aspect-[30/10] object-cover"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 -mt-12 relative z-10">
        <div className="bg-slate-100 backdrop-blur-md border border-slate-200 rounded-2xl p-4 lg:p-6 mb-6">
          <div className="flex flex-col  gap-4">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <Link
                  href={`/t/${store.sitioweb}/about/ratings`}
                  className="flex items-start gap-3 mb-3"
                >
                  <Star className="w-4 h-4 fill-current text-slate-700" />
                  <span className="font-medium text-slate-900">
                    {store?.comentTienda.promedio.toFixed(1)}
                  </span>
                  <span>({store?.comentTienda.total} reseñas)</span>
                  <span className="text-slate-300">•</span>
                  <span>
                    $ {store.moneda.find((m) => m.defecto)?.nombre || ""}
                  </span>
                </Link>

                <Link
                  href={`/t/${store?.sitioweb}/about#ubicacion`}
                  className="flex items-center gap-2 text-slate-700 mb-4"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {store?.municipio}, {store?.Provincia}
                  </span>
                </Link>
              </div>

              <p className="text-slate-700 text-sm lg:text-base mb-4 line-clamp-2">
                {store?.parrrafo || "Store?..."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 ">
              {store.domicilio && (
                <div className="flex items-center gap-3 bg-slate-300 rounded-xl p-3 flex-1">
                  <div className="p-2 bg-slate-400 rounded-lg">
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
                <div className="flex items-center gap-3 bg-slate-300 rounded-xl p-3 flex-1">
                  <div className="p-2 bg-slate-400 rounded-lg">
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
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        redirectTo={redirectTo || `/t/${shopName}/carrito`}
        message={loginMessage}
      />
    </div>
  );
}
