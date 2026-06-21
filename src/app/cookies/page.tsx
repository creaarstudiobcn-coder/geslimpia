import LegalLayout from "@/components/LegalLayout";
import LegalDoc from "@/components/LegalDoc";

export const metadata = {
  title: "Política de Cookies · GesLimpia",
  description:
    "Qué cookies utiliza GesLimpia y cómo gestionar tu consentimiento (RGPD, LOPDGDD y LSSI-CE).",
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies">
      <LegalDoc slug="cookies" />
    </LegalLayout>
  );
}
