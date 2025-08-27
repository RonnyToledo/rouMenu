import { Button } from "@/components/ui/button";
import { Plus, Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
export function ExplorationFooter() {
  const now = new Date();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Créate un catálogo digital en minutos.
          </h2>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white px-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
          >
            <Link href={"https://rh-admin.vercel.app/createAccount"}>
              <Plus size={16} className="mr-2 " />
              Regístrate
            </Link>
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1  gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2 uppercase">
                RouMenu
              </h3>
              <div className="space-y-3 text-gray-600">
                <div>
                  <Link href="/">
                    Herramienta para la creacion y diseño de catalogos onlines
                    para venta de productos y servicios
                  </Link>
                </div>
                <div>
                  <Link href={"https://rh-admin.vercel.app/createAccount"}>
                    Registra tu negocio ahora en nuestro catálogo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">
                Guía para potenciar tu negocio
              </h4>
              <div className="space-y-2">
                <div className=" text-gray-600 text-sm">
                  <Link href={"/services"}>
                    Preguntas frecuentes nuestro servicio?
                  </Link>
                </div>
                <div className=" text-gray-600 text-sm">
                  <Link href={"/info"}>Guia para usar nuestra plataforma?</Link>
                </div>
                <div className=" text-gray-600 text-sm">
                  <Link href={"/contact"}>Contactanos</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {now.getFullYear()} RouDev - Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link href={"https://www.instagram.com/_roudev"}>
                <Instagram
                  size={20}
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
