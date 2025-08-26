import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";

export default function ContactoPage() {
  const developers = [
    {
      name: "Ana García",
      role: "Full Stack Developer",
      email: "ana.garcia@dev.com",
      phone: "+34 612 345 678",
      github: "anagarcia-dev",
      linkedin: "ana-garcia-fullstack",
      website: "anagarcia.dev",
      specialties: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      experience: "5+ años",
      availability: "Lun-Vie 9:00-18:00",
    },
    {
      name: "Carlos Rodríguez",
      role: "Frontend Specialist",
      email: "carlos.rodriguez@dev.com",
      phone: "+34 687 654 321",
      github: "carlosrod-ui",
      linkedin: "carlos-rodriguez-frontend",
      website: "carlosrodriguez.dev",
      specialties: ["Next.js", "Tailwind CSS", "UI/UX", "E-commerce"],
      experience: "4+ años",
      availability: "Lun-Vie 10:00-19:00",
    },
    {
      name: "María López",
      role: "Backend Engineer",
      email: "maria.lopez@dev.com",
      phone: "+34 698 123 456",
      github: "marialopez-backend",
      linkedin: "maria-lopez-backend",
      website: "marialopez.dev",
      specialties: ["Python", "Django", "AWS", "Database Design"],
      experience: "6+ años",
      availability: "Lun-Vie 8:00-17:00",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Contacto</h1>
          <p className="text-lg text-muted-foreground">
            Conecta con nuestro equipo de desarrolladores especializados en
            tiendas online
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Contact Info Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para crear tu tienda online?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestro equipo de expertos está aquí para ayudarte a transformar
              tu negocio con una tienda online profesional y optimizada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Company Contact */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">
                  Información General
                </CardTitle>
                <CardDescription>Datos de contacto principales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Principal</p>
                    <a
                      href="mailto:info@tiendaonline-dev.com"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      info@tiendaonline-dev.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <a
                      href="tel:+34900123456"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      +34 900 123 456
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a
                      href="https://wa.me/34900123456"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      +34 900 123 456
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">
                      Calle Gran Vía 28, 4º Piso
                      <br />
                      28013 Madrid, España
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 border-secondary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Horarios & Respuesta</CardTitle>
                <CardDescription>Cuándo y cómo contactarnos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Horario de Atención</p>
                    <p className="text-sm text-muted-foreground">
                      Lunes a Viernes: 9:00 - 18:00
                      <br />
                      Sábados: 10:00 - 14:00
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Tiempo de Respuesta</p>
                    <p className="text-sm text-muted-foreground">
                      Email: 2-4 horas laborables
                      <br />
                      WhatsApp: 30 minutos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="font-medium">Consultas Urgentes</p>
                    <p className="text-sm text-muted-foreground">
                      Disponible 24/7 para clientes
                      <br />
                      con proyectos en producción
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Envíanos un Mensaje</CardTitle>
              <CardDescription>
                Cuéntanos sobre tu proyecto y te responderemos en menos de 24
                horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" placeholder="+34 600 000 000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa (Opcional)</Label>
                    <Input id="company" placeholder="Tu empresa" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto</Label>
                  <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Cuéntanos sobre tu proyecto, presupuesto estimado, fechas importantes, etc."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Developers Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">
            Nuestro Equipo
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((dev, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{dev.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {dev.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${dev.email}`}
                        className="hover:text-primary"
                      >
                        {dev.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${dev.phone}`}
                        className="hover:text-primary"
                      >
                        {dev.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {dev.experience}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {dev.availability}
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://github.com/${dev.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://linkedin.com/in/${dev.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://${dev.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm font-medium mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {dev.specialties.map((specialty, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">
                ¿Tienes un proyecto en mente?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Contáctanos hoy mismo y descubre cómo podemos ayudarte a crear
                la tienda online perfecta para tu negocio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href="https://wa.me/34900123456"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
