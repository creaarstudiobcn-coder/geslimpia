import { requireAdmin } from "@/lib/admin";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Panel de administración · GesLimpia",
  robots: { index: false, follow: false },
};

// El panel siempre se renderiza en el servidor por petición (datos en vivo + sesión).
// Evita además que el build intente prerenderizar estas páginas.
export const dynamic = "force-dynamic";

// Toda la sección /admin pasa por aquí: requireAdmin() verifica el rol en el
// SERVIDOR (además del middleware). Si no es admin → notFound (404).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return <AdminShell name={admin.name}>{children}</AdminShell>;
}
