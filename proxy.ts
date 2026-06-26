import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "envago_admin";
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/em-breve")) return NextResponse.next();

  const hasAdminParam = searchParams.has("admin");
  const hasAdminCookie = request.cookies.has(ADMIN_COOKIE);

  if (hasAdminParam || hasAdminCookie) {
    const response = NextResponse.next();
    if (hasAdminParam && !hasAdminCookie) {
      response.cookies.set(ADMIN_COOKIE, "1", {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
    return response;
  }

  return NextResponse.redirect(new URL("/em-breve", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|logo\\.svg|.*\\..*).*)" ],
};
