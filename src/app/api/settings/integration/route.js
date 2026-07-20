import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../lib/supabaseClient";
import { getPayload } from "../../../../../service/handletoken";
import { validateGithubProfileUrl, validatePlatformUrl } from "../../../../lib/validation";

const PLATFORM_CONFIG = {
  github:   { column: "github",   domains: ["github.com"] },
  twitter:  { column: "x",        domains: ["twitter.com", "x.com"] },
  linkedin: { column: "linkedin", domains: ["linkedin.com"] },
};

export async function POST(request) {
  const body = await request.json();
  try {
    const { platform, url } = body;
    const config = PLATFORM_CONFIG[platform];
    if (!config) {
      return NextResponse.json(
        { success: false, error: "Unknown platform." },
        { status: 400 }
      );
    }

    if (url !== null) {
      const validationError = platform === "github"
        ? validateGithubProfileUrl(url, { required: true })
        : validatePlatformUrl(url, config.domains);
      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        );
      }
    }

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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [config.column]: url })
      .eq("email", email);
    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: url ? "Integration connected." : "Integration disconnected.",
        platform,
        url,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Integration save error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}