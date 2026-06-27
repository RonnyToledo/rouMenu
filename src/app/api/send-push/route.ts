import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import webpush, { PushSubscription as WebPushSubscription } from "web-push";

// Configurar VAPID una sola vez al cargar el módulo
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY; // ⚠️ nunca expongas la clave privada con NEXT_PUBLIC_

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:noreply@roumenu.vercel.app",
    publicKey,
    privateKey,
  );
}

interface SendPushRequest {
  userId?: string;
  title: string;
  body: string;
  link?: string;
  icon?: string;
  badge?: string;
}

interface PushSubscriptionRow {
  subscription: WebPushSubscription;
}

export async function POST(request: NextRequest) {
  try {
    if (!webpush) {
      return NextResponse.json(
        {
          error:
            "Web Push no configurado. Instala web-push: npm install web-push",
        },
        { status: 501 },
      );
    }

    const data: SendPushRequest = await request.json();
    const { userId, title, body, link, icon, badge } = data;

    // Validar campos
    if (!title || !body) {
      return NextResponse.json(
        { error: "title y body son requeridos" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Determinar a quién enviar la notificación
    let query = supabase.from("push_subscriptions").select("subscription");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: subscriptions, error } = await query;

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: "No hay suscripciones para enviar", count: 0 },
        { status: 200 },
      );
    }

    // Preparar payload
    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-192x192.png",
      badge: badge || "/badge-72x72.png",
      data: {
        link: link || "/",
      },
    });

    // Enviar a todas las suscripciones
    const results = await Promise.allSettled(
      subscriptions.map((sub: PushSubscriptionRow) =>
        webpush
          .sendNotification(sub.subscription, payload)
          .catch((err: webpush.WebPushError) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.warn("⚠️ Suscripción inválida, eliminando...");
              // no await intencional — fire and forget en cleanup
              void supabase
                .from("push_subscriptions")
                .delete()
                .eq("subscription->>endpoint", sub.subscription.endpoint);
            }
            throw err;
          }),
      ),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.info(
      `✓ Notificaciones enviadas: ${succeeded} exitosas, ${failed} fallidas`,
    );

    return NextResponse.json(
      {
        success: true,
        message: `Notificación enviada a ${succeeded} usuarios`,
        stats: { sent: succeeded, failed, total: subscriptions.length },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en send-push:", error);
    return NextResponse.json(
      { error: "Error enviando notificaciones" },
      { status: 500 },
    );
  }
}
