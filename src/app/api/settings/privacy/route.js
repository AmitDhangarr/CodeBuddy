import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { userEmail } = await getUser();
    const { publicProfile, onlineStatus, discoverable, showLocation } =
      body.privacyPreferences ?? body;
    const { error } = await supabase
      .from("profiles")
      .update({
        private: !publicProfile,
        online: onlineStatus,
        location_preference: showLocation,
      })
      .eq("email", userEmail);
    if (error) {
      console.error("Privacy update error:", error);
      return NextResponse.json({
        success: false,
        message: "Error while updating privacy preferences.",
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Privacy preferences updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again later.",
    }, { status: 500 });
  }
}