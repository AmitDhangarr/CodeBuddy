const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";

export async function POST(request) {
  try {
    const { userEmail } = await getUser();
    const { github, x, linkedin } = await request.json();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        github: github,
        x: x,
        linkedin: linkedin,
      })
      .eq("email", userEmail)
      .single();

    if (!data) {
      return NextResponse.json({
        success: false,
        message: "encountered error while updating integration",
      });
    }

    return NextResponse.json({
      success: true,
      message: "integration has been updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "something went wrong ! try again later",
    });
  }
}
