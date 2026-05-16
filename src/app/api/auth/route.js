import { createToken } from "../../../../service/handletoken.js";
import { supabase } from "../../../lib/supabaseClient.js";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── 1. Validate inputs first ──────────────────────────────────────────
    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // ── 2. Look up user by email ──────────────────────────────────────────
    const { data, error } = await supabase
      .from("profiles")
      .select("password")
      .eq("email", email)
      .single();

    if (error || !data) {
      // Don't reveal whether the email exists or not
      return Response.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // ── 3. Verify password ────────────────────────────────────────────────
    const isMatched = await bcrypt.compare(password, data.password);

    if (!isMatched) {
      return Response.json(
        { success: false, message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // ── 4. Set cookie and return success ──────────────────────────────────
   // signin route — must have await now
  const token = await createToken({ email });
    const setCookie = await cookies();

    setCookie.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return Response.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Auth error:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}