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

  return (
    <DashboardShell role={user.role as "HOGAR" | "LIMPIADORA"} name={user.name}>
      {children}
    </DashboardShell>
  );
}
