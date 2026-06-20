import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Sin rol asignado (p.ej. recién entrado con Google) → a elegir rol. El middleware
  // ya lo cubre; este guard además estrecha el tipo de role para DashboardShell.
  if (!user.role) redirect("/onboarding/rol");

  return (
    <DashboardShell role={user.role as "HOGAR" | "LIMPIADORA"} name={user.name}>
      {children}
    </DashboardShell>
  );
}
