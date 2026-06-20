import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protección central de rutas privadas. El rol viaja en el JWT, así que aquí
// (edge, sin BD) podemos decidir el gate de "elige tu rol".
export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;
    const choosingRole = pathname === "/onboarding/rol";

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
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/suscripcion/:path*"],
};
