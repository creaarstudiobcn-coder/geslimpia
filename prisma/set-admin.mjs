// Marca un usuario EXISTENTE como ADMIN. Ejecución MANUAL (no hay endpoint público).
//
//   Local:        ADMIN_EMAIL=dependalium@gmail.com node prisma/set-admin.mjs
//   Producción:   DATABASE_URL="<url-de-neon>" ADMIN_EMAIL=dependalium@gmail.com node prisma/set-admin.mjs
//
// El usuario debe haberse registrado antes (con email o con Google).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = (process.env.ADMIN_EMAIL || process.argv[2] || "")
  .toLowerCase()
  .trim();

if (!email) {
  console.error(
    "Falta el email. Uso: ADMIN_EMAIL=tu@email node prisma/set-admin.mjs"
  );
  process.exit(1);
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  console.error(
    `No existe ningún usuario con email "${email}". Regístrate primero en la web y vuelve a ejecutar.`
  );
  await prisma.$disconnect();
  process.exit(1);
}

const updated = await prisma.user.update({
  where: { email },
  data: { role: "ADMIN", active: true },
});

console.log(`✓ ${updated.email} ahora es ADMIN. Accede en /admin.`);
await prisma.$disconnect();
