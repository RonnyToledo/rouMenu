import { Button } from "@/components/ui/button";
import { Plus, Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function ExplorationFooter() {
  const now = new Date();
  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
            Créate un catálogo digital en minutos.
          </h2>
          <Button
            size="lg"
            asChild
            className="rounded-full gap-2 active:scale-[0.98] transition-all shadow-sm"
          >
            <Link href="https://rouadmin.vercel.app/createAccount">
              <Plus className="w-4 h-4" />
              Regístrate
            </Link>
          </Button>
        </div>

        <Separator className="my-4 bg-border" />

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">
              RouMenu
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Herramienta para la creación y diseño de catálogos online para
                  venta de productos y servicios
                </Link>
              </div>
              <div>
                <Link
                  href="https://rouadmin.vercel.app/createAccount"
                  className="hover:text-foreground transition-colors"
                >
                  Registra tu negocio ahora en nuestro catálogo
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">
              Guía para potenciar tu negocio
            </h4>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div>
                <Link
                  href="/services"
                  className="hover:text-foreground transition-colors"
                >
                  Preguntas frecuentes sobre nuestro servicio
                </Link>
              </div>
              <div>
                <Link
                  href="/info"
                  className="hover:text-foreground transition-colors"
                >
                  Guía para usar nuestra plataforma
                </Link>
              </div>
              <div>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {now.getFullYear()} RouDev — Todos los derechos reservados.
          </p>
          <Link href="https://www.instagram.com/_roudev">
            <Instagram className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
