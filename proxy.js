import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Only these routes are public
  const isPublic =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon");

  // No token + not a public route = redirect to signin
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Has token + on signin/signup = redirect to home
  if (token && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/:path*"],
};