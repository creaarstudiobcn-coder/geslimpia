import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Aviso legal · GesLimpia" };

export default function AvisoLegalPage() {
  return (
    <LegalLayout title="Aviso legal">
      <h2>1. Identificación</h2>
      <p>
        El presente aviso legal regula el uso del sitio web y la plataforma
        GesLimpia. Los datos identificativos del titular (denominación social,
        NIF y domicilio) deben completarse con la información real del operador.
      </p>

      <h2>2. Condición de plataforma de conexión</h2>
      <p>
        GesLimpia es un <strong>servicio de la sociedad de la información</strong>{" "}
        que actúa como intermediario tecnológico entre hogares y limpiadoras
        profesionales independientes.{" "}
        <strong>
          No es una empresa de limpieza, no emplea a las limpiadoras ni presta el
          servicio de limpieza.
        </strong>
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        Los contenidos, marca y diseño de la plataforma están protegidos por los
        derechos de propiedad intelectual e industrial correspondientes.
      </p>

      <h2>4. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier
        controversia, las partes se someten a los juzgados y tribunales que
        correspondan conforme a la normativa vigente.
      </p>
    </LegalLayout>
  );
}
