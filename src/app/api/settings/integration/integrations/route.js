import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../../lib/supabaseClient";
import { getPayload } from "../../../../../../service/handletoken";

const PLATFORM_CONFIG = {
  github:   { column: "github",   domains: ["github.com"] },
  twitter:  { column: "x",        domains: ["twitter.com", "x.com"] },
  linkedin: { column: "linkedin", domains: ["linkedin.com"] },
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    let email;
    try {
      const payload = await getPayload(token.value);
      email = payload?.email;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token." },
        { status: 401 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const columns = Object.values(PLATFORM_CONFIG)
      .map((c) => c.column)
      .join(", ");

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select(columns)
      .eq("email", email)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 400 }
      );
    }

    const integrations = Object.fromEntries(
      Object.entries(PLATFORM_CONFIG).map(([platform, config]) => {
        const url = data?.[config.column] ?? null;
        return [platform, { connected: Boolean(url), url }];
      })
    );

    return NextResponse.json(
      { success: true, integrations },
      { status: 200 }
    );
  } catch (err) {
    console.error("Integration fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}