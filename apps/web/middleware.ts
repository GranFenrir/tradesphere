import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users to login (except for public routes)
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
