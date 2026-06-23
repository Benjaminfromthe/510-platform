import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

function isProtectedRoute(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/admin");
}

export default authMiddleware({
  publicRoutes: [
    "/",
    "/services",
    "/book",
    "/subscriptions",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks/clerk",
    "/api/services",
    "/api/availability",
    "/api/ai/chat",
  ],
  afterAuth(auth, req) {
    if (!auth.userId && isProtectedRoute(req)) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!_next|.*\..*).*)"],
};
