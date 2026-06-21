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
- **Prisma** + **PostgreSQL** (mismo motor en desarrollo y producción)
- **NextAuth** (credenciales email/contraseña) con dos roles: `HOGAR` y `LIMPIADORA`
- **Stripe** para las suscripciones — Plan Básico 29,99 €/mes y Plan Completo 69 €/mes
- Pensado para desplegar en **Vercel**

---

## Instalación (desarrollo local con Postgres)

El proyecto usa PostgreSQL también en local. Tienes **dos opciones** para tener
una base de datos de desarrollo; elige una.

### Opción A — Postgres local con Docker (recomendada)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# El .env.example ya trae la DATABASE_URL correcta para el Postgres de Docker.

# 3. Levantar Postgres en segundo plano
docker compose up -d

# 4. Aplicar las migraciones y generar el cliente Prisma
npm run db:migrate          # prisma migrate dev

# 5. Cargar datos de ejemplo (8 limpiadoras + 1 hogar demo)
npm run db:seed

# 6. Arrancar en desarrollo
npm run dev
```

### Opción B — Neon (Postgres en la nube, sin Docker)

```bash
npm install
cp .env.example .env

# 1. Crea un proyecto gratis en https://neon.tech y copia su connection string.
# 2. Pégala en DATABASE_URL dentro de .env, p.ej.:
#    DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"

npm run db:migrate
npm run db:seed
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
| `DATABASE_URL` | Cadena de conexión PostgreSQL (Docker/Neon en dev, Vercel/Neon/Supabase en prod) |
| `NEXTAUTH_SECRET` | Secreto para firmar las sesiones (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL base de la app |
| `GOOGLE_CLIENT_ID` | (Opcional) Client ID de OAuth de Google. Si falta, se oculta el login con Google |
| `GOOGLE_CLIENT_SECRET` | (Opcional) Client Secret de OAuth de Google |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | (Opcional) Site key de reCAPTCHA v3. Si falta, la verificación se omite |
| `RECAPTCHA_SECRET_KEY` | (Opcional) Secret key de reCAPTCHA v3 (verificación en servidor) |
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

## Login con Google (OAuth)

Además del email/contraseña, los usuarios pueden entrar con su cuenta de Google.
Es **opcional**: si no configuras las credenciales, el botón "Continuar con Google"
simplemente no aparece y la app funciona con email/contraseña.

### Cómo funciona (resumen técnico)

- Estrategia **JWT** de NextAuth, **sin** Prisma adapter (no hay tablas `Account`/`Session`).
  Esto mantiene intacto el login de credenciales, que en NextAuth solo es compatible con JWT.
- La cuenta de Google se **crea/vincula a mano** en el callback `signIn`, buscando el
  `User` por email. Si el email ya existía (p. ej. cuenta con contraseña), **se vincula
  automáticamente** (Google verifica el email), de modo que la cuenta queda con ambos métodos.
- Como con Google no se elige rol en el registro, la primera vez que alguien entra y
  **aún no tiene rol** se le redirige a **`/onboarding/rol`** (Hogar / Limpiadora + población).
  Hasta que no elige rol, el `middleware.ts` no le deja entrar al resto de la app.
  Tras elegir: Hogar → flujo de suscripción; Limpiadora → onboarding de perfil.

### Crear las credenciales en Google Cloud

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) y crea (o elige) un proyecto.
2. *APIs & Services → OAuth consent screen*: configura la pantalla de consentimiento
   (tipo **External**, nombre de la app, email de soporte). En desarrollo puedes dejarla
   en modo *Testing* y añadir tu cuenta como *test user*.
3. *APIs & Services → Credentials → Create Credentials → OAuth client ID*.
4. Tipo de aplicación: **Web application**.
5. **Authorized redirect URIs** — añade una por cada entorno donde uses la app:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://TU-DOMINIO/api/auth/callback/google`
   (La ruta `/api/auth/callback/google` la gestiona NextAuth automáticamente.)
6. Copia el **Client ID** y el **Client Secret** a `GOOGLE_CLIENT_ID` y
   `GOOGLE_CLIENT_SECRET` en tu `.env` (y en Vercel para producción).

