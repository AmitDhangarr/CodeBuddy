import { NextResponse } from "next/server";

function middleware(req) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith("/dashboard");
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

export default middleware;