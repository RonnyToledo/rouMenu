"use client";
import React, { useState } from "react";

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
import { useRouter } from "next/navigation";
import { NotFoundError } from "@/lib/errors";
import Link from "next/link";

const developers = [
  {
    name: "Ronny Toledo",
    role: "Full Stack Developer",
    email: "ronnytoledo87@gmail.com",
    phone: "+53 52489105",
    github: "RonnyToledo",
    linkedin: "ronny-toledo-705857259",
    website: "roudev.vercel.app",
    specialties: [
      "React",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
      "Next.js",
      "React-Native",
      "Expo",
      "Git",
      "Github",
    ],
    experience: "5+ años",
    availability: "Lun-Vie 9:00-18:00",
  },
];

export default function ContactoPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // validación básica
    if (!form.email || !form.name || !form.message) {
      setStatus({
        type: "error",
        msg: "Por favor completa nombre, email y mensaje.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Error enviando el mensaje");
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });
      setStatus({
        type: "success",
        msg: "Mensaje enviado correctamente. Te contactamos pronto.",
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        setStatus({
          type: "error",
          msg: error.message || "Error del servidor.",
        });
        console.error(`Error específico: ${error.name} - ${error.message}`);
      } else {
        setStatus({ type: "error", msg: "Error del servidor." });
        console.error("Ocurrió un error inesperado:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Header */}
      <header className="border-b dark:border-slate-800 bg-card dark:bg-slate-900">
        <div className="container dark:bg-slate-900 mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-foreground dark:text-slate-100 mb-2">
            Contacto
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-400">
            Conecta con nuestro equipo de desarrolladores especializados en
            tiendas online
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container dark:bg-slate-900 mx-auto px-4 py-12">
        {/* Contact Info Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground dark:text-slate-100 mb-4">
              ¿Listo para crear tu tienda online?
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
              Nuestro equipo de expertos está aquí para ayudarte a transformar
              tu negocio con una tienda online profesional y optimizada.
            </p>
          </div>

          <div className="grid gap-8 mb-8">
            {/* Company Contact */}
            <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary dark:text-blue-400">
                  Información General
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Datos de contacto principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-slate-200">
                      Email Principal
                    </p>
                    <a
                      href="mailto:info@ronnytoledo87@proton.me"
                      className="text-sm text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-blue-400"
                    >
                      ronnytoledo87@proton.me
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-slate-200">Teléfono</p>
                    <a
                      href="tel:+5352489105"
                      className="text-sm text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-blue-400"
                    >
                      +53 52489105
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-slate-200">WhatsApp</p>
                    <a
                      href="https://wa.me/5352489105"
                      className="text-sm text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-blue-400"
                    >
                      +53 52489105
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary dark:text-blue-400" />
                  <div>
                    <p className="font-medium dark:text-slate-200">Ubicación</p>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Moron
                      <br />
                      28013 Ciego de Avila, Cuba
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/5 dark:bg-secondary/10 border-secondary/20 dark:border-secondary/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl dark:text-slate-100">
                  Horarios & Respuesta
                </CardTitle>
                <CardDescription className="dark:text-slate-400">
                  Cuándo y cómo contactarnos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground dark:text-slate-400" />
                  <div>
                    <p className="font-medium dark:text-slate-200">
                      Horario de Atención
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Lunes a Viernes: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-muted-foreground dark:text-slate-400" />
                  <div>
                    <p className="font-medium dark:text-slate-200">
                      Tiempo de Respuesta
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      Email: 24-48 horas | WhatsApp: Inmediato
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <Card className="max-w-2xl mx-auto dark:bg-slate-900 dark:border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl dark:text-slate-100">
                Envíanos un Mensaje
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Completa el formulario y te responderemos lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-slate-200">
                      Nombre Completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={handleChange}
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-slate-200">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-slate-200">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+34 600 000 000"
                      value={form.phone}
                      onChange={handleChange}
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="dark:text-slate-200">
                      Empresa (Opcional)
                    </Label>
                    <Input
                      id="company"
                      placeholder="Tu empresa"
                      value={form.company}
                      onChange={handleChange}
                      className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="dark:text-slate-200">
                    Asunto
                  </Label>
                  <Input
                    id="subject"
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.subject}
                    onChange={handleChange}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="dark:text-slate-200">
                    Mensaje
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Cuéntanos sobre tu proyecto..."
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-400"
                  />
                </div>
                {status && (
                  <div
                    className={
                      status.type === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {status.msg}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full dark:bg-blue-600 dark:hover:bg-blue-700"
                  size="lg"
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Developers Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-slate-100">
            Nuestro Equipo
          </h2>
          <div className="grid gap-8">
            {developers.map((dev, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow dark:bg-slate-900 dark:border-slate-700"
              >
                <CardHeader>
                  <CardTitle className="text-xl dark:text-slate-100">
                    {dev.name}
                  </CardTitle>
                  <CardDescription className="text-primary dark:text-blue-400 font-medium">
                    {dev.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground dark:text-slate-400" />
                      <a
                        href={`mailto:${dev.email}`}
                        className="hover:text-primary dark:hover:text-blue-400 dark:text-slate-300"
                      >
                        {dev.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground dark:text-slate-400" />
                      <a
                        href={`tel:${dev.phone}`}
                        className="hover:text-primary dark:hover:text-blue-400 dark:text-slate-300"
                      >
                        {dev.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className="text-xs dark:border-slate-600 dark:text-slate-300"
                      >
                        {dev.experience}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground dark:text-slate-400" />
                      <span className="text-xs text-muted-foreground dark:text-slate-400">
                        {dev.availability}
                      </span>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Link
                        href={`https://github.com/${dev.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Link
                        href={`https://linkedin.com/in/${dev.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Link
                        href={`https://${dev.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm font-medium mb-2 dark:text-slate-200">
                      Especialidades:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {dev.specialties.map((specialty, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs dark:bg-slate-700 dark:text-slate-200"
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
          <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4 dark:text-slate-100">
                ¿Tienes un proyecto en mente?
              </h3>
              <p className="text-muted-foreground dark:text-slate-400 mb-6 max-w-md mx-auto">
                Contáctanos hoy mismo y descubre cómo podemos ayudarte a crear
                la tienda online perfecta para tu negocio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700"
                  onClick={() =>
                    router.push("mailto:info@ronnytoledo87@gmail.com")
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <a
                    href="https://wa.me/5352489105"
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
