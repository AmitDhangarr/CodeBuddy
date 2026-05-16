import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/signin", "/signup","/"];
const DASHBOARD = "/"; 

const secret = new TextEncoder().encode(process.env.SECRET_TOKEN); // ← moved outside, created once

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip early if clearly public (perf: avoids JWT work for static-like paths)
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const token = request.cookies.get("token")?.value;

  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      isValidToken = true;
    } catch {
      // invalid / expired token — treat as logged out
    }
  }

  // Logged in → don't show signin/signup, send to dashboard
  if (isValidToken && isPublic) {
    return NextResponse.redirect(new URL(DASHBOARD, request.url));
  }

  // Logged out → protect all non-public routes
  if (!isValidToken && !isPublic) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)" ],
};