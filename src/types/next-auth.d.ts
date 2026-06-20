import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // null mientras el usuario (p.ej. recién entrado con Google) no ha elegido rol.
      role: "HOGAR" | "LIMPIADORA" | null;
      ciudad: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "HOGAR" | "LIMPIADORA" | null;
    ciudad: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "HOGAR" | "LIMPIADORA" | null;
    ciudad: string | null;
  }
}
