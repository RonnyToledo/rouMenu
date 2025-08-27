import EmailTemplate from "@/components/emial/Emailtemplate";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API);

export async function POST(request: Request) {
  try {
    const { name, email, phone, company, subject, message } =
      await request.json();
    if (!email || !message || !name) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["ronnytoledo87@gmail.com"],
      subject: `[Contacto web] ${subject || "Nuevo mensaje"}`,
      text: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nEmpresa: ${company}\n\nMensaje:\n${message}`,
      react: (
        <EmailTemplate
          name={name}
          email={email}
          company={company}
          phone={phone}
          message={message}
        />
      ),
    });

    if (error) {
      console.error("error", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("catch", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
