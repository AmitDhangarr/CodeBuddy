import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST() {
  const cookie = await cookies();
  cookie.delete("token");
  return NextResponse.json({
    success: true,
    message: "user has been signed out",
  });
}
