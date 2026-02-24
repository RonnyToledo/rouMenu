"use client";
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Store, Truck } from "lucide-react";
import { MyContext } from "@/context/MyContext";
import { useAuth } from "@/context/AppContext";
import { useParams, useSearchParams } from "next/navigation";
import LoginPopover from "@/components/GeneralComponents/LoginPopover";
import { logoApp } from "@/lib/image";
import { ChevronRight } from "lucide-react";

interface LoginState {
  showLogin: boolean;
  loginMessage: string;
  redirectTo: string;
}

const INITIAL_LOGIN_STATE: LoginState = {
  showLogin: false,
  loginMessage: "",
  redirectTo: "",
};

export default function HeroNew() {
  const { store, dispatchStore } = useContext(MyContext);
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const effectRan = useRef(false);

  const [loginState, setLoginState] = useState<LoginState>(INITIAL_LOGIN_STATE);
  const shopName = params.shop as string;

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const shouldShowLogin = searchParams.get("showLogin") === "true";
    const message = searchParams.get("message");
    const redirect = searchParams.get("redirectTo");

    if (shouldShowLogin && !user) {
      const url = new URL(window.location.href);
      url.searchParams.delete("showLogin");
      url.searchParams.delete("message");
      url.searchParams.delete("redirectTo");
      window.history.replaceState({}, "", url.toString());

      setTimeout(() => {
        setLoginState({
          showLogin: true,
          loginMessage: message || "Debes iniciar sesión para continuar",
          redirectTo: redirect || `/t/${shopName}/carrito`,
        });
      }, 0);
    }
  }, [searchParams, shopName, user]);

  const handleBannerError = useCallback(() => {
    dispatchStore({ type: "Add", payload: { ...store, banner: "" } });
  }, [dispatchStore, store]);

  const handleCloseLogin = useCallback(() => {
    setLoginState((prev) => ({ ...prev, showLogin: false }));
  }, []);

  const monedaDefault = useMemo(
    () => store.moneda.find((m) => m.defecto)?.nombre || "",
    [store.moneda],
  );

  return (
    <div className="space-y-3 bg-slate-50 dark:bg-slate-900">
      <div className="relative rounded-b-2xl overflow-hidden shadow-lg">
        <Image
          src={store?.banner || logoApp}
          alt={store?.name || "Store"}
          width={400}
          height={500}
          className="w-full aspect-square object-cover"
          onError={handleBannerError}
        />
      </div>

      <div className="container  mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-700 rounded-2xl p-5 shadow-2xl shadow-foreground/5">
          <div className="flex flex-col gap-2">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <Link
                  href={`/t/${store.sitioweb}/about/ratings`}
                  className="flex items-center gap-1 text-slate-700 dark:text-slate-300"
                >
                  <Star className="w-4 h-4 fill-current text-primary/90 dark:text-slate-100" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {store?.comentTienda.promedio.toFixed(1)}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    ({store?.comentTienda.total} reseñas)
                  </span>
                </Link>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl py-1 px-3">
                  $ {monedaDefault}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-sm group cursor-pointer">
                  <Link
                    href={`/t/${store?.sitioweb}/about#ubicacion`}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-300 transition-all duration-300 ease-out group-hover:text-pink-600 dark:group-hover:text-pink-400"
                  >
                    <MapPin className="w-4 h-4 transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-px" />
                    <span className="text-sm transition-all duration-300 ease-out group-hover:translate-x-0.5">
                      {store?.municipio}, {store?.Provincia}
                    </span>
                  </Link>
                  <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-500 transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-pink-600 dark:group-hover:text-pink-400" />
                </div>

                <p className="text-slate-700 dark:text-slate-400 text-sm line-clamp-2">
                  {store?.parrrafo || "..."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {store.domicilio && (
                <DeliveryBadge
                  icon={
                    <Truck className="size-7 text-primary/80 dark:text-slate-100" />
                  }
                  label="Delivery"
                />
              )}
              {store.local && (
                <DeliveryBadge
                  icon={
                    <Store className="size-7 text-primary/80 dark:text-slate-100" />
                  }
                  label="Tienda"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <LoginPopover
        isOpen={loginState.showLogin}
        onClose={handleCloseLogin}
        redirectTo={loginState.redirectTo || `/t/${shopName}/carrito`}
        message={loginState.loginMessage}
      />
    </div>
  );
}

function DeliveryBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl p-2 flex-1 shadow-md dark:shadow-slate-800/50 bg-white dark:bg-slate-900">
      <div className="p-1 text-primary/80 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-slate-600 dark:text-slate-400">Entrega</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
        </p>
      </div>
    </div>
  );
}
