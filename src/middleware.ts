import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protección central de rutas privadas. El rol viaja en el JWT, así que aquí
// (edge, sin BD) podemos decidir el gate de "elige tu rol".
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;
    const choosingRole = pathname === "/onboarding/rol";
    const isAdminArea = pathname.startsWith("/admin");

    // Gate del panel de administrador: solo rol ADMIN. Cualquier otro (hogar,
    // limpiadora, sin rol) se va a la home. La verificación real se repite en el
    // servidor (requireAdmin / getAdminId); esto es la primera barrera (edge).
    if (isAdminArea && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // El admin no participa en el flujo de elección de rol ni en el dashboard de
    // usuario: lo dejamos pasar directamente en su área.
    if (isAdminArea) {
      return NextResponse.next();
    }

    // Autenticado pero sin rol asignado (p.ej. recién entrado con Google):
    // forzamos la elección de rol antes de dejarle usar nada más.
    if (token && !token.role && !choosingRole) {
      return NextResponse.redirect(new URL("/onboarding/rol", req.url));
    }

    // Si ya tiene rol, la pantalla de elección no tiene sentido: al dashboard.
    if (token && token.role && choosingRole) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Requiere sesión activa en todas las rutas del matcher.
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/suscripcion/:path*",
  ],
};