> Cuando pases la pantalla de consentimiento a *Production* en Google, cualquier
> cuenta de Google podrá iniciar sesión; en *Testing* solo las cuentas que añadas
> como *test users*.

---

## reCAPTCHA v3 (anti-spam)

Los formularios públicos de **registro** y **login email/contraseña** están protegidos
con [Google reCAPTCHA v3](https://www.google.com/recaptcha/about/) (invisible, sin casilla).
Es **opcional**: si no configuras las claves, la verificación se omite y los formularios
funcionan igual (útil en local). El flujo de Google OAuth no lo necesita (ya lo protege Google).

### Cómo funciona

- El frontend carga el script de reCAPTCHA **solo** en `/login` y `/register` (hook
  `src/lib/useRecaptcha.ts`), genera un token invisible al enviar y lo manda al backend.
- El servidor lo verifica contra `https://www.google.com/recaptcha/api/siteverify`
  (`src/lib/recaptcha.ts`): exige `success`, que la `action` coincida y `score >= 0.5`.
- **Badge**: se deja **visible** el badge de Google (esquina inferior), que cumple el
  requisito legal de v3 sin texto adicional.
- **Criterio ante fallos**: sin claves → se omite; falta token → se rechaza; Google no
  responde / timeout (5 s) → *fail-open* (no bloquea a usuarios legítimos por un fallo
  transitorio); `success:false` o `score` bajo → *fail-closed* (se rechaza).

### Crear las claves

1. Entra en [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin/create).
2. Tipo: **reCAPTCHA v3**.
3. **Dominios**: añade `geslimpia.es` y `localhost` (para desarrollo).
4. Copia las dos claves a tu `.env` (y a Vercel en producción):
   - **Site key** → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (pública, frontend)
   - **Secret key** → `RECAPTCHA_SECRET_KEY` (privada, servidor)

---

## Scripts

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`prisma generate` + `next build`) |
| `npm run vercel-build` | Build que usa Vercel: aplica migraciones (`migrate deploy`) y construye |
| `npm run start` | Servidor de producción |
| `npm run db:migrate` | Crea/aplica migraciones en desarrollo (`prisma migrate dev`) |
| `npm run db:deploy` | Aplica migraciones pendientes en producción (`prisma migrate deploy`) |
| `npm run db:push` | Sincroniza el esquema sin migración (prototipado rápido) |
| `npm run db:seed` | Carga datos de ejemplo |
| `npm run db:reset` | Resetea la base de datos, aplica migraciones y vuelve a sembrar |

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

> Decisión de diseño: los "enums" se guardan como `String` con valores documentados
> (`HOGAR`/`LIMPIADORA`, `ACTIVA`/`PENDIENTE`/`CANCELADA`, …) en lugar de enums
> nativos de Postgres, porque la app compara strings literales en muchos sitios. Las
> listas (servicios, zonas) se guardan como **JSON string** (ver helpers
> `parseList` / `stringifyList` en `src/lib/constants.ts`).

---

## Despliegue en producción (Vercel + Postgres + Stripe)

Guía paso a paso. El esquema ya usa `provider = "postgresql"` y hay una migración
inicial en `prisma/migrations/`, así que no hay que tocar el código.

### 1. Crear la base de datos Postgres

Elige un proveedor y copia su **connection string** (será tu `DATABASE_URL`):

- **Vercel Postgres**: en el dashboard de Vercel → *Storage* → *Create Database* → Postgres.
  Vercel inyecta las variables automáticamente al proyecto vinculado.
