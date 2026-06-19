import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "HOGAR" | "LIMPIADORA";
      ciudad: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "HOGAR" | "LIMPIADORA";
    ciudad: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "HOGAR" | "LIMPIADORA";
    ciudad: string;
  }
}
