import { NextResponse } from "next/server";

export async function POST(req) {
  const { token } = await req.json();  
  const res = NextResponse.json({ auth: true });

  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
