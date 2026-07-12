import type { CompraInterface } from "@/types/interfaces_Cart";
import { smartRound } from "@/functions/precios";
import {
  discountLabel,
  getApplicableDiscount,
  getVariantBasePrice,
} from "@/lib/discountUtils";
import { buildCartTitle } from "@/lib/variantUtils";

type WhatsAppMessageOptions = {
  moneda: string;
  isModification: boolean;
  isAfiliateCode: boolean;
  adminOrderUid?: string;
};

/**
 * Arma el texto del mensaje de WhatsApp para un pedido.
 * Función pura: no toca contexto ni DOM, así es testeable sola.
 */
export function buildWhatsAppOrderMessage(
  order: CompraInterface,
  orderId: number,
  {
    moneda,
    isModification,
    isAfiliateCode,
    adminOrderUid,
  }: WhatsAppMessageOptions,
): string {
  const subtotal = smartRound(order.total);
  const discountAmount = smartRound(subtotal * (order.code.discount / 100));
  const total = smartRound(
    subtotal - discountAmount + smartRound(order.shipping),
  );

  const lines: string[] = [
    `🛒 *SOLICITUD DE ${isModification ? "MODIFICACIÓN" : "NUEVO"} DE PEDIDO*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📋 *Información del Pedido*`,
    `• ID de Venta: *#${orderId}*`,
    `• Cliente: ${order.people}`,
    `• Método de envío: ${order.lugar}`,
  ];

  if (order.direccion) lines.push(`• Dirección: ${order.direccion}`);
  if (order.descripcion) lines.push(`• Aclaración: ${order.descripcion}`);

  lines.push(``, `📦 *Productos*`, `──────────────────────`);

  order.pedido.forEach((producto, index) => {
    const quantity = producto.selected_variant?.Cant || 0;
    if (quantity <= 0) return;

    const unitPrice = producto.selected_variant?.price || 0;
    const packaging = producto.selected_variant?.embalaje || 0;
    const lineSubtotal = ((unitPrice + packaging) * quantity).toFixed(2);
    const activeDiscount = getApplicableDiscount(
      producto.selected_variant,
      quantity,
    );
    const baseUnitPrice = getVariantBasePrice(producto.selected_variant);

    lines.push(
      `${index + 1}. ${buildCartTitle(producto.title, producto.selected_variant)}`,
      `   Cantidad: x${quantity} — Precio unitario: ${unitPrice.toFixed(2)} ${moneda}`,
    );

    if (activeDiscount) {
      lines.push(`   Descuento aplicado: ${discountLabel(activeDiscount)}`);
    } else if (baseUnitPrice > unitPrice) {
      lines.push(`   Precio base: ${baseUnitPrice.toFixed(2)} ${moneda}`);
    }

    if (packaging > 0) {
      lines.push(`   Embalaje: ${packaging.toFixed(2)} ${moneda} por unidad`);
    }

    lines.push(`   Subtotal: ${lineSubtotal} ${moneda}`);
  });

  lines.push(
    `──────────────────────`,
    ``,
    `💰 *Resumen de Pago*`,
    `• Subtotal: *${subtotal.toFixed(2)} ${moneda}*`,
  );

  if (order.code.discount > 0) {
    lines.push(`• Descuento: *-${discountAmount.toFixed(2)} ${moneda}*`);
  }
  if (order.lugar !== "Local") {
    lines.push(
      `• Costo de domicilio: $${smartRound(order.shipping).toFixed(2)}`,
    );
  }

  lines.push(
    `• Total de la orden: *${total.toFixed(2)} ${moneda}*`,
    `• Moneda: ${order.moneda}`,
  );

  if (order.code.name) {
    lines.push(
      `• Código de ${isAfiliateCode ? "Afiliado" : "Descuento"}: *${order.code.name}*`,
    );
  }

  lines.push(`• Numero de telefono: *${order.phonenumber}*`);

  if (adminOrderUid) {
    lines.push(
      ``,
      `🔗 *Enlace del pedido:*`,
      `https://rouadmin.vercel.app/orders/${adminOrderUid}`,
    );
  }

  lines.push(
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `_Gracias por confiar en nosotros._ 🙏`,
  );

  return lines.join("\n");
}
