import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";
import { validateGithubProfileUrl, validatePlatformUrl } from "../../../../lib/validation";

// Maps each platform to the column it's saved into on `profiles`.
// Adjust column names here if your schema differs.
const PLATFORM_CONFIG = {
  github:   { column: "github_url",   domains: ["github.com"] },
  twitter:  { column: "twitter_url",  domains: ["twitter.com", "x.com"] },
  linkedin: { column: "linkedin_url", domains: ["linkedin.com"] },
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

    // url === null means "disconnect" — clear the column, skip validation.
    if (url !== null) {
      const validationError = platform === "github"
        ? validateGithubProfileUrl(url, { required: true }) // profile link, e.g. github.com/username — not a repo link
        : validatePlatformUrl(url, config.domains);

      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        );
      }
    }

    // ── Identify the logged-in user ────────────────────────────
    // NOTE: swap this for whatever your other /api/settings/* routes
    // (account, profile, skills, privacy) already use to resolve the
    // current user, so this route stays consistent with them.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    // ── Save straight onto the profile row ─────────────────────
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [config.column]: url })
      .eq("id", user.id);

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