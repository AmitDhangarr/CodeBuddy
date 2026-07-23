import { createToken } from "../../../../service/handletoken.js";
import { supabase } from "../../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers.js";
import { render } from "@react-email/components";
import { sendEmailAction } from "../../actions/email.jsx";
import LoginNotification from "../../../components/email_templates/signin_notification.jsx";
import { headers } from "next/headers.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("password")
      .eq("email", email)
      .single();

    if (error || !data) {
      return Response.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 },
      );
    }

    const isMatched = await bcrypt.compare(password, data.password);

    if (!isMatched) {
      return Response.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 },
      );
    }

    const token = await createToken({ email });
    const setCookie = await cookies();

    setCookie.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    const loginTime =
      new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }) + " IST";

    const account_login_template = await render(
      <LoginNotification email={email} loginTime={loginTime} />,
    );

    sendEmailAction(
      email,
      account_login_template,
      `New login detected on your CodeBuddy account`,
    );

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Auth error:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
