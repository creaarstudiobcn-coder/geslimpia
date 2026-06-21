import LegalLayout from "@/components/LegalLayout";
import LegalDoc from "@/components/LegalDoc";

export const metadata = {
  title: "Política de Privacidad · GesLimpia",
  description:
    "Cómo Dependalium Global Services, S.L. trata los datos personales de quienes usan GesLimpia (RGPD y LOPDGDD).",
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad">
      <LegalDoc slug="privacidad" />
    </LegalLayout>
  );
}
