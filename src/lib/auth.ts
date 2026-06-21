import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { verifyRecaptcha } from "./recaptcha";

// Estrategia: JWT (sin Prisma adapter). El CredentialsProvider de NextAuth solo
// funciona con JWT, así que para no romper el login email/contraseña NO usamos el
// adapter ni las tablas Account/Session. La cuenta de Google se vincula/crea a mano
// en el callback signIn buscando el User por email.
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleEnabled = !!googleId && !!googleSecret;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Anti-spam: el login pasa por aquí (no por una API propia). Si reCAPTCHA está
        // activo y no valida, lanzamos un error claro que la página de login muestra.
        const recaptcha = await verifyRecaptcha(
          (credentials as Record<string, string>).recaptchaToken,
          "login"
        );
        if (!recaptcha.ok) {
          throw new Error(
            "Verificación de seguridad fallida. Recarga la página e inténtalo de nuevo."
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;
        // Cuentas creadas solo con Google no tienen contraseña: rechazar login por credenciales.
        if (!user.passwordHash) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "HOGAR" | "LIMPIADORA" | null,
          ciudad: user.ciudad,
        };
      },
    }),
    // El provider de Google solo se registra si están las credenciales en el entorno.
    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: googleId!,
            clientSecret: googleSecret!,
          }),
        ]
      : []),
  ],
  callbacks: {
    // Vinculación/creación manual de la cuenta de Google (sin adapter).
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        // Primera vez con Google: creamos la cuenta SIN rol (lo elegirá en /onboarding/rol).
        await prisma.user.create({
          data: {
            email,
            name: user.name ?? "Usuario",
            // passwordHash, role y ciudad quedan null hasta que elija rol.
          },
        });
      }
      // Si ya existía (p.ej. cuenta con email/contraseña), se reutiliza: auto-vinculación
      // por email verificado por Google. La cuenta queda con ambos métodos de acceso.
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // En el primer inicio de sesión cargamos id/role/ciudad reales desde la BD.
      // Para Google, `user` es el perfil OAuth (sin role), así que buscamos por email.
      if (user) {
        const dbUser =
          account?.provider === "google"
            ? await prisma.user.findUnique({
                where: { email: (user.email ?? "").toLowerCase().trim() },
              })
            : await prisma.user.findUnique({ where: { id: (user as any).id } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = (dbUser.role as "HOGAR" | "LIMPIADORA" | null) ?? null;
          token.ciudad = dbUser.ciudad ?? null;
        }
      }
      // Refrescamos el rol desde la BD en dos casos:
      //  1) trigger === "update": el cliente llamó a session.update() tras elegir rol.
      //  2) el token está autenticado pero aún sin rol: RED DE SEGURIDAD. Si update()
      //     fallara (red), el rol ya guardado en BD se recupera en la siguiente petición
      //     y el middleware deja pasar — así nunca se queda rebotando a /onboarding/rol.
      // Coste: 1 query extra SOLO mientras role es null (ventana transitoria del usuario
      // nuevo); en cuanto tiene rol, token.role es truthy y no se vuelve a consultar.
      if (token.id && (trigger === "update" || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = (dbUser.role as "HOGAR" | "LIMPIADORA" | null) ?? null;
          token.ciudad = dbUser.ciudad ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role =
          (token.role as "HOGAR" | "LIMPIADORA" | null) ?? null;
        session.user.ciudad = (token.ciudad as string | null) ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
