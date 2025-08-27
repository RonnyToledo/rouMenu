import type React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

export default function EmailTemplate({
  name,
  email,
  company = "-",
  phone = "-",
  message,
}: EmailTemplateProps) {
  return (
    <div style={styles.container}>
      <div style={styles.emailWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Nuevo Mensaje de Contacto</h1>
          <div style={styles.headerLine}></div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.greeting}>
            <p style={styles.greetingText}>
              Has recibido un nuevo mensaje de contacto desde tu sitio web.
            </p>
          </div>

          {/* Contact Information Cards */}
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Nombre</div>
              <div style={styles.infoValue}>{name}</div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Email</div>
              <div style={styles.infoValue}>{email}</div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Empresa</div>
              <div style={styles.infoValue}>{company}</div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Teléfono</div>
              <a href={`https://wa.me/${phone}`} style={styles.infoValue}>
                {phone}
              </a>
            </div>
          </div>

          {/* Message Section */}
          <div style={styles.messageSection}>
            <div style={styles.messageLabel}>Mensaje</div>
            <div style={styles.messageContent}>{message}</div>
          </div>

          {/* Action Button */}
          <div style={styles.actionSection}>
            <a href={`mailto:${email}`} style={styles.actionButton}>
              Responder Email
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Este mensaje fue enviado desde tu formulario de contacto.
          </p>
          <div style={styles.footerLine}></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#f8fafc",
    padding: "40px 20px",
    minHeight: "100vh",
  },
  emailWrapper: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  header: {
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    padding: "32px",
    textAlign: "center" as const,
  },
  title: {
    color: "#f8fafc",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 16px 0",
    letterSpacing: "-0.025em",
  },
  headerLine: {
    width: "60px",
    height: "4px",
    backgroundColor: "#3b82f6",
    margin: "0 auto",
    borderRadius: "2px",
  },
  content: {
    padding: "40px 32px",
  },
  greeting: {
    marginBottom: "32px",
  },
  greetingText: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.6",
    margin: "0",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  infoCard: {
    backgroundColor: "#f1f5f9",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    wordBreak: "break-word" as const,
  },
  messageSection: {
    marginBottom: "32px",
  },
  messageLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "12px",
  },
  messageContent: {
    backgroundColor: "#f8fafc",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#334155",
    whiteSpace: "pre-wrap" as const,
  },
  actionSection: {
    textAlign: "center" as const,
    marginBottom: "16px",
  },
  actionButton: {
    display: "inline-block",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    padding: "14px 28px",
    borderRadius: "50px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)",
  },
  footer: {
    backgroundColor: "#f8fafc",
    padding: "24px 32px",
    textAlign: "center" as const,
    borderTop: "1px solid #e2e8f0",
  },
  footerText: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 16px 0",
  },
  footerLine: {
    width: "40px",
    height: "2px",
    backgroundColor: "#cbd5e1",
    margin: "0 auto",
    borderRadius: "1px",
  },
};
