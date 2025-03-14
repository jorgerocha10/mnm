import { auth } from "@/auth";

export default auth;

// See https://nextjs.org/docs/app/building-your-application/routing/middleware
export const config = {
  // Protect all admin routes except signin
  matcher: [
    "/admin/:path*", 
    "/((?!admin/signin|api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 