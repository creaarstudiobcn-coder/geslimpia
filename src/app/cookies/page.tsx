import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Política de cookies · GesLimpia" };

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de cookies">
      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies son pequeños archivos que se almacenan en tu dispositivo al
        navegar. Permiten recordar información sobre tu visita.
      </p>

      <h2>2. Cookies que utilizamos</h2>
      <ul>
        <li>
          <strong>Técnicas / de sesión:</strong> imprescindibles para mantener tu
          sesión iniciada (autenticación). No requieren consentimiento.
        </li>
        <li>
          <strong>De terceros:</strong> el proveedor de pagos (Stripe) puede
          establecer cookies para prevenir el fraude durante el checkout.
        </li>
      </ul>

      <h2>3. Gestión</h2>
      <p>
        Puedes configurar o eliminar las cookies desde la configuración de tu
        navegador. Deshabilitar las cookies técnicas puede impedir el correcto
        funcionamiento de la plataforma.
      </p>
    </LegalLayout>
  );
}