- **Neon**: crea un proyecto en [neon.tech](https://neon.tech) y copia la cadena
  (incluye `?sslmode=require`).
- **Supabase**: *Project Settings → Database → Connection string* (modo *Session*).

### 2. Subir a GitHub e importar en Vercel

1. Sube el repo a GitHub (ya hecho si seguiste la guía).
2. En [vercel.com/new](https://vercel.com/new) → *Import* el repositorio.
3. Framework: **Next.js** (autodetectado). No cambies el *Build Command*: Vercel
   usará automáticamente el script **`vercel-build`** del `package.json`, que ejecuta
   `prisma migrate deploy` (aplica las migraciones a la BD de producción) antes de
   `next build`. No necesitas configurar nada más de build.

### 3. Configurar las variables de entorno en Vercel

En *Project → Settings → Environment Variables*, añade (entorno **Production**):

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | La cadena del paso 1 (con `?sslmode=require` si aplica) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://TU-DOMINIO` |
| `NEXT_PUBLIC_APP_URL` | `https://TU-DOMINIO` |
| `STRIPE_SECRET_KEY` | `sk_live_...` (paso 4) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (paso 4) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (paso 5) |
| `STRIPE_PRICE_BASICO` | `price_...` del plan Básico (paso 4) |
| `STRIPE_PRICE_COMPLETO` | `price_...` del plan Completo (paso 4) |
| `GOOGLE_CLIENT_ID` | (Opcional) Client ID de OAuth de Google — ver "Login con Google" |
| `GOOGLE_CLIENT_SECRET` | (Opcional) Client Secret de OAuth de Google |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | (Opcional) Site key de reCAPTCHA v3 — ver "reCAPTCHA v3" |
| `RECAPTCHA_SECRET_KEY` | (Opcional) Secret key de reCAPTCHA v3 |

> Si dejas las claves de Stripe sin rellenar, la app arranca igual pero el checkout
> funciona en **modo demo** (sin cobro). Para cobrar de verdad, completa los pasos 4 y 5.
>
> Para el login con Google en producción, añade `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
> y registra el redirect URI `https://TU-DOMINIO/api/auth/callback/google` en Google Cloud
> (ver sección "Login con Google"). Si los dejas vacíos, el botón de Google no se muestra.

### 4. Crear los productos y precios en Stripe (modo live)

1. Pasa el dashboard a **modo live** (toggle arriba a la derecha).
2. *Products* → crea dos productos con **precio recurrente mensual**:
   - **Básico**: 29,99 € / mes → copia el **Price ID** (`price_...`) a `STRIPE_PRICE_BASICO`.
   - **Completo**: 69,00 € / mes → copia el **Price ID** a `STRIPE_PRICE_COMPLETO`.
3. *Developers → API keys*: copia `sk_live_...` y `pk_live_...` a las variables.

### 5. Configurar el webhook de Stripe

1. *Developers → Webhooks → Add endpoint*.
2. URL: `https://TU-DOMINIO/api/stripe/webhook`
3. Selecciona estos eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el **Signing secret** (`whsec_...`) a `STRIPE_WEBHOOK_SECRET` en Vercel y
   vuelve a desplegar (*Redeploy*) para que tome la variable.

### 6. Dominio propio

1. En *Project → Settings → Domains*, añade tu dominio (p.ej. `geslimpia.es`).
2. En tu proveedor DNS, crea los registros que indica Vercel:
   - Apex (`geslimpia.es`): registro **A** → `76.76.21.21` (o el que muestre Vercel).
   - `www`: registro **CNAME** → `cname.vercel-dns.com`.
3. Cuando el dominio esté verificado, actualiza `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL`
   a `https://TU-DOMINIO` y vuelve a desplegar.

### 7. Datos iniciales en producción

Las migraciones se aplican solas en cada deploy (`vercel-build`). Para los datos:

- **Opción A — sembrar datos demo** (8 limpiadoras + 1 hogar). Desde tu máquina,
  apuntando a la BD de producción (¡cuidado, el seed borra los datos existentes!):

  ```bash
  DATABASE_URL="<cadena_de_produccion>" npm run db:seed
  ```

- **Opción B — empezar vacío**: no ejecutes el seed. El primer usuario se crea
  desde la propia web en `/register`. Las limpiadoras completan su perfil en el
  onboarding tras registrarse.

---

## Nota legal

Los textos legales (`/terminos`, `/privacidad`, `/cookies`, `/aviso-legal`) son **orientativos**. El texto legal definitivo debe redactarlo un profesional. En todos ellos se recalca que GesLimpia es una **plataforma de conexión**, que **no emplea** a las limpiadoras y que **no presta** el servicio de limpieza.

<!-- Despliegue: versión con login con Google (NextAuth). -->

