import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Política de privacidad · GesLimpia" };

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de privacidad">
      <h2>1. Responsable del tratamiento</h2>
      <p>
        GesLimpia (la "Plataforma") trata los datos personales que facilitas al
        registrarte y usar el servicio. Para cualquier consulta sobre tus datos
        puedes escribirnos a través de los canales de contacto de la plataforma.
      </p>

      <h2>2. Datos que tratamos</h2>
      <ul>
        <li>Datos de registro: nombre, email, población y rol.</li>
        <li>
          Datos de perfil de limpiadora: descripción, tarifa, servicios y zonas.
        </li>
        <li>Datos de uso: reservas, mensajes y valoraciones.</li>
        <li>Datos de pago gestionados por Stripe (no almacenamos tu tarjeta).</li>
      </ul>

      <h2>3. Finalidad</h2>
      <p>
        Tratamos tus datos para prestar el servicio de conexión, gestionar tu
        suscripción y facilitar la comunicación entre hogares y limpiadoras.
      </p>

      <h2>4. Legitimación</h2>
      <p>
        La base legal es la ejecución del contrato (uso de la plataforma) y tu
        consentimiento.
      </p>

      <h2>5. Derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión,
        oposición, limitación y portabilidad contactando con la plataforma.
      </p>
    </LegalLayout>
  );
}
