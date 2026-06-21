import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
import { validatePlatformUrl } from "../../../../lib/validation.js";

const PLATFORM_RULES = {
  github: ["github.com"],
  x: ["twitter.com", "x.com"],
  linkedin: ["linkedin.com"],
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail } = await getUser();
    const { github, x, linkedin } = body;

    for (const [key, url] of Object.entries({ github, x, linkedin })) {
      if (url?.trim()) {
        const err = validatePlatformUrl(url, PLATFORM_RULES[key]);
        if (err) {
          return NextResponse.json({ success: false, message: err }, { status: 400 });
        }
      }
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        github: github,
        x: x,
        linkedin: linkedin,
      })
      .eq("email", userEmail);
    if (error) {
      console.error("Integration update error:", error);
      return NextResponse.json({
        success: false,
        message: "Error while updating integrations.",
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Integrations updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Try again later.",
    }, { status: 500 });
  }
}