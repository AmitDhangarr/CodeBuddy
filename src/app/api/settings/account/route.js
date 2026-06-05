import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { newEmail, newPassword } = body;
    if (!newEmail && !newPassword) {
      return NextResponse.json({
        success: false,
        message: "No fields to update.",
      }, { status: 400 });
    }
    const updatePayload = {};
    if (newEmail) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({
          success: false,
          message: "This email is already in use.",
        }, { status: 409 });
      }
      updatePayload.email = newEmail;
    }
    if (newPassword) {
      updatePayload.password = await bcrypt.hash(newPassword, 10);
    }
    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("email", newEmail);
    if (error) {
      console.error("Account update error:", error);
      return NextResponse.json({
        success: false,
        message: "Something went wrong while updating account.",
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Account updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again later.",
    }, { status: 500 });
  }
}