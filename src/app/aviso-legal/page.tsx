import LegalLayout from "@/components/LegalLayout";
import LegalDoc from "@/components/LegalDoc";

export const metadata = {
  title: "Aviso Legal · GesLimpia",
  description:
    "Datos identificativos del titular de GesLimpia conforme al artículo 10 de la LSSI-CE.",
};

export default function AvisoLegalPage() {
  return (
    <LegalLayout title="Aviso Legal">
      <LegalDoc slug="aviso-legal" />
    </LegalLayout>
  );
}
