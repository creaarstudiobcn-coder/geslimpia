import LegalLayout from "@/components/LegalLayout";
import LegalDoc from "@/components/LegalDoc";

export const metadata = {
  title: "Términos y Condiciones · GesLimpia",
  description:
    "Términos y Condiciones de uso de la plataforma GesLimpia (Dependalium Global Services, S.L.).",
};

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones de Uso">
      <LegalDoc slug="terminos" />
    </LegalLayout>
  );
}
