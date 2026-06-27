/**
 * Script de Debugging Automático - Web Push Notifications
 *
 * Uso:
 * 1. Abre DevTools (F12)
 * 2. Ve a Console
 * 3. Copia TODO este script
 * 4. Pégalo en la consola y presiona Enter
 * 5. Sigue las instrucciones
 */

(async function debugWebPush() {
  console.clear();
  console.log(
    "%c🔍 INICIANDO DEBUGGING WEB PUSH",
    "font-size: 16px; font-weight: bold; color: #0066cc;",
  );
  console.log("%c" + "=".repeat(50), "color: #0066cc;");

  const results = {
    tests: [],
    timestamp: new Date().toISOString(),
  };

  // Test 1: Verificar soporte del navegador
  console.log(
    "\n%c✓ Test 1: Soporte del Navegador",
    "font-weight: bold; color: #333;",
  );
  const support = {
    serviceWorker: "serviceWorker" in navigator,
    pushManager: "PushManager" in window,
    notification: "Notification" in window,
  };

  results.tests.push({
    name: "Browser Support",
    passed: Object.values(support).every((v) => v),
    details: support,
  });

  console.table(support);
  if (!Object.values(support).every((v) => v)) {
    console.error(
      "%c❌ ALERTA: El navegador no soporta Web Push",
      "color: red; font-weight: bold;",
    );
    return;
  }

  // Test 2: Service Worker Registrado
  console.log(
    "\n%c✓ Test 2: Service Worker",
    "font-weight: bold; color: #333;",
  );
  let swRegistration = null;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`Encontrados ${registrations.length} Service Worker(s)`);
    registrations.forEach((reg, idx) => {
      console.log(
        `  [${idx}] Scope: ${reg.scope}, Estado: ${reg.active ? "✓ Activo" : "⚠️ Inactivo"}`,
      );
    });

    swRegistration = await navigator.serviceWorker.ready;
    console.log("%c✓ Service Worker está listo", "color: green;");
    results.tests.push({
      name: "Service Worker",
      passed: true,
      details: { active: !!swRegistration.active, scope: swRegistration.scope },
    });
  } catch (error) {
    console.error(
      "%c❌ Error con Service Worker:",
      "color: red;",
      error.message,
    );
    results.tests.push({
      name: "Service Worker",
      passed: false,
      error: error.message,
    });
  }

  // Test 3: Permiso de Notificaciones
  console.log(
    "\n%c✓ Test 3: Permiso de Notificaciones",
    "font-weight: bold; color: #333;",
  );
  const permission = Notification.permission;
  console.log(
    `Estado del permiso: %c${permission.toUpperCase()}`,
    permission === "granted"
      ? "color: green; font-weight: bold;"
      : permission === "denied"
        ? "color: red; font-weight: bold;"
        : "color: orange; font-weight: bold;",
  );

  results.tests.push({
    name: "Notification Permission",
    passed: permission === "granted",
    details: { permission },
  });

  if (permission === "denied") {
    console.warn(
      "%c⚠️ AVISO: Las notificaciones están bloqueadas por el usuario",
      "color: orange; font-weight: bold;",
    );
    console.log("Para desbloquear:");
    console.log(
      "  1. Chrome/Edge: DevTools → Application → Manifest → Clear site data",
    );
    console.log(
      "  2. Firefox: Preferences → Privacy → Permissions → Busca tu dominio → Delete",
    );
  } else if (permission === "default") {
    console.warn("%c⚠️ AVISO: Aún no se pidió permiso", "color: orange;");
  }

  // Test 4: Suscripción Push
  console.log(
    "\n%c✓ Test 4: Suscripción Push",
    "font-weight: bold; color: #333;",
  );
  let subscription = null;
  try {
    if (swRegistration) {
      subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        console.log(
          "%c✓ Usuario SUSCRITO a Push",
          "color: green; font-weight: bold;",
        );
        console.log(
          "Endpoint:",
          subscription.endpoint.substring(0, 50) + "...",
        );
        console.log("Keys disponibles:", !!subscription.keys);
        results.tests.push({
          name: "Push Subscription",
          passed: true,
          details: {
            endpoint: subscription.endpoint,
            hasKeys: !!subscription.keys,
          },
        });
      } else {
        console.warn(
          "%c⚠️ Usuario NO suscrito a Push",
          "color: orange; font-weight: bold;",
        );
        results.tests.push({
          name: "Push Subscription",
          passed: false,
          details: { subscribed: false },
        });
      }
    }
  } catch (error) {
    console.error(
      "%c❌ Error obteniendo suscripción:",
      "color: red;",
      error.message,
    );
    results.tests.push({
      name: "Push Subscription",
      passed: false,
      error: error.message,
    });
  }

  // Test 5: VAPID Keys
  console.log("\n%c✓ Test 5: VAPID Keys", "font-weight: bold; color: #333;");
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const hasVapid = !!vapidPublic;

  if (hasVapid) {
    console.log("%c✓ VAPID Public Key configurada", "color: green;");
    console.log("Key:", vapidPublic.substring(0, 30) + "...");
  } else {
    console.error(
      "%c❌ VAPID Public Key NO configurada",
      "color: red; font-weight: bold;",
    );
    console.log("Debes agregar a .env.local:");
    console.log("  NEXT_PUBLIC_VAPID_PUBLIC_KEY=...");
    console.log("  VAPID_PRIVATE_KEY=...");
  }

  results.tests.push({
    name: "VAPID Keys",
    passed: hasVapid,
    details: { configured: hasVapid },
  });

  // Test 6: Verificar BD (Supabase)
  console.log(
    "\n%c✓ Test 6: Verificación en BD",
    "font-weight: bold; color: #333;",
  );
  try {
    const response = await fetch("/api/user-subscriptions", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 401) {
      console.warn("%c⚠️ No autenticado (401)", "color: orange;");
      results.tests.push({
        name: "Database Check",
        passed: false,
        details: { authenticated: false },
      });
    } else if (response.ok) {
      const data = await response.json();
      console.log("%c✓ Suscripciones en BD:", "color: green;", data);
      results.tests.push({
        name: "Database Check",
        passed: true,
        details: data,
      });
    } else {
      console.error("%c❌ Error en BD:", "color: red;", response.status);
      results.tests.push({
        name: "Database Check",
        passed: false,
        error: `HTTP ${response.status}`,
      });
    }
  } catch (error) {
    console.log("ℹ️ No se pudo verificar BD (endpoint no disponible)");
    results.tests.push({
      name: "Database Check",
      passed: null,
      error: "Endpoint not available",
    });
  }

  // Test 7: Intentar enviar una notificación de prueba
  console.log(
    "\n%c✓ Test 7: Prueba de Notificación",
    "font-weight: bold; color: #333;",
  );
  if (permission === "granted" && subscription) {
    console.log("Intentando enviar notificación de prueba...");
    try {
      const response = await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "🧪 Notificación de Prueba",
          body: "Si ves esto, ¡el sistema funciona!",
          link: "/",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("%c✓ Notificación enviada:", "color: green;", data);
        console.log("👁️ Deberías ver una notificación en tu pantalla");
        results.tests.push({
          name: "Push Test",
          passed: true,
          details: data,
        });
      } else {
        console.error("%c❌ Error enviando:", "color: red;", data);
        results.tests.push({
          name: "Push Test",
          passed: false,
          error: data.error,
        });
      }
    } catch (error) {
      console.error("%c❌ Error:", "color: red;", error.message);
      results.tests.push({
        name: "Push Test",
        passed: false,
        error: error.message,
      });
    }
  } else {
    console.warn(
      "%c⚠️ No se puede probar notificación: sin permiso o sin suscripción",
      "color: orange;",
    );
  }

  // Resumen Final
  console.log("\n%c" + "=".repeat(50), "color: #0066cc;");
  console.log(
    "%c📊 RESUMEN DE TESTS",
    "font-size: 14px; font-weight: bold; color: #0066cc;",
  );

  const passed = results.tests.filter((t) => t.passed === true).length;
  const failed = results.tests.filter((t) => t.passed === false).length;
  const skipped = results.tests.filter((t) => t.passed === null).length;

  console.log(`✓ Pasados: ${passed}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`⊘ Omitidos: ${skipped}`);

  // Tabla de resultados
  console.log("\n%cResultados por Test:", "font-weight: bold;");
  console.table(
    results.tests.map((t) => ({
      Test: t.name,
      Status:
        t.passed === true
          ? "✓ PASS"
          : t.passed === false
            ? "❌ FAIL"
            : "⊘ SKIP",
      Error: t.error || "-",
    })),
  );

  // Recomendaciones
  console.log(
    "\n%c💡 RECOMENDACIONES",
    "font-size: 12px; font-weight: bold; color: #006600;",
  );

  if (failed === 0 && passed > 4) {
    console.log(
      "%c✓ TODO PARECE ESTAR BIEN",
      "color: green; font-weight: bold;",
    );
    console.log("Si aún no recibe notificaciones con el navegador cerrado:");
    console.log("  1. Cierra COMPLETAMENTE el navegador (no solo la pestaña)");
    console.log("  2. Espera 10 segundos");
    console.log("  3. Reabre el navegador");
    console.log("  4. El Service Worker debe persistir en background");
  } else {
    console.log(
      "%c⚠️ Hay problemas a resolver:",
      "color: orange; font-weight: bold;",
    );
    results.tests.forEach((t) => {
      if (t.passed === false) {
        console.log(`  • ${t.name}: ${t.error || "Fallo"}`);
      }
    });
  }

  console.log(
    "\n%cℹ️ Full Results (para compartir con soporte):",
    "color: #666; font-style: italic;",
  );
  console.log(JSON.stringify(results, null, 2));

  window.webPushDebugResults = results;
  console.log("\n💾 Resultados guardados en: window.webPushDebugResults");
})();
