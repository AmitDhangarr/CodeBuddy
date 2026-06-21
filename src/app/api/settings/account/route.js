import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabaseClient.js";
import { getPayload } from "../../../../../service/handletoken.js";
import { validateEmail, validatePassword } from "../../../../lib/validation.js";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const cookie = await cookies();
    const token = cookie.get("token");
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const payload = await getPayload(token.value);
    const body = await request.json();
    const { newEmail, newPassword } = body;

    if (!newEmail && !newPassword) {
      return NextResponse.json(
        { success: false, message: "No fields to update." },
        { status: 400 }
      );
    }

    const { data: currentUser, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", payload.email)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const updatePayload = {};

    if (newEmail && newEmail.trim() !== currentUser.email) {
      const emailErr = validateEmail(newEmail);
      if (emailErr) {
        return NextResponse.json({ success: false, message: emailErr }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail.trim())
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { success: false, message: "This email is already in use." },
          { status: 409 }
        );
      }
      updatePayload.email = newEmail.trim();
    }

    if (newPassword) {
      const passErr = validatePassword(newPassword, { required: true });
      if (passErr) {
        return NextResponse.json({ success: false, message: passErr }, { status: 400 });
      }
      updatePayload.password = await bcrypt.hash(newPassword, 10);
    }

    if (!Object.keys(updatePayload).length) {
      return NextResponse.json({
        success: true,
        message: "No changes to save.",
      });
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", currentUser.id);

    if (error) {
      return NextResponse.json(
        { success: false, message: "Something went wrong while updating account." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
