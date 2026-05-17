import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const cookie = await cookies();
  const token = cookie.get("token");
  if (token) {
    return NextResponse.json({ token });
  } else {
    return NextResponse.json({ error: "token not found" });
  }
}
