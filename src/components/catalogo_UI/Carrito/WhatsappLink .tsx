/**
 * Abre un link de WhatsApp simulando el click en un <a>.
 * Evita el bloqueo de popups que sufre window.open() tras un await.
 */
export function openWhatsAppLink(phone: number | undefined, message: string) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
