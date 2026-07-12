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
      } else {
        setStatus({ type: "error", msg: "Error del servidor." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-secondary/50">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
            Contacto
          </h1>
          <p className="text-sm text-muted-foreground">
            Conecta con nuestro equipo de desarrolladores especializados en
            tiendas online
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-14">
        {/* Intro */}
        <section>
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              ¿Listo para crear tu tienda online?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Nuestro equipo de expertos está aquí para ayudarte a transformar
              tu negocio con una tienda online profesional y optimizada.
            </p>
          </div>

          <div className="grid gap-6 mb-6">
            {/* Company contact card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-base font-semibold text-primary">
                  Información General
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Datos de contacto principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: Mail,
                    label: "Email Principal",
                    value: "ronnytoledo87@proton.me",
                    href: "mailto:ronnytoledo87@proton.me",
                  },
                  {
                    icon: Phone,
                    label: "Teléfono",
                    value: "+53 52489105",
                    href: "tel:+5352489105",
                  },
                  {
                    icon: MessageCircle,
                    label: "WhatsApp",
                    value: "+53 52489105",
                    href: "https://wa.me/5352489105",
                  },
                  {
                    icon: MapPin,
                    label: "Ubicación",
                    value: "Cuba",
                    href: undefined,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact form */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-base font-semibold text-foreground">
                  Envíanos un mensaje
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Cuéntanos sobre tu proyecto y te responderemos en menos de 24
                  horas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs text-foreground">
                        Nombre *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={form.name}
                        onChange={handleChange}
                        className="border-border bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email"
                        className="text-xs text-foreground"
                      >
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={form.email}
                        onChange={handleChange}
                        className="border-border bg-background text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="phone"
                        className="text-xs text-foreground"
                      >
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+53 5..."
                        value={form.phone}
                        onChange={handleChange}
                        className="border-border bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="company"
                        className="text-xs text-foreground"
                      >
                        Empresa
                      </Label>
                      <Input
                        id="company"
                        placeholder="Tu empresa"
                        value={form.company}
                        onChange={handleChange}
                        className="border-border bg-background text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="subject"
                      className="text-xs text-foreground"
                    >
                      Asunto
                    </Label>
                    <Input
                      id="subject"
                      placeholder="¿En qué podemos ayudarte?"
                      value={form.subject}
                      onChange={handleChange}
                      className="border-border bg-background text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="message"
                      className="text-xs text-foreground"
                    >
                      Mensaje *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Cuéntanos sobre tu proyecto..."
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className="border-border bg-background text-sm resize-none placeholder:text-muted-foreground"
                    />
                  </div>
                  {status && (
                    <p
                      className={`text-xs ${status.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
                    >
                      {status.msg}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-full font-semibold gap-2 active:scale-[0.98] transition-all"
                    disabled={loading}
                  >
                    <Send className="h-4 w-4" />
                    {loading ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Developers */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-center text-foreground mb-8">
            Nuestro Equipo
          </h2>
          <div className="grid gap-4">
            {developers.map((dev, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">
                    {dev.name}
                  </CardTitle>
                  <CardDescription className="text-primary text-xs font-medium">
                    {dev.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={`mailto:${dev.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {dev.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={`tel:${dev.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {dev.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs rounded-full border-border"
                      >
                        {dev.experience}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{dev.availability}</span>
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="flex gap-2">
                    {[
                      {
                        href: `https://github.com/${dev.github}`,
                        icon: Github,
                      },
                      {
                        href: `https://linkedin.com/in/${dev.linkedin}`,
                        icon: Linkedin,
                      },
                      { href: `https://${dev.website}`, icon: Globe },
                    ].map((link, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="icon"
                        asChild
                        className="w-8 h-8 rounded-full border-border"
                      >
                        <Link
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <link.icon className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    ))}
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1.5">
                      Especialidades
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {dev.specialties.map((s, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-[10px] rounded-full border border-border px-2"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-10 text-center space-y-4">
              <h3 className="font-serif text-xl font-bold text-foreground">
                ¿Tienes un proyecto en mente?
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Contáctanos hoy mismo y descubre cómo podemos ayudarte a crear
                la tienda online perfecta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="rounded-full gap-2 active:scale-[0.98] transition-all"
                  onClick={() => router.push("mailto:ronnytoledo87@gmail.com")}
                >
                  <Mail className="h-4 w-4" />
                  Enviar Mensaje
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full gap-2 border-border active:scale-[0.98] transition-all"
                >
                  <a
                    href="https://wa.me/5352489105"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
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
