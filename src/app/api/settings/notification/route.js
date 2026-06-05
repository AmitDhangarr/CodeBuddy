import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import getUser from "../../../../utils/getuser.js";
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { userEmail } = await getUser();
    const {
      match,
      connect,
      message,
      digest,
      views,
    } = body.preferences ?? body;
    const { error } = await supabase
      .from("profiles")
      .update({
        notif_match: match,
        notif_connect: connect,
        notif_message: message,
        notif_digest: digest,
        notif_views: views,
      })
      .eq("email", userEmail);
    if (error) {
      console.error("Notifications update error:", error);
      return NextResponse.json({
        success: false,
        message: "Error while updating notification preferences.",
      }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Notification preferences saved.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again later.",
    }, { status: 500 });
  }
}