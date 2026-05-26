const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";

export async function POST(request) {
  try {
    const { skillHave, skillNeed } = await request.json();
    const { userEmail } = await getUser();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        skillhave: skillHave,
        skillneed: skillNeed,
      })
      .eq("email", getUser)
      .single();

    if (!data) {
      return NextResponse.json({
        success: true,
        message: "error while updating the skillsHave and skillNeed",
      });
    }

    return NextResponse.json({
      success: true,
      message: "skillsHave and SkillNeed has been updated",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong , try again later",
    });
  }
}
