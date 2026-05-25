const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, twoStep, loginNotification } = body;

    const isAccountExits = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!isAccountExits) {
      return NextResponse.json({
        success: false,
        message: "user does not exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedPassword = await supabase
      .from("profiles")
      .update({ password: hashedPassword })
      .eq("email", email)
      .single();

    if (!updatedPassword) {
      return NextResponse.json({
        success: false,
        message: "something went wrong while updating password",
      });
    }

    const { data: notification, error: notificationErr } = await supabase
      .from("notifications")
      .update({ twoStep: twoStep, loginNotification: loginNotification })
      .single();

    if (notificationErr) {
      return NextResponse.json({
        success: true,
        message: "notification settings are not updated encountered ",
      });
    }
    return NextResponse.json({
      success: true,
      message: "password has been updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
