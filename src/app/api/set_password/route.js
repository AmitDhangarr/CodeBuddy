import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const body = await request.json();
  const { email, newPassword } = body;

 
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from("profiles")
    .update({ password: hashedPassword })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ success: false, message: "Failed to update password" });
  }

  return NextResponse.json({ success: true, message: "Password updated successfully" });
}