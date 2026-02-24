import { Button } from "@/components/ui/button";
import { Plus, Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function ExplorationFooter() {
  const now = new Date();
  return (
    <footer className="bg-linear-to-b from-slate-50 to-slate-300 dark:from-slate-800 dark:to-slate-950 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Créate un catálogo digital en minutos.
          </h2>
          <Button
            size="lg"
            asChild
            className="bg-linear-to-r from-slate-800 to-slate-700 dark:from-slate-600 dark:to-slate-500 hover:from-slate-700 hover:to-slate-600 dark:hover:from-slate-500 dark:hover:to-slate-400 text-white px-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
          >
            <Link href={"https://rouadmin.vercel.app/createAccount"}>
              <Plus size={16} className="mr-2 " />
              Regístrate
            </Link>
          </Button>
        </div>
        <Separator className="my-4 dark:bg-slate-700" />
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4 flex items-center gap-2 uppercase">
                RouMenu
              </h3>
              <div className="space-y-3 text-slate-600 dark:text-slate-400">
                <div>
                  <Link
                    href="/"
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Herramienta para la creacion y diseño de catalogos onlines
                    para venta de productos y servicios
                  </Link>
                </div>
                <div>
                  <Link
                    href={"https://rouadmin.vercel.app/createAccount"}
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Registra tu negocio ahora en nuestro catálogo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Guía para potenciar tu negocio
              </h4>
              <div className="space-y-2">
                <div className="text-slate-600 dark:text-slate-400 text-sm">
                  <Link
                    href={"/services"}
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Preguntas frecuentes nuestro servicio?
                  </Link>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">
                  <Link
                    href={"/info"}
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Guia para usar nuestra plataforma?
                  </Link>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">
                  <Link
                    href={"/contact"}
                    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    Contactanos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col justify-between items-center gap-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © {now.getFullYear()} RouDev - Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href={"https://www.instagram.com/_roudev"}>
                <Instagram
                  size={20}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
