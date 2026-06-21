import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/ui";
import SupportChat from "@/components/admin/SupportChat";

// "Mensajes del equipo": chat de soporte del usuario con el equipo de GesLimpia.
export default async function SoportePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const messages = await prisma.supportMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <PageTitle
        title="Mensajes del equipo"
        subtitle="¿Necesitas ayuda? Habla directamente con el equipo de GesLimpia."
      />
      <div className="max-w-2xl">
        <SupportChat
          mode="user"
          initialMessages={messages.map((m) => ({
            id: m.id,
            fromAdmin: m.fromAdmin,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
