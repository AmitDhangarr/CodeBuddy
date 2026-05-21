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

    const { data: favorites, error: favoritesErr } = await supabase
      .from("favourites")
      .insert({
        profile_id: senderId.id,
        target_id: receiverId,
      });

    if (favoritesErr) {
      return NextResponse.json({ error: favoritesErr });
    }
  } catch (error) {
    return NextResponse.json({ error: "internal server error", status: 500 });
  }
  return NextResponse.json({
    success: true,
    message: "profile has been added to favourites",
  });
}
