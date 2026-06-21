import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminHeader, Badge } from "@/components/admin/AdminUi";
import SupportChat from "@/components/admin/SupportChat";

export default async function AdminChatUsuario({
  params,
}: {
  params: { userId: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || user.role === "ADMIN") notFound();

  const messages = await prisma.supportMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <AdminHeader
        title={user.name}
        subtitle={`${user.email} · ${user.role}`}
        back={{ href: "/admin/mensajes", label: "Mensajes" }}
      />
      {!user.active && (
        <div className="mb-4">
          <Badge tone="red">Cuenta desactivada</Badge>
        </div>
      )}
      <SupportChat
        mode="admin"
        userId={user.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          fromAdmin: m.fromAdmin,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
