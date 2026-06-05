import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { userEmail } = await getUser();
    const { fullName, handle, bio, github, lookingFor } = body;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: fullName,
        handle: handle,
        bio: bio,
        github: github,
        looking_for: lookingFor,
      })
      .eq("email", userEmail);
    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({
        success: false,
        message: "Error while updating the profile.",
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Try again later.",
    }, { status: 500 });
  }
}