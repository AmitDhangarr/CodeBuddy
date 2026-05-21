import { NextResponse } from "next/server";
import { supabase, supbase } from "../../../lib/supabaseClient.js";
import { cookies } from "next/headers";
import { getPayload } from "../../../../service/handletoken.js";
export async function POST(request) {
  try {
    const data = await request.json();
    const receiverId = data.receiverId;

    const cookie = await cookies();
    const token = cookie.get("token");
    const payload = await getPayload(token.value);

    const { data: senderId, error: senderIdErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", payload.email)
      .single();

    if (senderIdErr) {
      return NextResponse.json({ error: senderIdErr });
    }

    const { data: connection, error: connectionErr } = await supabase
      .from("connections")
      .insert({
        requester_id: senderId.id,
        receiver_id: receiverId,
        status: "pending",
      });

    if (connectionErr) {
      return NextResponse.json({ error: connectionErr });
    }
  } catch (error) {
    return NextResponse.json({ error: "internal server error", status: 500 });
  }
  return NextResponse.json({success:true,message:"connection has been sent"})
}
