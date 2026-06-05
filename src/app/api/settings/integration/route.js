import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { userEmail } = await getUser();
    const { github, x, linkedin } = body;
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