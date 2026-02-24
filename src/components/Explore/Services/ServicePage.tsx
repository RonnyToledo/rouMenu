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
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-green-300/20 via-background to-green-300/20 dark:from-green-900/20 dark:via-slate-950 dark:to-green-900/20 border-b dark:border-slate-800">
        <div className="container dark:bg-slate-900 mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-green-900/10 dark:bg-green-900/30 text-green-900 dark:text-green-400 border-primary/20 dark:border-green-700">
              Servicios de E-commerce
            </Badge>
            <h1 className="text-5xl font-bold text-foreground dark:text-slate-100 mb-6">
              Transforma tu Negocio con una
              <span className="text-green-900 dark:text-green-400">
                {" "}
                Tienda Online
              </span>
            </h1>
            <p className="text-xl text-muted-foreground dark:text-slate-400 mb-8 leading-relaxed">
              Descubre los beneficios de tener presencia digital y cómo una
              tienda online profesional puede revolucionar tu negocio y
              multiplicar tus ventas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push(`https://wa.me/5352489105`)}
                size="lg"
                className="bg-green-900 hover:bg-green-800/90 dark:bg-green-700 dark:hover:bg-green-600"
              >
                Solicitar Consulta Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push(`/`)}
                size="lg"
                variant="outline"
                className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Ver Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container dark:bg-slate-900 mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-4">
              ¿Por qué necesitas una Tienda Online?
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
              Los beneficios de digitalizar tu negocio van más allá de las
              ventas online
            </p>
          </div>

          <div className="grid gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow dark:bg-slate-900 dark:border-slate-700"
              >
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-green-900/10 dark:bg-green-900/30 rounded-full w-fit">
                    <benefit.icon className="h-8 w-8 text-green-900 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl dark:text-slate-100">
                    {benefit.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="mx-auto dark:bg-slate-700 dark:text-slate-200"
                  >
                    {benefit.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-slate-400">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 dark:bg-slate-900/50">
        <div className="container dark:bg-slate-900 mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-4">
              Características de Nuestras Tiendas Online
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
              Tecnología de vanguardia para maximizar tus resultados
            </p>
          </div>

          <div className="grid gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow dark:bg-slate-900 dark:border-slate-700"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/10 dark:bg-green-900/30 rounded-lg">
                      <feature.icon className="h-6 w-6 text-green-900 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg dark:text-slate-100">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16">
        <div className="container dark:bg-slate-900 mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-4">
              Nuestro Proceso de Implementación
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
              Un enfoque estructurado para garantizar el éxito de tu proyecto
            </p>
          </div>

          <div className="grid gap-8">
            {process.map((step, index) => (
              <button
                key={index}
                className="p-0 m-0"
                onClick={() => ScrollTo(`process_${index}`)}
                id={`process_${index}`}
              >
                <Card className="relative hover:shadow-lg transition-shadow dark:bg-slate-900 dark:border-slate-700">
                  <CardHeader>
                    <div className="text-4xl font-bold text-green-900/20 dark:text-green-400/20 mb-2">
                      {step.step}
                    </div>
                    <CardTitle className="text-xl dark:text-slate-100">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground dark:text-slate-400">
                      {step.description}
                    </p>
                  </CardContent>
                  {index < process.length - 1 && (
                    <div className="hidden absolute right-4 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-green-900/30 dark:text-green-400/30" />
                    </div>
                  )}
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-900/5 dark:bg-green-900/10">
        <div className="container dark:bg-slate-900 mx-auto px-4">
          <Card className="bg-linear-to-r from-green-700 via-green-400 to-green-700 dark:from-green-800 dark:via-green-600 dark:to-green-800 text-green-900-foreground dark:bg-slate-900 dark:border-slate-700">
            <CardContent className="py-16 text-center">
              <h3 className="text-3xl font-bold mb-4 dark:text-slate-100">
                ¿Listo para Impulsar tu Negocio?
              </h3>
              <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 dark:text-slate-300">
                No esperes más. Cada día sin una tienda online es una
                oportunidad perdida. Contacta con nosotros y descubre cómo
                podemos transformar tu negocio.
              </p>
              <div className="flex flex-col gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-green-900 hover:bg-white/90 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  onClick={() => router.push(`https://wa.me/5352489105`)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Consulta Gratuita
                </Button>
                <Button
                  onClick={() => router.push(`/t/moondust`)}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
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
