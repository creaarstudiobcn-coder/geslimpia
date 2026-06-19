import LegalLayout from "@/components/LegalLayout";

export const metadata = { title: "Términos y condiciones · GesLimpia" };

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y condiciones">
      <h2>1. Objeto</h2>
      <p>
        GesLimpia es una plataforma tecnológica de conexión que pone en contacto
        a hogares con limpiadoras profesionales independientes en Mataró y el
        Maresme. GesLimpia <strong>no es una empresa de limpieza</strong>, no
        emplea a las limpiadoras y no presta directamente el servicio de
        limpieza.
      </p>

      <h2>2. Naturaleza del servicio</h2>
      <p>
        La cuota mensual que abonan los hogares corresponde exclusivamente al{" "}
        <strong>uso de la plataforma</strong> y a la posibilidad de contactar
        limpiadoras según el plan contratado. Esta cuota{" "}
        <strong>no incluye</strong> el precio de la limpieza, que fija libremente
        cada limpiadora y se abona directamente a ella.
      </p>

      <h2>3. Relación entre usuarios</h2>
      <p>
        El acuerdo de prestación del servicio de limpieza se establece
        directamente entre el hogar y la limpiadora. GesLimpia no es parte de
        dicho acuerdo ni responde de su cumplimiento, calidad o precio.
      </p>

      <h2>4. Obligaciones de los usuarios</h2>
      <ul>
        <li>Facilitar información veraz y mantenerla actualizada.</li>
        <li>Utilizar la plataforma de forma lícita y respetuosa.</li>
        <li>No suplantar la identidad de terceros.</li>
      </ul>

      <h2>5. Suscripciones y pagos</h2>
      <p>
        Los pagos de la cuota de acceso se gestionan a través de Stripe. Los
        planes son sin permanencia y pueden cancelarse en cualquier momento desde
        el panel del usuario.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        GesLimpia actúa como mero intermediario tecnológico y no se hace
        responsable de los daños derivados de la relación entre hogar y
        limpiadora.
      </p>
    </LegalLayout>
  );
}
