const { NextResponse } = require("next/server");
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";

export async function POST(request) {
  try {
    const { userEmail } = await getUser();
    const { publicProfile, onlineStatus, discoverable, showLocation } =
      await request.json();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        publicProfile: publicProfile,
        onlineStatus: onlineStatus,
        discoverable: discoverable,
        showLocation: showLocation,
      })
      .eq("email", userEmail)
      .single();

    if (!data) {
      return NextResponse.json({
        success: false,
        message: "error while updating the privacy preferences",
      });
    }

    return NextResponse.json({
      success: true,
      message: "privacy preferences has been updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      message: "something went wrong please try again later",
    });
  }
}
