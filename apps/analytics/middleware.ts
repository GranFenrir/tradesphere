import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Analytics app - all routes require authentication
// Users without a session are redirected to the main web app's login
export default auth((req) => {
  const isLoggedIn = !!req.auth;

  // Redirect unauthenticated users to main app's login
  if (!isLoggedIn) {
    // Redirect to main web app's login page
    const loginUrl = new URL("/login", "http://localhost:3000");
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
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
