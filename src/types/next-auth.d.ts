import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // null mientras el usuario (p.ej. recién entrado con Google) no ha elegido rol.
      role: "HOGAR" | "LIMPIADORA" | "ADMIN" | null;
      ciudad: string | null;
      // Momento de emisión del JWT (segundos epoch). Sirve para descartar las
      // sesiones anteriores a un cambio de contraseña; ver lib/session.ts.
      tokenIssuedAt: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "HOGAR" | "LIMPIADORA" | "ADMIN" | null;
    ciudad: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "HOGAR" | "LIMPIADORA" | "ADMIN" | null;
    ciudad: string | null;
  }
}
