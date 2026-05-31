import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient.js";
import  getUser  from "../../../../utils/getuser.js";

const ALLOWED_STATUSES = ["accepted", "declined", "blocked", "unblocked"];

export async function POST(request) {
  try {
    const { userEmail } = await getUser();
    const { receiverId, status } = await request.json();
   console.log(receiverId);
   
    if (!receiverId) {
      return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase
      .from("connections")
      .update({status:status})
      .eq("to_user_id", receiverId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Connection has been ${status}`,
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}