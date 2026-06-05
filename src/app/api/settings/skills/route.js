import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { skillHave, skillNeed } = body;
    const { userEmail } = await getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        skills_have: skillHave,
        skills_need: skillNeed,
      })
      .eq("email", userEmail);
    if (error) {
      console.error("Skills update error:", error);
      return NextResponse.json({
        success: false,
        message: "Error while updating skills.",
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Skills updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Try again later.",
    }, { status: 500 });
  }
}