# GesLimpia 🧽💧

**Plataforma de conexión** entre hogares y limpiadoras profesionales independientes en **Mataró y el Maresme**.

> ⚠️ **Modelo de negocio:** GesLimpia **no es una empresa de limpieza** ni una agencia. Es una plataforma que conecta hogares con limpiadoras independientes.
>
> - Los **hogares** pagan una **cuota mensual de suscripción** por *usar la plataforma* y contactar limpiadoras.
> - La cuota **NO incluye** el precio de la limpieza: **cada limpiadora fija su propia tarifa** y se paga directamente entre hogar y limpiadora.
> - Las **limpiadoras se registran gratis** y reciben solicitudes.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **SQLite** (desarrollo) / **PostgreSQL** (producción)
- **NextAuth** (credenciales email/contraseña) con dos roles: `HOGAR` y `LIMPIADORA`
- **Stripe** (modo test) para las suscripciones — Plan Básico 29,99 €/mes y Plan Completo 69 €/mes
- Pensado para desplegar en **Vercel**

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# (en desarrollo el .env por defecto ya usa SQLite y un secreto de prueba)

# 3. Crear la base de datos y generar el cliente Prisma
npm run db:push

# 4. Cargar datos de ejemplo (8 limpiadoras + 1 hogar demo)
npm run db:seed

# 5. Arrancar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Cuentas de prueba (tras el seed)

| Rol        | Email                          | Contraseña    |
|------------|--------------------------------|---------------|
| Hogar      | `hogar@demo.geslimpia.es`      | `password123` |
| Limpiadora | `marta@demo.geslimpia.es`      | `password123` |

El hogar demo ya tiene una **suscripción activa** (plan Completo), así que puedes entrar directamente a buscar limpiadoras.

---

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | SQLite en dev (`file:./dev.db`) o PostgreSQL en producción |
| `NEXTAUTH_SECRET` | Secreto para firmar las sesiones (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL base de la app |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (modo test) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe |
| `STRIPE_PRICE_BASICO` | ID de precio recurrente del plan Básico (29,99 €/mes) |
| `STRIPE_PRICE_COMPLETO` | ID de precio recurrente del plan Completo (69 €/mes) |
| `NEXT_PUBLIC_APP_URL` | URL pública (para los redirects de Stripe Checkout) |

### Modo demo vs. Stripe real

- **Sin claves de Stripe** (o con `*_placeholder`): el checkout funciona en **modo demo** y activa la suscripción de forma simulada (sin cobro). Ideal para desarrollo.
- **Con claves reales**: se crea una **Checkout Session** de Stripe y la suscripción se activa vía **webhook** (`/api/stripe/webhook`) y/o al volver a la página de éxito.

Para probar Stripe en local:

```bash
# 1. Crea en el dashboard de Stripe (modo test) dos productos con precio
#    recurrente mensual: 29,99 € y 69,00 €. Copia sus price IDs al .env.
# 2. Reenvía los webhooks a tu localhost:
stripe listen --forward-to localhost:3000/api/stripe/webhook
# 3. Copia el whsec_... que imprime a STRIPE_WEBHOOK_SECRET en .env
```

Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

---

## Scripts

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`prisma generate` + `next build`) |
| `npm run start` | Servidor de producción |
| `npm run db:push` | Aplica el esquema Prisma a la base de datos |
| `npm run db:seed` | Carga datos de ejemplo |
| `npm run db:reset` | Resetea la base de datos y vuelve a sembrar |

---

## Estructura

```
src/
├── app/
│   ├── page.tsx                  # Landing pública
│   ├── login / register          # Autenticación
│   ├── onboarding/               # Perfil de limpiadora (tras registro)
│   ├── suscripcion/              # Elección de plan + Stripe Checkout
│   ├── dashboard/                # Panel (hogar y limpiadora)
│   │   ├── page.tsx              #   Buscar limpiadoras / Solicitudes
│   │   ├── reservas/             #   Mis reservas (+ valoraciones)
│   │   ├── mensajes/             #   Chat (lista + hilo)
│   │   ├── favoritas/            #   Favoritas (hogar)
│   │   ├── plan/                 #   Gestión de suscripción (hogar)
│   │   ├── valoraciones/         #   Reseñas recibidas (limpiadora)
│   │   └── perfil/               #   Perfil y tarifa (limpiadora)
│   ├── (terminos|privacidad|cookies|aviso-legal)/   # Páginas legales
│   └── api/                      # Rutas API (auth, bookings, messages, …)
├── components/                   # Logo, Header, Footer, UI, DashboardShell
└── lib/                          # prisma, auth, stripe, session, constants
prisma/
├── schema.prisma                 # Modelo de datos
└── seed.ts                       # Datos de ejemplo
```

### Modelo de datos

`User` · `CleanerProfile` · `Subscription` · `Booking` · `Message` · `Review` · `Favorite`

> En SQLite los enums y arrays no son nativos: los "enums" se guardan como `String`
> con valores documentados y las listas (servicios, zonas) como **JSON string**
> (ver helpers `parseList` / `stringifyList` en `src/lib/constants.ts`).

---

## Despliegue en Vercel

1. Sube el repositorio a GitHub e impórtalo en Vercel.
2. Cambia el `datasource` de Prisma a **PostgreSQL** y usa una base de datos gestionada (Vercel Postgres, Supabase o Neon):

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Configura **todas** las variables de entorno del `.env.example` en el panel de Vercel (con las claves reales de Stripe).
4. En Stripe, crea un **webhook** que apunte a `https://TU-DOMINIO/api/stripe/webhook` y guarda su secreto en `STRIPE_WEBHOOK_SECRET`.
5. El `build` ya ejecuta `prisma generate`. Tras el primer deploy, aplica el esquema con `prisma db push` (o migraciones) contra la base de datos de producción.

---

## Nota legal

Los textos legales (`/terminos`, `/privacidad`, `/cookies`, `/aviso-legal`) son **orientativos**. El texto legal definitivo debe redactarlo un profesional. En todos ellos se recalca que GesLimpia es una **plataforma de conexión**, que **no emplea** a las limpiadoras y que **no presta** el servicio de limpieza.
