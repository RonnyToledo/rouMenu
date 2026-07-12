"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  TrendingUp,
  Shield,
  Smartphone,
  Search,
  CreditCard,
  BarChart3,
  Users,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollTo } from "@/functions/ScrollTo";

export default function ServiciosPage() {
  const router = useRouter();
  const benefits = [
    {
      icon: TrendingUp,
      title: "Incrementa tus Ventas",
      description:
        "Alcanza a más clientes las 24 horas del día, los 7 días de la semana. Una tienda online nunca cierra.",
      stats: "Hasta 300% más ventas",
    },
    {
      icon: Globe,
      title: "Alcance Global",
      description:
        "Expande tu negocio más allá de las fronteras locales y vende a clientes de todo el mundo.",
      stats: "Mercado ilimitado",
    },
    {
      icon: BarChart3,
      title: "Análisis Detallados",
      description:
        "Obtén insights valiosos sobre el comportamiento de tus clientes y optimiza tu estrategia de ventas.",
      stats: "Datos en tiempo real",
    },
    {
      icon: Users,
      title: "Mejor Experiencia del Cliente",
      description:
        "Ofrece una experiencia de compra fluida y personalizada que fideliza a tus clientes.",
      stats: "95% satisfacción",
    },
  ];
  const features = [
    {
      icon: ShoppingCart,
      title: "Carrito de Compras Inteligente",
      description:
        "Sistema avanzado que reduce el abandono de carritos y aumenta las conversiones.",
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description:
        "Integración con múltiples pasarelas de pago y máxima seguridad en las transacciones.",
    },
    {
      icon: Smartphone,
      title: "Diseño Responsive",
      description:
        "Tu tienda se ve perfecta en cualquier dispositivo: móvil, tablet o desktop.",
    },
    {
      icon: Search,
      title: "SEO Optimizado",
      description:
        "Posicionamiento en buscadores para que tus clientes te encuentren fácilmente.",
    },
    {
      icon: Shield,
      title: "Seguridad Avanzada",
      description:
        "Protección SSL, copias de seguridad automáticas y máxima seguridad de datos.",
    },
    {
      icon: Zap,
      title: "Carga Ultra Rápida",
      description:
        "Optimización de velocidad para una experiencia de usuario excepcional.",
    },
  ];
  const process = [
    {
      step: "01",
      title: "Análisis y Planificación",
      description:
        "Estudiamos tu negocio y definimos la estrategia perfecta para tu tienda online.",
    },
    {
      step: "02",
      title: "Diseño Personalizado",
      description:
        "Creamos un diseño único que refleje la identidad de tu marca y atraiga a tus clientes.",
    },
    {
      step: "03",
      title: "Desarrollo y Testing",
      description:
        "Desarrollamos tu tienda con las últimas tecnologías y realizamos pruebas exhaustivas.",
    },
    {
      step: "04",
      title: "Lanzamiento y Soporte",
      description:
        "Lanzamos tu tienda y te acompañamos con soporte continuo y actualizaciones.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-14">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 rounded-full">
              Servicios de E-commerce
            </Badge>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
              Transforma tu Negocio con una{" "}
              <span className="text-primary">Tienda Online</span>
            </h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Descubre los beneficios de tener presencia digital y cómo una
              tienda online profesional puede revolucionar tu negocio y
              multiplicar tus ventas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push("https://wa.me/5352489105")}
                size="lg"
                className="rounded-full gap-2 active:scale-[0.98] transition-all"
              >
                Solicitar Consulta Gratuita
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push("/")}
                size="lg"
                variant="outline"
                className="rounded-full border-border active:scale-[0.98] transition-all"
              >
                Ver Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
              ¿Por qué necesitas una Tienda Online?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los beneficios de digitalizar tu negocio van más allá de las
              ventas online
            </p>
          </div>
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base text-center text-foreground">
                    {benefit.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="mx-auto rounded-full text-xs border border-border"
                  >
                    {benefit.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
              Características de Nuestras Tiendas Online
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tecnología de vanguardia para maximizar tus resultados
            </p>
          </div>
          <div className="grid gap-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm text-foreground">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
              Nuestro Proceso de Implementación
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un enfoque estructurado para garantizar el éxito de tu proyecto
            </p>
          </div>
          <div className="grid gap-3">
            {process.map((step, index) => (
              <button
                key={index}
                className="p-0 m-0 text-left"
                onClick={() => ScrollTo(`process_${index}`)}
                id={`process_${index}`}
              >
                <Card className="border-border hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="text-3xl font-bold text-primary/20 mb-1">
                      {step.step}
                    </div>
                    <CardTitle className="text-sm text-foreground">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary/5">
        <div className="container mx-auto px-4">
          <Card className="border-primary/20 bg-primary/8">
            <CardContent className="py-12 text-center space-y-4">
              <h3 className="font-serif text-2xl font-bold text-foreground">
                ¿Listo para Impulsar tu Negocio?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                No esperes más. Cada día sin una tienda online es una
                oportunidad perdida. Contacta con nosotros y descubre cómo
                podemos transformar tu negocio.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button
                  size="lg"
                  className="rounded-full gap-2 active:scale-[0.98] transition-all"
                  onClick={() => router.push("https://wa.me/5352489105")}
                >
                  <CheckCircle className="h-4 w-4" />
                  Consulta Gratuita
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border active:scale-[0.98] transition-all"
                  onClick={() => router.push("/t/moondust")}
                >
                  Ver Casos de Éxito
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
