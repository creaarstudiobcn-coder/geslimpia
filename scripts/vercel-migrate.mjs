// Aplica las migraciones en el build de Vercel usando la conexión DIRECTA de
// Neon (el mismo host SIN el sufijo "-pooler").
//
// Por qué: `prisma migrate deploy` adquiere un advisory lock de Postgres para
// evitar migraciones concurrentes. Ese lock NO se mantiene a través del pooler
// (PgBouncer en modo transacción, que reparte cada sentencia en una conexión
// distinta), así que el build falla con P1002 "Timed out trying to acquire a
// postgres advisory lock". La conexión directa sí lo soporta.
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("vercel-migrate: falta DATABASE_URL");
  process.exit(1);
}

// Endpoint directo de Neon = host pooled sin "-pooler". Si ya es directo, el
// replace no cambia nada y sigue funcionando.
const directUrl = url.replace("-pooler.", ".");
const env = { ...process.env, DATABASE_URL: directUrl };

const INTENTOS = 3;
for (let i = 1; i <= INTENTOS; i++) {
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env });
    process.exit(0);
  } catch {
    console.error(`vercel-migrate: intento ${i}/${INTENTOS} falló`);
    // Reintento por si el compute de Neon estaba dormido (cold start).
    if (i < INTENTOS) execSync("sleep 5");
  }
}
console.error("vercel-migrate: no se pudieron aplicar las migraciones");
process.exit(1);
